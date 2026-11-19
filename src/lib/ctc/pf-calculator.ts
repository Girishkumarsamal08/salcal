/**
 * Provident Fund (EPF) Calculation Engine
 * Complies with Employees' Provident Funds & Miscellaneous Provisions Act, 1952.
 */

import { PFApplicabilityMode } from './types';

export interface PFCalculationInput {
  annualBasicSalary: number;
  mode: PFApplicabilityMode;
  employeeRate?: number; // default 0.12 (12%)
  employerRate?: number; // default 0.12 (12%)
  statutoryWageCeilingMonthly?: number; // default ₹15,000/month
}

export interface PFCalculationResult {
  eligibleWageAnnual: number;
  eligibleWageMonthly: number;
  employeePFAnnual: number;
  employeePFMonthly: number;
  employerPFAnnual: number;
  employerPFMonthly: number;
  isCappedAtCeiling: boolean;
  explanation: string;
}

export function calculatePFContributions({
  annualBasicSalary,
  mode,
  employeeRate = 0.12,
  employerRate = 0.12,
  statutoryWageCeilingMonthly = 15000,
}: PFCalculationInput): PFCalculationResult {
  if (mode === 'disabled' || annualBasicSalary <= 0) {
    return {
      eligibleWageAnnual: 0,
      eligibleWageMonthly: 0,
      employeePFAnnual: 0,
      employeePFMonthly: 0,
      employerPFAnnual: 0,
      employerPFMonthly: 0,
      isCappedAtCeiling: false,
      explanation: 'EPF contributions are disabled in this salary structure configuration.',
    };
  }

  const statutoryCeilingAnnual = statutoryWageCeilingMonthly * 12; // ₹1,80,000
  let eligibleWageAnnual = annualBasicSalary;
  let isCapped = false;

  if (mode === 'statutory_wage_ceiling') {
    if (annualBasicSalary > statutoryCeilingAnnual) {
      eligibleWageAnnual = statutoryCeilingAnnual;
      isCapped = true;
    }
  }

  const employeePFAnnual = Math.round(eligibleWageAnnual * employeeRate);
  const employerPFAnnual = Math.round(eligibleWageAnnual * employerRate);

  const employeePFMonthly = Math.round(employeePFAnnual / 12);
  const employerPFMonthly = Math.round(employerPFAnnual / 12);

  const explanation = isCapped
    ? `PF calculated at 12% of statutory wage ceiling of ₹${statutoryWageCeilingMonthly.toLocaleString('en-IN')}/month (₹${statutoryCeilingAnnual.toLocaleString('en-IN')}/year) = ₹${employeePFMonthly.toLocaleString('en-IN')}/mo.`
    : `PF calculated at 12% of actual Basic Salary (₹${Math.round(annualBasicSalary / 12).toLocaleString('en-IN')}/mo) = ₹${employeePFMonthly.toLocaleString('en-IN')}/mo.`;

  return {
    eligibleWageAnnual,
    eligibleWageMonthly: Math.round(eligibleWageAnnual / 12),
    employeePFAnnual,
    employeePFMonthly,
    employerPFAnnual,
    employerPFMonthly,
    isCappedAtCeiling: isCapped,
    explanation,
  };
}
