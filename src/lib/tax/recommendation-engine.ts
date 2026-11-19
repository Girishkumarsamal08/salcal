import { AdditionalDeductions, FinancialYear, SalaryComponents, TaxComparisonRecommendation } from './types';
import { calculateOldTaxRegime } from './old-regime';
import { calculateNewTaxRegime } from './new-regime';
import { SECTION_80C_MAX_LIMIT } from './epf-intelligence';

/**
 * Compares Old vs New Tax Regimes and generates intelligent recommendation
 * with explicit mathematical explanations and breakdown factors.
 */
export function recommendTaxRegime(
  salary: SalaryComponents,
  deductions: AdditionalDeductions,
  fy: FinancialYear = '2024-2025'
): TaxComparisonRecommendation {
  const oldRegimeResult = calculateOldTaxRegime(salary, deductions, fy);
  const newRegimeResult = calculateNewTaxRegime(salary, deductions, fy);

  const oldTax = oldRegimeResult.finalTaxLiability;
  const newTax = newRegimeResult.finalTaxLiability;
  const taxDifference = Math.abs(oldTax - newTax);
  const monthlySavings = Math.round(taxDifference / 12);

  let recommendedRegime: 'OLD' | 'NEW' | 'EQUAL' = 'EQUAL';
  let headlineExplanation = '';

  if (oldTax < newTax) {
    recommendedRegime = 'OLD';
    headlineExplanation = `Based on your salary and claimed deductions, the Old Tax Regime saves you approximately ₹${taxDifference.toLocaleString('en-IN')} annually (approx. ₹${monthlySavings.toLocaleString('en-IN')}/month) compared with the New Tax Regime.`;
  } else if (newTax < oldTax) {
    recommendedRegime = 'NEW';
    headlineExplanation = `The New Tax Regime saves you approximately ₹${taxDifference.toLocaleString('en-IN')} annually (approx. ₹${monthlySavings.toLocaleString('en-IN')}/month) due to lower slab rates and a higher Standard Deduction of ₹${newRegimeResult.exemptions.standardDeduction.toLocaleString('en-IN')}.`;
  } else {
    recommendedRegime = 'EQUAL';
    headlineExplanation = `Both tax regimes yield the exact same estimated tax liability of ₹${oldTax.toLocaleString('en-IN')}. You may choose the New Tax Regime for simpler compliance and zero paperwork.`;
  }

  // Identify detailed factors driving the difference
  const detailedFactors: {
    category: string;
    description: string;
    impactAmount?: number;
    impactType: 'favorable_old' | 'favorable_new' | 'neutral';
  }[] = [];

  // 1. Standard deduction impact
  const stdDiff = newRegimeResult.exemptions.standardDeduction - oldRegimeResult.exemptions.standardDeduction;
  if (stdDiff > 0) {
    detailedFactors.push({
      category: 'Standard Deduction',
      description: `New Regime provides an enhanced Standard Deduction of ₹${newRegimeResult.exemptions.standardDeduction.toLocaleString('en-IN')} vs ₹${oldRegimeResult.exemptions.standardDeduction.toLocaleString('en-IN')} in the Old Regime (₹${stdDiff.toLocaleString('en-IN')} extra deduction).`,
      impactAmount: stdDiff,
      impactType: 'favorable_new',
    });
  }

  // 2. HRA Exemption impact
  if (oldRegimeResult.exemptions.hraExemption > 0) {
    detailedFactors.push({
      category: 'House Rent Allowance (HRA)',
      description: `Old Regime allows ₹${oldRegimeResult.exemptions.hraExemption.toLocaleString('en-IN')} tax exemption on rent paid under Section 10(13A). This exemption is unavailable in the New Regime.`,
      impactAmount: oldRegimeResult.exemptions.hraExemption,
      impactType: 'favorable_old',
    });
  }

  // 3. Section 80C impact
  if (oldRegimeResult.deductions.section80C > 0) {
    detailedFactors.push({
      category: 'Section 80C Deductions',
      description: `Old Regime allows ₹${oldRegimeResult.deductions.section80C.toLocaleString('en-IN')} deduction (including employee PF of ₹${oldRegimeResult.deductions.section80CDetails.epf.toLocaleString('en-IN')}). Not deductible in New Regime.`,
      impactAmount: oldRegimeResult.deductions.section80C,
      impactType: 'favorable_old',
    });
  }

  // 4. Section 80D Health Insurance impact
  if (oldRegimeResult.deductions.section80D > 0) {
    detailedFactors.push({
      category: 'Health Insurance (Section 80D)',
      description: `Old Regime allows medical insurance premium deduction of ₹${oldRegimeResult.deductions.section80D.toLocaleString('en-IN')}. Not deductible in New Regime.`,
      impactAmount: oldRegimeResult.deductions.section80D,
      impactType: 'favorable_old',
    });
  }

  // 5. Home Loan Interest 24(b)
  if (oldRegimeResult.deductions.section24b > 0) {
    detailedFactors.push({
      category: 'Home Loan Interest (Sec 24b)',
      description: `Old Regime allows ₹${oldRegimeResult.deductions.section24b.toLocaleString('en-IN')} deduction on interest paid for self-occupied home loan. Not deductible in New Regime.`,
      impactAmount: oldRegimeResult.deductions.section24b,
      impactType: 'favorable_old',
    });
  }

  // 6. Section 80CCD(1B) NPS Self
  if (oldRegimeResult.deductions.section80CCD1B > 0) {
    detailedFactors.push({
      category: 'NPS Self Contribution (80CCD 1B)',
      description: `Additional NPS tax deduction of ₹${oldRegimeResult.deductions.section80CCD1B.toLocaleString('en-IN')} claimed under Old Regime. Not deductible in New Regime.`,
      impactAmount: oldRegimeResult.deductions.section80CCD1B,
      impactType: 'favorable_old',
    });
  }

  // 7. Employer NPS 80CCD(2)
  if (newRegimeResult.deductions.section80CCD2 > 0) {
    detailedFactors.push({
      category: 'Employer NPS (Section 80CCD 2)',
      description: `Employer NPS contribution of ₹${newRegimeResult.deductions.section80CCD2.toLocaleString('en-IN')} is tax-deductible in BOTH regimes up to 14% of Basic salary.`,
      impactAmount: newRegimeResult.deductions.section80CCD2,
      impactType: 'neutral',
    });
  }

  // Calculate Break-even deductions needed if New Regime won
  let breakEvenDeductionNeeded: number | undefined;
  if (recommendedRegime === 'NEW' && newRegimeResult.taxableIncome > 700000) {
    // Estimate total deductions under Old Regime needed to match New Regime's tax
    breakEvenDeductionNeeded = estimateBreakEvenDeductions(salary, deductions, newTax, fy);
  }

  return {
    recommendedRegime,
    taxSavings: taxDifference,
    monthlySavings,
    oldRegimeResult,
    newRegimeResult,
    headlineExplanation,
    detailedFactors,
    breakEvenDeductionNeeded,
  };
}

/**
 * Computes the total deductions required in the Old Regime to match the New Regime tax liability
 */
function estimateBreakEvenDeductions(
  salary: SalaryComponents,
  baseDeductions: AdditionalDeductions,
  targetTax: number,
  fy: FinancialYear
): number {
  let low = 0;
  let high = 1500000;
  let bestEstimate = 0;

  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const testDeductions: AdditionalDeductions = {
      ...baseDeductions,
      other80CInvestments: SECTION_80C_MAX_LIMIT,
      rentPaidAnnually: mid,
      cityCategory: 'metro',
    };

    const result = calculateOldTaxRegime(salary, testDeductions, fy);
    if (result.finalTaxLiability <= targetTax) {
      bestEstimate = result.deductions.totalDeductions + result.exemptions.hraExemption;
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.round(bestEstimate / 5000) * 5000;
}
