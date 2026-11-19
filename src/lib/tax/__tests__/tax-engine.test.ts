import { describe, it, expect } from 'vitest';
import { calculateOldTaxRegime } from '../old-regime';
import { calculateNewTaxRegime } from '../new-regime';
import { calculateHRAExemption } from '../hra-intelligence';
import { analyzeEPFContributions } from '../epf-intelligence';
import { recommendTaxRegime } from '../recommendation-engine';
import { AdditionalDeductions, SalaryComponents } from '../types';

const defaultDeductions: AdditionalDeductions = {
  other80CInvestments: 0,
  healthInsuranceSelfFamily: 0,
  isSelfSeniorCitizen: false,
  healthInsuranceParents: 0,
  parentsAgeCategory: 'regular',
  preventiveHealthCheckup: 0,
  npsSelfContribution: 0,
  employerNPSContribution: 0,
  homeLoanInterestSelfOccupied: 0,
  educationLoanInterest: 0,
  savingsInterestDeduction: 0,
  otherDeductions: 0,
  interestIncome: 0,
  rentalIncome: 0,
  otherIncome: 0,
  rentPaidAnnually: 0,
  cityCategory: 'metro',
};

const defaultSalary: SalaryComponents = {
  basicSalary: 300000,
  hraReceived: 0,
  specialAllowance: 0,
  lta: 0,
  bonus: 0,
  otherAllowances: 0,
  employeePF: 0,
  employerPF: 0,
  professionalTax: 0,
};

describe('Tax Engine - HRA Exemption (Section 10(13A))', () => {
  it('should return 0 exemption if no rent is paid', () => {
    const res = calculateHRAExemption(500000, 200000, 0, 'metro');
    expect(res.exemptAmount).toBe(0);
    expect(res.taxableHra).toBe(200000);
  });

  it('should calculate correct exemption for metro city (50% basic limit)', () => {
    // Basic: 4,00,000, HRA: 2,00,000, Rent: 2,40,000 (20k/mo)
    // Cond 1 (Actual HRA): 2,00,000
    // Cond 2 (50% Basic): 2,00,000
    // Cond 3 (Rent - 10% Basic): 2,40,000 - 40,000 = 2,00,000
    const res = calculateHRAExemption(400000, 200000, 240000, 'metro');
    expect(res.exemptAmount).toBe(200000);
    expect(res.taxableHra).toBe(0);
  });

  it('should calculate correct exemption for non-metro city (40% basic limit)', () => {
    // Basic: 4,00,000, HRA: 2,00,000, Rent: 2,40,000
    // Cond 2 (40% Basic): 1,60,000 -> Governing limit
    const res = calculateHRAExemption(400000, 200000, 240000, 'non-metro');
    expect(res.exemptAmount).toBe(160000);
    expect(res.taxableHra).toBe(40000);
    expect(res.governingCondition).toBe('city_percentage');
  });
});

describe('Tax Engine - EPF Intelligence & Section 80C', () => {
  it('should cap combined 80C at 1,50,000 and not double count', () => {
    const res = analyzeEPFContributions(80000, 80000, 100000);
    // Combined = 1,80,000, capped at 1,50,000
    expect(res.allowed80CDeduction).toBe(150000);
    expect(res.hasCapped80C).toBe(true);
    expect(res.unutilized80CLimit).toBe(0);
  });

  it('should detect employer PF above 7.5L as taxable perquisite', () => {
    const res = analyzeEPFContributions(50000, 850000, 0);
    expect(res.isEmployerPFExempt).toBe(false);
    expect(res.taxableEmployerPFPerquisite).toBe(100000);
  });
});

