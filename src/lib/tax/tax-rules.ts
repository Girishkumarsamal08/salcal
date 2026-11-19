import { FinancialYear, TaxSlab } from './types';

export interface TaxRulesConfig {
  financialYear: FinancialYear;
  assessmentYear: string;
  cessRate: number; // 0.04 (4%)
  
  oldRegime: {
    standardDeduction: number;
    slabs: TaxSlab[];
    rebate87AMaxIncome: number;
    rebate87AMaxAmount: number;
    maxSection80C: number;
    maxSection80CCD1B: number;
    maxSection24bSelfOccupied: number;
    maxSection80DRegular: number;
    maxSection80DSenior: number;
    maxPreventiveCheckup: number;
    surchargeThresholds: { min: number; max: number | null; rate: number }[];
  };

  newRegime: {
    standardDeduction: number;
    slabs: TaxSlab[];
    rebate87AMaxIncome: number;
    rebate87AMaxAmount: number;
    maxSection80CCD2Percentage: number; // 0.14 for 14%
    surchargeThresholds: { min: number; max: number | null; rate: number }[];
  };
}

export const TAX_RULES: Record<FinancialYear, TaxRulesConfig> = {
  '2024-2025': {
    financialYear: '2024-2025',
    assessmentYear: '2025-2026',
    cessRate: 0.04,
    oldRegime: {
      standardDeduction: 50000,
      slabs: [
        { min: 0, max: 250000, rate: 0.0 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: null, rate: 0.30 },
      ],
      rebate87AMaxIncome: 500000,
      rebate87AMaxAmount: 12500,
      maxSection80C: 150000,
      maxSection80CCD1B: 50000,
      maxSection24bSelfOccupied: 200000,
      maxSection80DRegular: 25000,
      maxSection80DSenior: 50000,
      maxPreventiveCheckup: 5000,
      surchargeThresholds: [
        { min: 5000000, max: 10000000, rate: 0.10 },
        { min: 10000000, max: 20000000, rate: 0.15 },
        { min: 20000000, max: 50000000, rate: 0.25 },
        { min: 50000000, max: null, rate: 0.37 },
      ],
    },
    newRegime: {
      // Budget 2024 revised standard deduction from 50k to 75k for salaried individuals
      standardDeduction: 75000,
      slabs: [
        { min: 0, max: 300000, rate: 0.0 },
        { min: 300000, max: 700000, rate: 0.05 },
        { min: 700000, max: 1000000, rate: 0.10 },
        { min: 1000000, max: 1200000, rate: 0.15 },
        { min: 1200000, max: 1500000, rate: 0.20 },
        { min: 1500000, max: null, rate: 0.30 },
      ],
      rebate87AMaxIncome: 700000,
      rebate87AMaxAmount: 25000, // Zero tax up to 7,00,000 taxable income
      maxSection80CCD2Percentage: 0.14,
      surchargeThresholds: [
        { min: 5000000, max: 10000000, rate: 0.10 },
        { min: 10000000, max: 20000000, rate: 0.15 },
        { min: 20000000, max: null, rate: 0.25 }, // Capped at 25% under new regime
      ],
    },
  },
  '2023-2024': {
    financialYear: '2023-2024',
    assessmentYear: '2024-2025',
    cessRate: 0.04,
    oldRegime: {
      standardDeduction: 50000,
      slabs: [
        { min: 0, max: 250000, rate: 0.0 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: null, rate: 0.30 },
      ],
      rebate87AMaxIncome: 500000,
      rebate87AMaxAmount: 12500,
      maxSection80C: 150000,
      maxSection80CCD1B: 50000,
      maxSection24bSelfOccupied: 200000,
      maxSection80DRegular: 25000,
      maxSection80DSenior: 50000,
      maxPreventiveCheckup: 5000,
      surchargeThresholds: [
        { min: 5000000, max: 10000000, rate: 0.10 },
        { min: 10000000, max: 20000000, rate: 0.15 },
        { min: 20000000, max: 50000000, rate: 0.25 },
        { min: 50000000, max: null, rate: 0.37 },
      ],
    },
    newRegime: {
      standardDeduction: 50000,
      slabs: [
        { min: 0, max: 300000, rate: 0.0 },
        { min: 300000, max: 600000, rate: 0.05 },
        { min: 600000, max: 900000, rate: 0.10 },
        { min: 900000, max: 1200000, rate: 0.15 },
        { min: 1200000, max: 1500000, rate: 0.20 },
        { min: 1500000, max: null, rate: 0.30 },
      ],
      rebate87AMaxIncome: 700000,
      rebate87AMaxAmount: 25000,
      maxSection80CCD2Percentage: 0.14,
      surchargeThresholds: [
        { min: 5000000, max: 10000000, rate: 0.10 },
        { min: 10000000, max: 20000000, rate: 0.15 },
        { min: 20000000, max: null, rate: 0.25 },
      ],
    },
  },
};

export function getTaxRules(fy: FinancialYear = '2024-2025'): TaxRulesConfig {
  return TAX_RULES[fy] || TAX_RULES['2024-2025'];
}
