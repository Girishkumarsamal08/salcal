import { MetroCity } from './types';

export interface HRACalculationBreakdown {
  actualHraReceived: number;
  basicSalary: number;
  rentPaidAnnually: number;
  cityCategory: MetroCity;
  percentLimitAmount: number; // 50% or 40% of basic
  rentMinus10PercentBasic: number; // Rent paid - 10% of basic
  exemptAmount: number;
  taxableHra: number;
  governingCondition: 'actual_hra' | 'city_percentage' | 'rent_minus_10_percent' | 'no_rent';
  explanation: string;
}

/**
 * Calculates HRA exemption under Section 10(13A) of the Income Tax Act, 1961
 * Exemption is the MINIMUM of:
 * 1. Actual HRA received
 * 2. 50% of Basic salary (for Delhi, Mumbai, Kolkata, Chennai) or 40% (for other cities)
 * 3. Actual rent paid minus 10% of Basic salary
 */
export function calculateHRAExemption(
  basicSalary: number,
  actualHraReceived: number,
  rentPaidAnnually: number,
  cityCategory: MetroCity
): HRACalculationBreakdown {
  const safeBasic = Math.max(0, basicSalary);
  const safeHra = Math.max(0, actualHraReceived);
  const safeRent = Math.max(0, rentPaidAnnually);

  if (safeRent === 0 || safeHra === 0) {
    return {
      actualHraReceived: safeHra,
      basicSalary: safeBasic,
      rentPaidAnnually: safeRent,
      cityCategory,
      percentLimitAmount: 0,
      rentMinus10PercentBasic: 0,
      exemptAmount: 0,
      taxableHra: safeHra,
      governingCondition: 'no_rent',
      explanation: safeRent === 0
        ? 'No rent declared. HRA is fully taxable.'
        : 'No HRA received from employer.',
    };
  }

  // Condition 1: Actual HRA received
  const cond1 = safeHra;

  // Condition 2: 50% for Metro, 40% for Non-Metro
  const percentage = cityCategory === 'metro' ? 0.50 : 0.40;
  const cond2 = safeBasic * percentage;

  // Condition 3: Rent paid minus 10% of Basic
  const tenPercentBasic = safeBasic * 0.10;
  const cond3 = Math.max(0, safeRent - tenPercentBasic);

  // Exemption is the minimum of the three
  let exemptAmount = Math.min(cond1, cond2, cond3);
  exemptAmount = Math.max(0, Math.round(exemptAmount));

  let governingCondition: 'actual_hra' | 'city_percentage' | 'rent_minus_10_percent' = 'actual_hra';
  if (exemptAmount === cond3) {
    governingCondition = 'rent_minus_10_percent';
  } else if (exemptAmount === cond2) {
    governingCondition = 'city_percentage';
  }

  const taxableHra = Math.max(0, safeHra - exemptAmount);

  let explanation = '';
  if (cond3 === 0) {
    explanation = 'Rent paid does not exceed 10% of basic salary. HRA exemption is ₹0.';
  } else if (governingCondition === 'actual_hra') {
    explanation = 'Exemption is capped at the actual HRA received from your employer.';
  } else if (governingCondition === 'city_percentage') {
    explanation = `Exemption is capped at ${cityCategory === 'metro' ? '50%' : '40%'} of basic salary (${cityCategory.toUpperCase()}).`;
  } else {
    explanation = 'Exemption is determined by actual rent paid minus 10% of basic salary.';
  }

  return {
    actualHraReceived: safeHra,
    basicSalary: safeBasic,
    rentPaidAnnually: safeRent,
    cityCategory,
    percentLimitAmount: cond2,
    rentMinus10PercentBasic: cond3,
    exemptAmount,
    taxableHra,
    governingCondition,
    explanation,
  };
}