describe('Tax Engine - Old Tax Regime Calculations', () => {
  it('should apply zero tax under Section 87A rebate for taxable income <= 5L', () => {
    const salary: SalaryComponents = {
      ...defaultSalary,
      basicSalary: 300000,
      specialAllowance: 250000, // Gross = 5.5L
    };
    // Standard deduction = 50,000 -> Taxable = 5,00,000
    const res = calculateOldTaxRegime(salary, defaultDeductions, '2024-2025');
    expect(res.taxableIncome).toBe(500000);
    expect(res.taxBeforeRebate).toBe(12500);
    expect(res.rebate87A).toBe(12500);
    expect(res.finalTaxLiability).toBe(0);
  });

  it('should correctly tax income above 10L at 30% slab', () => {
    const salary: SalaryComponents = {
      ...defaultSalary,
      basicSalary: 600000,
      specialAllowance: 650000, // Gross = 12.5L
    };
    // Standard deduction = 50,000 -> Taxable = 12,00,000
    // Slabs:
    // 0 - 2.5L: 0
    // 2.5L - 5L: 12,500
    // 5L - 10L: 1,00,000
    // 10L - 12L: 2,00,000 * 30% = 60,000
    // Total before cess = 1,72,500
    // Cess (4%) = 6,900
    // Total = 1,79,400
    const res = calculateOldTaxRegime(salary, defaultDeductions, '2024-2025');
    expect(res.taxableIncome).toBe(1200000);
    expect(res.taxBeforeRebate).toBe(172500);
    expect(res.cess).toBe(6900);
    expect(res.finalTaxLiability).toBe(179400);
  });
});

describe('Tax Engine - New Tax Regime Calculations (FY 2024-25)', () => {
  it('should use 75,000 standard deduction and provide zero tax up to 7L taxable income', () => {
    const salary: SalaryComponents = {
      ...defaultSalary,
      basicSalary: 400000,
      specialAllowance: 375000, // Gross = 7.75L
    };
    // Standard deduction = 75,000 -> Taxable = 7,00,000
    const res = calculateNewTaxRegime(salary, defaultDeductions, '2024-2025');
    expect(res.exemptions.standardDeduction).toBe(75000);
    expect(res.taxableIncome).toBe(700000);
    expect(res.taxBeforeRebate).toBe(20000); // 3L-7L @ 5% = 20,000
    expect(res.rebate87A).toBe(20000); // Full rebate
    expect(res.finalTaxLiability).toBe(0);
  });

  it('should apply Section 87A marginal relief when income slightly exceeds 7L', () => {
    const salary: SalaryComponents = {
      ...defaultSalary,
      basicSalary: 400000,
      specialAllowance: 385000, // Gross = 7,85,000
    };
    // Standard deduction = 75,000 -> Taxable = 7,10,000
    // Slabs: 3L-7L @ 5% = 20,000; 7L-7.1L @ 10% = 1,000 -> Total = 21,000
    // Excess income over 7L = 10,000
    // Tax cannot exceed excess income (10,000), so marginal relief = 11,000!
    // Tax after relief = 10,000 + 4% cess (400) = 10,400
    const res = calculateNewTaxRegime(salary, defaultDeductions, '2024-2025');
    expect(res.taxableIncome).toBe(710000);
    expect(res.marginalRelief).toBe(11000);
    expect(res.finalTaxLiability).toBe(10400);
  });
});

describe('Recommendation Engine', () => {
  it('should recommend Old Regime when employee has high rent and 80C/80D deductions', () => {
    const salary: SalaryComponents = {
      basicSalary: 450000,
      hraReceived: 220000,
      specialAllowance: 250000,
      lta: 40000,
      bonus: 90000,
      otherAllowances: 0,
      employeePF: 54000,
      employerPF: 54000,
      professionalTax: 2500,
    };
    const deductions: AdditionalDeductions = {
      ...defaultDeductions,
      other80CInvestments: 100000,
      healthInsuranceSelfFamily: 25000,
      healthInsuranceParents: 50000,
      parentsAgeCategory: 'senior',
      npsSelfContribution: 50000,
      rentPaidAnnually: 216000,
      cityCategory: 'metro',
    };

    const rec = recommendTaxRegime(salary, deductions, '2024-2025');
    expect(rec.recommendedRegime).toBe('OLD');
    expect(rec.taxSavings).toBeGreaterThan(15000);
    expect(rec.detailedFactors.length).toBeGreaterThan(2);
  });
});
