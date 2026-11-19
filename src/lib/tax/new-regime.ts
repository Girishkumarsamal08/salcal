import { AdditionalDeductions, FinancialYear, SalaryComponents, SlabCalculationItem, TaxRegimeResult } from './types';
import { getTaxRules } from './tax-rules';
import { analyzeEPFContributions } from './epf-intelligence';

/**
 * Calculates Income Tax under the New Tax Regime (Section 115BAC) for Indian Salaried Employees
 */
export function calculateNewTaxRegime(
  salary: SalaryComponents,
  deductions: AdditionalDeductions,
  fy: FinancialYear = '2024-2025'
): TaxRegimeResult {
  const rules = getTaxRules(fy);
  const newRules = rules.newRegime;

  // 1. Gross Salary Components
  const epfAnalysis = analyzeEPFContributions(
    salary.employeePF,
    salary.employerPF,
    0
  );

  const directSalary =
    salary.basicSalary +
    salary.hraReceived +
    salary.specialAllowance +
    salary.lta +
    salary.bonus +
    salary.otherAllowances;

  const grossSalary = directSalary + epfAnalysis.taxableEmployerPFPerquisite;

  // 2. Exemptions under New Regime
  // Standard deduction is allowed (₹75,000 for FY 24-25, ₹50,000 for FY 23-24)
  const standardDeduction = Math.min(newRules.standardDeduction, Math.max(0, grossSalary));
  
  // HRA, Professional Tax, LTA are NOT allowed under Section 115BAC
  const hraExemption = 0;
  const professionalTax = 0;
  const totalExemptions = standardDeduction;

  const netSalaryIncome = Math.max(0, grossSalary - totalExemptions);

  // 3. Other Income
  const otherIncomeTotal = Math.max(0, (deductions.interestIncome || 0) + (deductions.rentalIncome || 0) + (deductions.otherIncome || 0));
  const grossTotalIncome = netSalaryIncome + otherIncomeTotal;

  // 4. Deductions Allowed under New Regime
  // Section 80CCD(2) - Employer NPS contribution (up to 14% of Basic) IS ALLOWED
  const maxEmployerNPS = Math.round(salary.basicSalary * newRules.maxSection80CCD2Percentage);
  const section80CCD2Allowed = Math.min(maxEmployerNPS, Math.max(0, deductions.employerNPSContribution || 0));

  // 80C, 80D, 80CCD(1B), 24(b), 80E, 80TTA are NOT deductible under New Regime
  const totalDeductions = Math.min(grossTotalIncome, section80CCD2Allowed);

  // 5. Taxable Income (Rounded to nearest 10 as per Section 288A)
  const rawTaxableIncome = Math.max(0, grossTotalIncome - totalDeductions);
  const taxableIncome = Math.round(rawTaxableIncome / 10) * 10;

  // 6. Tax Calculation using New Slabs
  const slabBreakdown: SlabCalculationItem[] = [];
  let taxBeforeRebate = 0;

  for (const slab of newRules.slabs) {
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

  // 7. Rebate under Section 87A and Marginal Relief
  let rebate87A = 0;
  let marginalRelief = 0;

  if (taxableIncome <= newRules.rebate87AMaxIncome) {
    // Zero tax for taxable income <= ₹7,00,000
    rebate87A = taxBeforeRebate;
  } else {
    // Check for Section 87A Marginal Relief:
    // Tax payable on income slightly exceeding ₹7,00,000 cannot exceed (Taxable Income - ₹7,00,000)
    const excessIncomeOver7L = taxableIncome - newRules.rebate87AMaxIncome;
    if (taxBeforeRebate > excessIncomeOver7L) {
      marginalRelief = taxBeforeRebate - excessIncomeOver7L;
    }
  }

  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate87A - marginalRelief);

  // 8. Surcharge & Marginal Relief (Capped at 25%)
  let surcharge = 0;
  let applicableSurchargeRate = 0;
  for (const st of newRules.surchargeThresholds) {
    if (taxableIncome > st.min && (st.max === null || taxableIncome <= st.max)) {
      applicableSurchargeRate = st.rate;
      break;
    }
  }

  if (applicableSurchargeRate > 0) {
    surcharge = Math.round(taxAfterRebate * applicableSurchargeRate);
    
    // Marginal relief for surcharge
    const threshold = applicableSurchargeRate === 0.10 ? 5000000 :
                      applicableSurchargeRate === 0.15 ? 10000000 : 20000000;
    
    const excessIncome = taxableIncome - threshold;
    const taxAtThreshold = calculateTaxAtNewThreshold(threshold, newRules.slabs);
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
    regime: 'NEW',
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
      section80C: 0,
      section80CDetails: {
        epf: 0,
        other: 0,
        totalEligible: 0,
        allowedCap: 0,
      },
      section80D: 0,
      section80CCD1B: 0,
      section80CCD2: section80CCD2Allowed,
      section24b: 0,
      section80E: 0,
      otherDeductions: 0,
      totalDeductions,
    },
    taxableIncome,
    slabBreakdown,
    taxBeforeRebate,
    rebate87A,
    marginalRelief,
    taxAfterRebate,
    surcharge,
    cess,
    finalTaxLiability,
    monthlyTaxLiability,
    effectiveTaxRate,
  };
}

function calculateTaxAtNewThreshold(threshold: number, slabs: { min: number; max: number | null; rate: number }[]): number {
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
