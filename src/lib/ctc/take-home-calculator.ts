/**
 * Take-Home In-Hand Salary Calculator
 * Computes exact monthly net pay deposited into the employee's bank account
 * after employee deductions and estimated income tax (TDS).
 */

import { CTCBreakdownResult, TakeHomeAnalysis } from './types';

export interface TakeHomeInput {
  breakdown: CTCBreakdownResult;
  annualTaxLiability: number; // calculated from Old or New regime
}

export function calculateTakeHomePay({
  breakdown,
  annualTaxLiability,
}: TakeHomeInput): TakeHomeAnalysis {
  const safeTax = Math.max(0, Math.round(annualTaxLiability));
  const monthlyTDS = Math.round(safeTax / 12);

  const annualGross = breakdown.annualGrossSalary;
  const monthlyGross = breakdown.monthlyGrossSalary;

  const annualEmployeePF = breakdown.employeePF.annualAmount;
  const monthlyEmployeePF = breakdown.employeePF.monthlyAmount;

  const annualPT = breakdown.professionalTax.annualAmount;
  const monthlyPT = breakdown.professionalTax.monthlyAmount;

  // Monthly Net Take-Home = Monthly Gross - Employee PF - PT - Monthly TDS
  const monthlyNetTakeHome = Math.max(0, monthlyGross - monthlyEmployeePF - monthlyPT - monthlyTDS);
  const annualNetTakeHome = Math.max(0, annualGross - annualEmployeePF - annualPT - safeTax);

  const effectiveTaxRatePercent = annualGross > 0
    ? Number(((safeTax / annualGross) * 100).toFixed(2))
    : 0;

  const takeHomePercentageOfCTC = breakdown.annualCTC > 0
    ? Number(((annualNetTakeHome / breakdown.annualCTC) * 100).toFixed(2))
    : 0;

  return {
    monthlyGross,
    monthlyEmployeePF,
    monthlyPT,
    monthlyTDS,
    monthlyNetTakeHome,

    annualGross,
    annualEmployeePF,
    annualPT,
    annualTaxLiability: safeTax,
    annualNetTakeHome,

    effectiveTaxRatePercent,
    takeHomePercentageOfCTC,
  };
}
