import { describe, it, expect } from 'vitest';
import { structureSalaryFromCTC, toSalaryComponents } from '../salary-structuring';
import { calculateTakeHomePay } from '../take-home-calculator';
import { recommendTaxRegime } from '../../tax/recommendation-engine';
import { AdditionalDeductions } from '../../tax/types';

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

describe('Automatic CTC Salary Structuring Engine (RazorpayX-inspired)', () => {
  const benchmarkCTCs = [
    300000,   // ₹3,00,000
    500000,   // ₹5,00,000
    600000,   // ₹6,00,000
    800000,   // ₹8,00,000
    1000000,  // ₹10,00,000
    1200000,  // ₹12,00,000
    1800000,  // ₹18,00,000
    2500000,  // ₹25,00,000
  ];

  it.each(benchmarkCTCs)(
    'should perfectly reconcile CTC ₹%i: Sum of components equals input CTC',
    (ctc) => {
      const result = structureSalaryFromCTC(ctc);

      expect(result.isValid).toBe(true);
      expect(result.reconciliation.isReconciled).toBe(true);
      expect(result.reconciliation.difference).toBe(0);

      // Verify CTC = Gross Earnings + Employer PF + Gratuity + Employer Benefits
      const reconstructedCTC =
        result.annualGrossSalary +
        result.employerPF.annualAmount +
        result.gratuity.annualAmount +
        result.employerBenefits.annualAmount;

      expect(reconstructedCTC).toBe(ctc);

      // Verify Special Allowance is non-negative and balances the structure
      expect(result.specialAllowance.annualAmount).toBeGreaterThanOrEqual(0);

      // Verify Basic is 50% of CTC
      expect(result.basicSalary.annualAmount).toBe(Math.round(ctc * 0.5));

      // Verify HRA is 25% of CTC
      expect(result.hra.annualAmount).toBe(Math.round(ctc * 0.25));

      // Verify LTA is 15% of Basic
      expect(result.lta.annualAmount).toBe(Math.round(result.basicSalary.annualAmount * 0.15));

      // Verify Employer PF = 12% of Basic
      expect(result.employerPF.annualAmount).toBe(Math.round(result.basicSalary.annualAmount * 0.12));

      // Verify Employee PF = 12% of Basic
      expect(result.employeePF.annualAmount).toBe(Math.round(result.basicSalary.annualAmount * 0.12));

      // Verify Gratuity is approximately 4.81% of Basic (statutory 15/26 formula)
      const expectedGratuity = Math.round((15 / 26) * (result.basicSalary.annualAmount / 12));
      expect(result.gratuity.annualAmount).toBe(expectedGratuity);
    }
  );

  it('should correctly reconcile monthly and annual values', () => {
    const result = structureSalaryFromCTC(1200000);

    expect(result.monthlyCTC).toBe(100000);
    expect(result.basicSalary.monthlyAmount).toBe(50000);
    expect(result.hra.monthlyAmount).toBe(25000);

    // Gross monthly = annual / 12
    expect(result.monthlyGrossSalary).toBe(Math.round(result.annualGrossSalary / 12));

    // Pre-tax take-home monthly = annual / 12
    expect(result.monthlyPreTaxTakeHome).toBe(Math.round(result.annualPreTaxTakeHome / 12));
  });

  it('should correctly deduct employee PF from gross and NOT double-count employer PF in take-home', () => {
    const result = structureSalaryFromCTC(1200000); // 12 LPA CTC
    // Basic = 6,00,000, Employee PF = 72,000 (6,000/mo)
    // PT = 2,400 (200/mo)
    // Pre-tax take-home = Gross - Employee PF - PT
    const expectedPreTaxTakeHome =
      result.annualGrossSalary -
      result.employeePF.annualAmount -
      result.professionalTax.annualAmount;

    expect(result.annualPreTaxTakeHome).toBe(expectedPreTaxTakeHome);

    // Employer PF and Gratuity must NOT be subtracted from gross (they are employer costs in CTC)
    expect(result.annualPreTaxTakeHome).toBeGreaterThan(
      result.annualGrossSalary - result.totalEmployerContributions.annualAmount - result.employeePF.annualAmount
    );
  });

  it('should support Statutory PF Wage Ceiling mode (capped at ₹15,000/month)', () => {
    const ctc = 1800000; // 18 LPA
    // Uncapped basic is 9,00,000. 12% uncapped = 1,08,000
    // Capped: basic is capped at ₹15,000/mo = ₹1,80,000/yr. 12% = ₹21,600 (₹1,800/mo)
    const cappedResult = structureSalaryFromCTC(ctc, {
      pfApplicability: 'statutory_wage_ceiling',
      statutoryPFWageCeilingMonthly: 15000,
    });

    expect(cappedResult.employeePF.annualAmount).toBe(21600);
    expect(cappedResult.employeePF.monthlyAmount).toBe(1800);
    expect(cappedResult.employerPF.annualAmount).toBe(21600);

    // Lower employer PF means higher residual special allowance
    const uncappedResult = structureSalaryFromCTC(ctc, {
      pfApplicability: 'uncapped',
    });
    expect(cappedResult.specialAllowance.annualAmount).toBeGreaterThan(
      uncappedResult.specialAllowance.annualAmount
    );

    // Still 100% reconciled
    expect(cappedResult.reconciliation.isReconciled).toBe(true);
    expect(cappedResult.reconciliation.difference).toBe(0);
  });

  it('should calculate estimated net take-home and connect to tax comparison engine', () => {
    const ctc = 1200000;
    const breakdown = structureSalaryFromCTC(ctc);
    const salary = toSalaryComponents(breakdown);

    // Run tax recommendation under FY 2024-25
    const rec = recommendTaxRegime(salary, defaultDeductions, '2024-2025');

    // In FY 24-25, 12 LPA with zero additional deductions:
    // New regime gives lower tax
    expect(rec.recommendedRegime).toBe('NEW');

    // Calculate takeHome pay using winning regime tax
    const takeHomeNew = calculateTakeHomePay({
      breakdown,
      annualTaxLiability: rec.newRegimeResult.finalTaxLiability,
    });

    expect(takeHomeNew.annualTaxLiability).toBe(rec.newRegimeResult.finalTaxLiability);
    const expectedMonthly =
      breakdown.monthlyGrossSalary -
      breakdown.employeePF.monthlyAmount -
      breakdown.professionalTax.monthlyAmount -
      Math.round(rec.newRegimeResult.finalTaxLiability / 12);
    expect(takeHomeNew.monthlyNetTakeHome).toBe(expectedMonthly);
    expect(takeHomeNew.monthlyNetTakeHome).toBeGreaterThan(60000);
  });

  it('should flag validation error when user configuration exceeds 100% of CTC', () => {
    // Basic 70%, HRA 40% = 110% of CTC! Cannot fit residual Special Allowance
    const invalidResult = structureSalaryFromCTC(1000000, {
      basicPercentOfCTC: 70,
      hraPercentOfCTC: 40,
    });

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.validationErrors.length).toBeGreaterThan(0);
    expect(invalidResult.reconciliation.specialAllowanceBalanced).toBe(false);
  });
});
