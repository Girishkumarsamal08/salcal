/**
 * CTC Salary Structuring Engine Types (RazorpayX-inspired)
 * Defines configurations, distributed components, reconciliation models,
 * and take-home calculations.
 */

export type PFApplicabilityMode = 'uncapped' | 'statutory_wage_ceiling' | 'disabled';

export interface SalaryStructureConfig {
  presetName: 'standard' | 'custom';
  
  // Percentages
  basicPercentOfCTC: number; // e.g. 50 (50% of CTC)
  hraPercentOfCTC: number;   // e.g. 25 (25% of CTC, or 50% of Basic)
  ltaPercentOfBasic: number; // e.g. 15 (15% of Basic)

  // Provident Fund
  pfApplicability: PFApplicabilityMode; // 'uncapped' (12% of Basic) | 'statutory_wage_ceiling' (12% of min(Basic, 15000/mo)) | 'disabled'
  employeePFRate: number; // e.g. 0.12 (12%)
  employerPFRate: number; // e.g. 0.12 (12%)
  statutoryPFWageCeilingMonthly: number; // ₹15,000 per month

  // Gratuity
  includeGratuity: boolean; // true
  gratuityRateOfBasic: number; // (15 / 26) / 12 * 12 = 15/26 ≈ 0.0480769 (4.81% of Basic)

  // Employer Benefits (Insurance, Health coverage, etc.)
  employerInsuranceAnnual: number;
  otherEmployerBenefitsAnnual: number;

  // Professional Tax
  professionalTaxAnnual: number; // Default: ₹2,400 or ₹2,500/year (₹200/mo)
}

/**
 * Standard Default RazorpayX-inspired Configuration
 */
export const DEFAULT_SALARY_CONFIG: SalaryStructureConfig = {
  presetName: 'standard',
  basicPercentOfCTC: 50, // 50% of CTC
  hraPercentOfCTC: 25,   // 25% of CTC
  ltaPercentOfBasic: 15, // 15% of Basic
  pfApplicability: 'uncapped',
  employeePFRate: 0.12,
  employerPFRate: 0.12,
  statutoryPFWageCeilingMonthly: 15000,
  includeGratuity: true,
  gratuityRateOfBasic: 15 / 26, // statutory 15/26 of basic ≈ 4.8077% (0.04807692)
  employerInsuranceAnnual: 0,
  otherEmployerBenefitsAnnual: 0,
  professionalTaxAnnual: 2400, // ₹200/month
};

export interface DistributedComponent {
  code: string;
  name: string;
  category: 'earnings' | 'employer_contribution' | 'employee_deduction';
  annualAmount: number;
  monthlyAmount: number;
  percentageOfCTC: number;
  description: string;
  isTaxableInNewRegime: boolean;
  isExemptInOldRegimeWithProof: boolean;
}

export interface CTCBreakdownResult {
  annualCTC: number;
  monthlyCTC: number;
  config: SalaryStructureConfig;

  // Earnings (Gross components)
  basicSalary: DistributedComponent;
  hra: DistributedComponent;
  lta: DistributedComponent;
  specialAllowance: DistributedComponent;
  grossSalary: DistributedComponent; // Basic + HRA + LTA + Special Allowance

  // Employer Contributions (part of CTC, NOT in employee cash)
  employerPF: DistributedComponent;
  gratuity: DistributedComponent;
  employerBenefits: DistributedComponent;
  totalEmployerContributions: DistributedComponent;

  // Employee Deductions (deducted from Gross to get Net In-Hand)
  employeePF: DistributedComponent;
  professionalTax: DistributedComponent;
  totalStatutoryEmployeeDeductions: DistributedComponent;

  // Net In-Hand Cash Flow (Before and After estimated TDS)
  monthlyGrossSalary: number;
  annualGrossSalary: number;
  monthlyPreTaxTakeHome: number; // Gross - Employee PF - PT
  annualPreTaxTakeHome: number;

  // Strict Accounting Reconciliation
  reconciliation: {
    calculatedTotalCTC: number;
    difference: number; // Must be 0
    isReconciled: boolean;
    specialAllowanceBalanced: boolean;
  };

  // Validation
  isValid: boolean;
  validationErrors: string[];
}

export interface TakeHomeAnalysis {
  monthlyGross: number;
  monthlyEmployeePF: number;
  monthlyPT: number;
  monthlyTDS: number;
  monthlyNetTakeHome: number;

  annualGross: number;
  annualEmployeePF: number;
  annualPT: number;
  annualTaxLiability: number;
  annualNetTakeHome: number;

  effectiveTaxRatePercent: number;
  takeHomePercentageOfCTC: number;
}
