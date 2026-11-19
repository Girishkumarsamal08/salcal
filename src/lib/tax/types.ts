export type FinancialYear = '2025-2026' | '2024-2025' | '2023-2024';

export type MetroCity = 'metro' | 'non-metro';

export type ParentAgeCategory = 'regular' | 'senior'; // <60 or >=60 years

export interface SalaryComponents {
  basicSalary: number;
  hraReceived: number;
  specialAllowance: number;
  lta: number;
  bonus: number;
  otherAllowances: number;
  employeePF: number; // Annual employee EPF
  employerPF: number; // Annual employer EPF
  professionalTax: number; // Annual PT (typically up to 2500)
}

export interface AdditionalDeductions {
  // Section 80C (excluding employee PF which is calculated automatically)
  other80CInvestments: number; // PPF, ELSS, LIC, tuition fees, principal repayment, etc.
  
  // Section 80D (Health Insurance)
  healthInsuranceSelfFamily: number; // Max 25k (or 50k if senior)
  isSelfSeniorCitizen: boolean;
  healthInsuranceParents: number; // Max 25k (regular) or 50k (senior)
  parentsAgeCategory: ParentAgeCategory;
  preventiveHealthCheckup: number; // Max 5k (included inside 80D limit)

  // Section 80CCD(1B) - Additional NPS
  npsSelfContribution: number; // Max 50,000

  // Section 80CCD(2) - Employer NPS
  employerNPSContribution: number; // Up to 14% of Basic+DA (both regimes)

  // Section 24(b) - Home Loan Interest
  homeLoanInterestSelfOccupied: number; // Max 2,00,000

  // Section 80E - Education Loan Interest
  educationLoanInterest: number; // No upper limit

  // Section 80TTA / 80TTB - Savings Interest
  savingsInterestDeduction: number; // Max 10,000 (80TTA) or 50,000 (80TTB)

  // Other Eligible Deductions (e.g., 80G donations, etc.)
  otherDeductions: number;

  // Other Income
  interestIncome: number;
  rentalIncome: number;
  otherIncome: number;

  // HRA Data
  rentPaidAnnually: number;
  cityCategory: MetroCity;
}

export interface TaxSlab {
  min: number;
  max: number | null; // null represents infinity
  rate: number; // e.g. 0.05 for 5%
}

export interface SlabCalculationItem {
  slab: string;
  taxableAmountInSlab: number;
  rate: number;
  taxAmount: number;
}

export interface TaxRegimeResult {
  regime: 'OLD' | 'NEW';
  financialYear: FinancialYear;
  grossSalary: number;
  otherIncomeTotal: number;
  grossTotalIncome: number;
  
  // Exemptions & Deductions
  exemptions: {
    hraExemption: number;
    standardDeduction: number;
    professionalTax: number;
    totalExemptions: number;
  };
  
  deductions: {
    section80C: number;
    section80CDetails: {
      epf: number;
      other: number;
      totalEligible: number;
      allowedCap: number;
    };
    section80D: number;
    section80CCD1B: number;
    section80CCD2: number;
    section24b: number;
    section80E: number;
    otherDeductions: number;
    totalDeductions: number;
  };

  taxableIncome: number;
  
  // Tax Computations
  slabBreakdown: SlabCalculationItem[];
  taxBeforeRebate: number;
  rebate87A: number;
  marginalRelief: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number; // 4%
  finalTaxLiability: number;
  monthlyTaxLiability: number;
  effectiveTaxRate: number; // percentage
}

export interface TaxComparisonRecommendation {
  recommendedRegime: 'OLD' | 'NEW' | 'EQUAL';
  taxSavings: number;
  monthlySavings: number;
  oldRegimeResult: TaxRegimeResult;
  newRegimeResult: TaxRegimeResult;
  headlineExplanation: string;
  detailedFactors: {
    category: string;
    description: string;
    impactAmount?: number;
    impactType: 'favorable_old' | 'favorable_new' | 'neutral';
  }[];
  breakEvenDeductionNeeded?: number; // Total deductions needed for Old Regime to win
}

export interface ExtractedSalaryField {
  value: number;
  rawText?: string;
  confidence: number; // 0 to 1
  isUncertain: boolean;
  fieldSource?: string;
}

export interface ExtractedSalaryData {
  annualGrossSalary: ExtractedSalaryField;
  basicSalary: ExtractedSalaryField;
  hraReceived: ExtractedSalaryField;
  specialAllowance: ExtractedSalaryField;
  lta: ExtractedSalaryField;
  bonus: ExtractedSalaryField;
  employeePF: ExtractedSalaryField;
  employerPF: ExtractedSalaryField;
  professionalTax: ExtractedSalaryField;
  otherAllowances: ExtractedSalaryField;
  monthlyOrAnnual: 'monthly' | 'annual';
  employeeName?: string;
  companyName?: string;
  payPeriod?: string;
  warnings: string[];
}
