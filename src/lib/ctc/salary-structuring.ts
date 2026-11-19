/**
 * Automatic CTC Salary Structuring & Distribution Engine (RazorpayX-inspired)
 * 
 * Reconciles Annual CTC into:
 *  - Gross Earnings (Basic, HRA, LTA, residual Special Allowance)
 *  - Employer Contributions (Employer PF, Gratuity, Benefits)
 *  - Employee Statutory Deductions (Employee PF, Professional Tax)
 *  - Net In-Hand Take-Home Cash Flow
 */

import {
  SalaryStructureConfig,
  DEFAULT_SALARY_CONFIG,
  CTCBreakdownResult,
  DistributedComponent,
} from './types';
import { calculatePFContributions } from './pf-calculator';
import { calculateGratuityProvision } from './gratuity-calculator';

export function structureSalaryFromCTC(
  annualCTC: number,
  userConfig?: Partial<SalaryStructureConfig>
): CTCBreakdownResult {
  const config: SalaryStructureConfig = {
    ...DEFAULT_SALARY_CONFIG,
    ...(userConfig || {}),
  };

  const safeCTC = Math.max(0, Math.round(annualCTC));
  const validationErrors: string[] = [];

  if (safeCTC <= 0) {
    validationErrors.push('Please enter a valid Annual CTC greater than ₹0.');
  }

  // 1. Calculate Basic Salary
  const basicSalaryAnnual = Math.round(safeCTC * (config.basicPercentOfCTC / 100));

  // 2. Calculate HRA (typically 25% of CTC or 50% of Basic)
  const hraAnnual = Math.round(safeCTC * (config.hraPercentOfCTC / 100));

  // 3. Calculate LTA (Leave Travel Allowance, typically 15% of Basic)
  const ltaAnnual = Math.round(basicSalaryAnnual * (config.ltaPercentOfBasic / 100));

  // 4. Calculate Statutory EPF
  const pfResult = calculatePFContributions({
    annualBasicSalary: basicSalaryAnnual,
    mode: config.pfApplicability,
    employeeRate: config.employeePFRate,
    employerRate: config.employerPFRate,
    statutoryWageCeilingMonthly: config.statutoryPFWageCeilingMonthly,
  });

  const employeePFAnnual = pfResult.employeePFAnnual;
  const employerPFAnnual = pfResult.employerPFAnnual;

  // 5. Calculate Statutory Gratuity Provision
  const gratuityResult = calculateGratuityProvision({
    annualBasicSalary: basicSalaryAnnual,
    includeGratuity: config.includeGratuity,
  });
  const gratuityAnnual = gratuityResult.annualGratuity;

  // 6. Employer Insurance & Other Benefits
  const employerInsuranceAnnual = Math.max(0, Math.round(config.employerInsuranceAnnual || 0));
  const otherEmployerBenefitsAnnual = Math.max(0, Math.round(config.otherEmployerBenefitsAnnual || 0));
  const totalEmployerBenefitsAnnual = employerInsuranceAnnual + otherEmployerBenefitsAnnual;

  // 7. Total Employer Contributions (part of CTC, NOT directly received by employee)
  const totalEmployerContributionsAnnual = employerPFAnnual + gratuityAnnual + totalEmployerBenefitsAnnual;

  // 8. Residual Special Allowance (Balancing Component)
  // Annual CTC = (Basic + HRA + LTA + Special Allowance) + Employer PF + Gratuity + Employer Benefits
  // Special Allowance = Annual CTC - (Basic + HRA + LTA + Total Employer Contributions)
  const fixedAllocations = basicSalaryAnnual + hraAnnual + ltaAnnual + totalEmployerContributionsAnnual;
  const rawSpecialAllowance = safeCTC - fixedAllocations;

  let specialAllowanceAnnual = rawSpecialAllowance;
  let isValid = true;

  if (rawSpecialAllowance < 0) {
    isValid = false;
    const deficit = Math.abs(rawSpecialAllowance);
    validationErrors.push(
      `The configured salary components (Basic ${config.basicPercentOfCTC}%, HRA ${config.hraPercentOfCTC}%, LTA ${(config.ltaPercentOfBasic)}% of Basic) plus employer contributions exceed 100% of entered CTC by ₹${deficit.toLocaleString('en-IN')}. Please lower Basic or HRA percentage to balance the structure.`
    );
    specialAllowanceAnnual = 0; // Clamped to zero for display safety
  }

  // 9. Total Annual Gross Salary (What employee earns before deductions)
  // Gross = Basic + HRA + LTA + Special Allowance
  const annualGrossSalary = basicSalaryAnnual + hraAnnual + ltaAnnual + specialAllowanceAnnual;
  const monthlyGrossSalary = Math.round(annualGrossSalary / 12);

  // 10. Professional Tax
  const professionalTaxAnnual = safeCTC > 150000 ? Math.round(config.professionalTaxAnnual || 2400) : 0;
  const professionalTaxMonthly = Math.round(professionalTaxAnnual / 12);

  // 11. Pre-Tax Take-Home Cash Flow (Gross - Employee PF - PT)
  const annualPreTaxTakeHome = Math.max(0, annualGrossSalary - employeePFAnnual - professionalTaxAnnual);
  const monthlyPreTaxTakeHome = Math.round(annualPreTaxTakeHome / 12);

  // 12. Accounting Reconciliation Verification
  // Sum of all CTC components = Gross + Total Employer Contributions
  const calculatedTotalCTC = annualGrossSalary + totalEmployerContributionsAnnual;
  const difference = safeCTC - calculatedTotalCTC;
  const isReconciled = Math.abs(difference) === 0 && isValid;

  // Helper to build a DistributedComponent
  const makeComponent = (
    code: string,
    name: string,
    category: DistributedComponent['category'],
    annual: number,
    description: string,
    isTaxableInNewRegime: boolean,
    isExemptInOldRegimeWithProof: boolean
  ): DistributedComponent => ({
    code,
    name,
    category,
    annualAmount: annual,
    monthlyAmount: Math.round(annual / 12),
    percentageOfCTC: safeCTC > 0 ? Number(((annual / safeCTC) * 100).toFixed(2)) : 0,
    description,
    isTaxableInNewRegime,
    isExemptInOldRegimeWithProof,
  });

  return {
    annualCTC: safeCTC,
    monthlyCTC: Math.round(safeCTC / 12),
    config,

    // Earnings
    basicSalary: makeComponent(
      'BASIC',
      'Basic Salary',
      'earnings',
      basicSalaryAnnual,
      'Core taxable salary. Serves as reference base for EPF, Gratuity, and HRA limits.',
      true,
      false
    ),
    hra: makeComponent(
      'HRA',
      'House Rent Allowance',
      'earnings',
      hraAnnual,
      'Exempt under Old Regime Section 10(13A) against actual rent paid. Fully taxable in New Regime.',
      true,
      true
    ),
    lta: makeComponent(
      'LTA',
      'Leave Travel Allowance',
      'earnings',
      ltaAnnual,
      'Exempt for domestic travel tickets twice in a 4-year block under Old Regime. Fully taxable in New Regime.',
      true,
      true
    ),
    specialAllowance: makeComponent(
      'SPECIAL_ALLOWANCE',
      'Special Allowance',
      'earnings',
      specialAllowanceAnnual,
      'Flexible balancing allowance. Fully taxable under both Old and New Tax Regimes.',
      true,
      false
    ),
    grossSalary: makeComponent(
      'GROSS_EARNINGS',
      'Gross Annual Salary',
      'earnings',
      annualGrossSalary,
      'Total taxable cash earnings before statutory deductions (Basic + HRA + LTA + Special Allowance).',
      true,
      false
    ),

    // Employer Contributions
    employerPF: makeComponent(
      'EMPLOYER_PF',
      'Employer PF Contribution',
      'employer_contribution',
      employerPFAnnual,
      '12% statutory employer contribution directly deposited to EPFO. Part of CTC, not paid in monthly cash.',
      false,
      false
    ),
    gratuity: makeComponent(
      'GRATUITY',
      'Gratuity Provision',
      'employer_contribution',
      gratuityAnnual,
      'Statutory 15 days/year accrual provision under Payment of Gratuity Act, 1972. Payable after 5 years of continuous service.',
      false,
      false
    ),
    employerBenefits: makeComponent(
      'EMPLOYER_BENEFITS',
      'Employer Insurance & Benefits',
      'employer_contribution',
      totalEmployerBenefitsAnnual,
      'Corporate group health coverage and wellness benefits sponsored by employer.',
      false,
      false
    ),
    totalEmployerContributions: makeComponent(
      'TOTAL_EMPLOYER_CONTRIBUTIONS',
      'Total Employer Contributions',
      'employer_contribution',
      totalEmployerContributionsAnnual,
      'Non-cash statutory provisions and company benefits included in Annual CTC.',
      false,
      false
    ),

    // Employee Deductions
    employeePF: makeComponent(
      'EMPLOYEE_PF',
      'Employee PF Deduction',
      'employee_deduction',
      employeePFAnnual,
      '12% statutory contribution deducted from gross pay into employee EPFO account. Eligible under 80C in Old Regime.',
      false,
      true
    ),
    professionalTax: makeComponent(
      'PROFESSIONAL_TAX',
      'Professional Tax (PT)',
      'employee_deduction',
      professionalTaxAnnual,
      'State government employment tax. Deductible under Section 16(iii) in Old Regime.',
      false,
      true
    ),
    totalStatutoryEmployeeDeductions: makeComponent(
      'TOTAL_EMPLOYEE_DEDUCTIONS',
      'Total Statutory Employee Deductions',
      'employee_deduction',
      employeePFAnnual + professionalTaxAnnual,
      'Statutory mandatory deductions subtracted from monthly gross salary to calculate take-home.',
      false,
      true
    ),

    // In-Hand Cash Flow
    monthlyGrossSalary,
    annualGrossSalary,
    monthlyPreTaxTakeHome,
    annualPreTaxTakeHome,

    // Strict Accounting Reconciliation
    reconciliation: {
      calculatedTotalCTC,
      difference,
      isReconciled,
      specialAllowanceBalanced: rawSpecialAllowance >= 0,
    },

    isValid,
    validationErrors,
  };
}

/**
 * Maps the structured CTC breakdown to SALCAL's SalaryComponents model
 * for direct evaluation in the tax recommendation engine.
 */
export function toSalaryComponents(breakdown: CTCBreakdownResult) {
  return {
    basicSalary: breakdown.basicSalary.annualAmount,
    hraReceived: breakdown.hra.annualAmount,
    specialAllowance: breakdown.specialAllowance.annualAmount,
    lta: breakdown.lta.annualAmount,
    bonus: 0,
    otherAllowances: 0,
    employeePF: breakdown.employeePF.annualAmount,
    employerPF: breakdown.employerPF.annualAmount,
    professionalTax: breakdown.professionalTax.annualAmount,
  };
}
