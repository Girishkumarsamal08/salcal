/**
 * Statutory Gratuity Provision Calculator
 * Under Section 4(2) of the Payment of Gratuity Act, 1972:
 * Gratuity accrual for 1 completed year of service = 15 days of basic wages.
 * 15 days of wages = (15 / 26) * Monthly Basic = (15 / (26 * 12)) * Annual Basic ≈ 4.8077% of Basic.
 */

export interface GratuityCalculationInput {
  annualBasicSalary: number;
  includeGratuity: boolean;
}

export interface GratuityCalculationResult {
  annualGratuity: number;
  monthlyGratuity: number;
  percentageOfBasic: number;
  explanation: string;
}

export function calculateGratuityProvision({
  annualBasicSalary,
  includeGratuity,
}: GratuityCalculationInput): GratuityCalculationResult {
  if (!includeGratuity || annualBasicSalary <= 0) {
    return {
      annualGratuity: 0,
      monthlyGratuity: 0,
      percentageOfBasic: 0,
      explanation: 'Gratuity provision is not included in this CTC structure.',
    };
  }

  // Exact statutory formula: 15 / 26 * (Annual Basic / 12)
  const annualGratuity = Math.round((15 / 26) * (annualBasicSalary / 12));
  const monthlyGratuity = Math.round(annualGratuity / 12);
  const percentageOfBasic = Number(((annualGratuity / annualBasicSalary) * 100).toFixed(2));

  return {
    annualGratuity,
    monthlyGratuity,
    percentageOfBasic,
    explanation: `Statutory 15 days' wages per year = (15/26) × (Basic/12) ≈ 4.81% of Basic (₹${annualGratuity.toLocaleString('en-IN')}/year).`,
  };
}
