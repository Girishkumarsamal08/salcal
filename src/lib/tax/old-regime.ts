import { AdditionalDeductions, FinancialYear, SalaryComponents, SlabCalculationItem, TaxRegimeResult } from './types';
import { getTaxRules } from './tax-rules';
import { calculateHRAExemption } from './hra-intelligence';
import { analyzeEPFContributions } from './epf-intelligence';

/**
 * Calculates Income Tax under the Old Tax Regime for Indian Salaried Employees
 */
export function calculateOldTaxRegime(
  salary: SalaryComponents,
  deductions: AdditionalDeductions,
  fy: FinancialYear = '2024-2025'
): TaxRegimeResult {
  const rules = getTaxRules(fy);
  const oldRules = rules.oldRegime;

  // 1. Gross Salary Components
  const epfAnalysis = analyzeEPFContributions(
    salary.employeePF,
    salary.employerPF,
    deductions.other80CInvestments
  );

  const directSalary =
    salary.basicSalary +
    salary.hraReceived +
    salary.specialAllowance +
    salary.lta +
    salary.bonus +
    salary.otherAllowances;

  const grossSalary = directSalary + epfAnalysis.taxableEmployerPFPerquisite;

  // 2. Exemptions under Section 10 & 16
  const hraExemptionBreakdown = calculateHRAExemption(
    salary.basicSalary,
    salary.hraReceived,
    deductions.rentPaidAnnually,
    deductions.cityCategory
  );
  const hraExemption = hraExemptionBreakdown.exemptAmount;

  // Standard deduction capped at gross salary
  const standardDeduction = Math.min(oldRules.standardDeduction, Math.max(0, grossSalary - hraExemption));
  
  // Professional tax deduction under Section 16(iii)
  const professionalTax = Math.min(Math.max(0, salary.professionalTax), Math.max(0, grossSalary - hraExemption - standardDeduction));

  const totalExemptions = hraExemption + standardDeduction + professionalTax;
  const netSalaryIncome = Math.max(0, grossSalary - totalExemptions);

  // 3. Other Income & Gross Total Income (GTI)
  const otherIncomeTotal = Math.max(0, (deductions.interestIncome || 0) + (deductions.rentalIncome || 0) + (deductions.otherIncome || 0));
  const grossTotalIncome = netSalaryIncome + otherIncomeTotal;

  // 4. Chapter VI-A Deductions
  // Section 80C: EPF + Other 80C capped at ₹1,50,000
  const section80CAllowed = epfAnalysis.allowed80CDeduction;

  // Section 80D: Health Insurance
  const selfLimit = deductions.isSelfSeniorCitizen ? oldRules.maxSection80DSenior : oldRules.maxSection80DRegular;
  const parentsLimit = deductions.parentsAgeCategory === 'senior' ? oldRules.maxSection80DSenior : oldRules.maxSection80DRegular;

  const preventiveCheckup = Math.min(oldRules.maxPreventiveCheckup, Math.max(0, deductions.preventiveHealthCheckup || 0));
  
  // Prevent double counting of checkup
  const selfPremium = Math.max(0, deductions.healthInsuranceSelfFamily || 0);
  const eligibleSelf80D = Math.min(selfLimit, selfPremium + preventiveCheckup);
  
  const parentsPremium = Math.max(0, deductions.healthInsuranceParents || 0);
  const eligibleParents80D = Math.min(parentsLimit, parentsPremium);
  
  const section80DAllowed = eligibleSelf80D + eligibleParents80D;

  // Section 80CCD(1B): Additional NPS
  const section80CCD1BAllowed = Math.min(oldRules.maxSection80CCD1B, Math.max(0, deductions.npsSelfContribution || 0));

  // Section 80CCD(2): Employer NPS contribution up to 14% of Basic
  const maxEmployerNPS = Math.round(salary.basicSalary * rules.newRegime.maxSection80CCD2Percentage);
  const section80CCD2Allowed = Math.min(maxEmployerNPS, Math.max(0, deductions.employerNPSContribution || 0));

  // Section 24(b): Home loan interest for self-occupied
  const section24bAllowed = Math.min(oldRules.maxSection24bSelfOccupied, Math.max(0, deductions.homeLoanInterestSelfOccupied || 0));

  // Section 80E: Education loan interest (no limit)
  const section80EAllowed = Math.max(0, deductions.educationLoanInterest || 0);

  // Savings interest 80TTA (max 10,000)
  const section80TTAAllowed = Math.min(10000, Math.max(0, deductions.savingsInterestDeduction || 0));

  // Other deductions (80G, etc.)
  const otherDeductionsAllowed = Math.max(0, deductions.otherDeductions || 0) + section80TTAAllowed;

  const totalDeductionsSum =
    section80CAllowed +
    section80DAllowed +
    section80CCD1BAllowed +
    section80CCD2Allowed +
    section24bAllowed +
    section80EAllowed +
    otherDeductionsAllowed;

  // Total deductions cannot exceed Gross Total Income
  const finalTotalDeductions = Math.min(grossTotalIncome, totalDeductionsSum);

  // 5. Taxable Income (Rounded to nearest 10 as per Section 288A)
  const rawTaxableIncome = Math.max(0, grossTotalIncome - finalTotalDeductions);
  const taxableIncome = Math.round(rawTaxableIncome / 10) * 10;

  // 6. Tax Calculation using Slabs
  const slabBreakdown: SlabCalculationItem[] = [];
  let remainingIncome = taxableIncome;
  let taxBeforeRebate = 0;

  for (const slab of oldRules.slabs) {
    if (taxableIncome <= slab.min) {
      continue;
    }

    const slabUpper = slab.max ?? Infinity;
    const slabSpan = slabUpper - slab.min;
    const taxableInThisSlab = Math.min(Math.max(0, taxableIncome - slab.min), slabSpan);

    const slabTax = Math.round(taxableInThisSlab * slab.rate);
    taxBeforeRebate += slabTax;

    const slabLabel = slab.max === null
      ? `Above ₹${slab.min.toLocaleString('en-IN')}`
      : `₹${slab.min.toLocaleString('en-IN')} - ₹${slab.max.toLocaleString('en-IN')}`;

    slabBreakdown.push({
      slab: slabLabel,
      taxableAmountInSlab: taxableInThisSlab,
      rate: slab.rate,
      taxAmount: slabTax,
    });
  }

  // 7. Rebate under Section 87A (Taxable income <= ₹5,00,000 gets full rebate up to ₹12,500)
  let rebate87A = 0;
  if (taxableIncome <= oldRules.rebate87AMaxIncome) {
    rebate87A = Math.min(taxBeforeRebate, oldRules.rebate87AMaxAmount);
  }

  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate87A);

  // 8. Surcharge & Marginal Relief
  let surcharge = 0;
  let applicableSurchargeRate = 0;
  for (const st of oldRules.surchargeThresholds) {
    if (taxableIncome > st.min && (st.max === null || taxableIncome <= st.max)) {
      applicableSurchargeRate = st.rate;
      break;
    }
  }

  if (applicableSurchargeRate > 0) {
    surcharge = Math.round(taxAfterRebate * applicableSurchargeRate);
    
    // Marginal relief for surcharge:
    // Surcharge payable shall not exceed (Taxable Income - Threshold)
    const threshold = applicableSurchargeRate === 0.10 ? 5000000 :
                      applicableSurchargeRate === 0.15 ? 10000000 :
                      applicableSurchargeRate === 0.25 ? 20000000 : 50000000;
    
    const excessIncome = taxableIncome - threshold;
    const taxAtThreshold = calculateTaxAtOldThreshold(threshold, oldRules.slabs);
    const taxWithSurcharge = taxAfterRebate + surcharge;
    const maximumAllowedTax = taxAtThreshold + excessIncome;

    if (taxWithSurcharge > maximumAllowedTax) {
      surcharge = Math.max(0, maximumAllowedTax - taxAfterRebate);
    }
  }

  // 9. Health & Education Cess (4%)
  const cess = Math.round((taxAfterRebate + surcharge) * rules.cessRate);

  // 10. Final Tax Liability (Rounded to nearest 10 as per Section 288B)
  const finalTaxLiability = Math.round((taxAfterRebate + surcharge + cess) / 10) * 10;
  const monthlyTaxLiability = Math.round(finalTaxLiability / 12);
  const effectiveTaxRate = grossSalary > 0 ? Number(((finalTaxLiability / grossSalary) * 100).toFixed(2)) : 0;

  return {
    regime: 'OLD',
    financialYear: fy,
    grossSalary,
    otherIncomeTotal,
    grossTotalIncome,
    exemptions: {
      hraExemption,
      standardDeduction,
      professionalTax,
      totalExemptions,
    },
    deductions: {
      section80C: section80CAllowed,
      section80CDetails: {
        epf: epfAnalysis.eligible80CDeductionFromPF,
        other: deductions.other80CInvestments || 0,
        totalEligible: epfAnalysis.combined80CTotal,
        allowedCap: section80CAllowed,
      },
      section80D: section80DAllowed,
      section80CCD1B: section80CCD1BAllowed,
      section80CCD2: section80CCD2Allowed,
      section24b: section24bAllowed,
      section80E: section80EAllowed,
      otherDeductions: otherDeductionsAllowed,
      totalDeductions: finalTotalDeductions,
    },
    taxableIncome,
    slabBreakdown,
    taxBeforeRebate,
    rebate87A,
    marginalRelief: 0,
    taxAfterRebate,
    surcharge,
    cess,
    finalTaxLiability,
    monthlyTaxLiability,
    effectiveTaxRate,
  };
}

function calculateTaxAtOldThreshold(threshold: number, slabs: { min: number; max: number | null; rate: number }[]): number {
  let tax = 0;
  for (const slab of slabs) {
    if (threshold <= slab.min) continue;
    const upper = slab.max ?? Infinity;
    const span = upper - slab.min;
    const taxableInSlab = Math.min(Math.max(0, threshold - slab.min), span);
    tax += taxableInSlab * slab.rate;
  }
  return tax;
}
