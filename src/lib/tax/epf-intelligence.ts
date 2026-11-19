export interface EPFAnalysis {
  employeePF: number;
  employerPF: number;
  isEmployerPFExempt: boolean;
  taxableEmployerPFPerquisite: number;
  eligible80CDeductionFromPF: number;
  combined80CTotal: number;
  allowed80CDeduction: number;
  unutilized80CLimit: number;
  hasCapped80C: boolean;
  explanation: string[];
}

export const ANNUAL_EMPLOYER_RETIREMENT_TAX_FREE_CAP = 750000; // Combined EPF, NPS, Superannuation
export const SECTION_80C_MAX_LIMIT = 150000;

/**
 * Analyzes employee & employer EPF contributions and Section 80C interactions.
 * Ensures no double counting and respects statutory limits.
 */
export function analyzeEPFContributions(
  employeePF: number,
  employerPF: number,
  other80CInvestments: number = 0
): EPFAnalysis {
  const safeEmpPF = Math.max(0, employeePF);
  const safeEmplrPF = Math.max(0, employerPF);
  const safeOther80C = Math.max(0, other80CInvestments);

  // Employer contribution tax treatment:
  // Under Section 17(2)(vii), aggregate employer contributions to EPF, NPS & Superannuation
  // exceeding ₹7,50,000 per year are taxable as perquisite.
  let taxableEmployerPFPerquisite = 0;
  if (safeEmplrPF > ANNUAL_EMPLOYER_RETIREMENT_TAX_FREE_CAP) {
    taxableEmployerPFPerquisite = safeEmplrPF - ANNUAL_EMPLOYER_RETIREMENT_TAX_FREE_CAP;
  }
  const isEmployerPFExempt = taxableEmployerPFPerquisite === 0;

  // Employee contribution towards Section 80C
  const combined80CTotal = safeEmpPF + safeOther80C;
  const allowed80CDeduction = Math.min(SECTION_80C_MAX_LIMIT, combined80CTotal);
  const unutilized80CLimit = Math.max(0, SECTION_80C_MAX_LIMIT - combined80CTotal);
  const hasCapped80C = combined80CTotal > SECTION_80C_MAX_LIMIT;

  const explanations: string[] = [];

  if (safeEmpPF > 0) {
    explanations.push(
      `Your annual employee EPF of ₹${safeEmpPF.toLocaleString('en-IN')} is eligible under Section 80C.`
    );
  }

  if (hasCapped80C) {
    explanations.push(
      `Your total Section 80C investments (EPF ₹${safeEmpPF.toLocaleString('en-IN')} + Other ₹${safeOther80C.toLocaleString('en-IN')} = ₹${combined80CTotal.toLocaleString('en-IN')}) exceed the statutory ₹1,50,000 cap. Allowed deduction is capped at ₹1,50,000.`
    );
  } else if (unutilized80CLimit > 0) {
    explanations.push(
      `You have ₹${unutilized80CLimit.toLocaleString('en-IN')} of unutilized Section 80C investment limit available to save more tax in the Old Regime.`
    );
  }

  if (taxableEmployerPFPerquisite > 0) {
    explanations.push(
      `Employer EPF exceeds the ₹7,50,000 annual threshold under Section 17(2)(vii) by ₹${taxableEmployerPFPerquisite.toLocaleString('en-IN')}, which will be added as taxable perquisite.`
    );
  } else if (safeEmplrPF > 0) {
    explanations.push(
      `Employer EPF contribution of ₹${safeEmplrPF.toLocaleString('en-IN')} is fully tax-exempt (under the ₹7.5L combined cap).`
    );
  }

  return {
    employeePF: safeEmpPF,
    employerPF: safeEmplrPF,
    isEmployerPFExempt,
    taxableEmployerPFPerquisite,
    eligible80CDeductionFromPF: safeEmpPF,
    combined80CTotal,
    allowed80CDeduction,
    unutilized80CLimit,
    hasCapped80C,
    explanation: explanations,
  };
}
