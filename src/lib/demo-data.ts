import { AdditionalDeductions, SalaryComponents } from './tax/types';

export interface DemoProfile {
  id: string;
  name: string;
  designation: string;
  badge: string;
  description: string;
  annualSalaryLPA: string;
  salary: SalaryComponents;
  deductions: AdditionalDeductions;
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'fresher-5lpa',
    name: 'Aarav Sharma',
    designation: 'Associate Software Engineer',
    badge: 'Zero Tax (New Regime)',
    description: 'Entry-level professional with minimal investment history. Both regimes yield zero tax under 87A rebate, with New Regime offering zero documentation hassle.',
    annualSalaryLPA: '₹5,00,000 (₹5 LPA)',
    salary: {
      basicSalary: 250000,
      hraReceived: 100000,
      specialAllowance: 100000,
      lta: 20000,
      bonus: 30000,
      otherAllowances: 0,
      employeePF: 30000,
      employerPF: 30000,
      professionalTax: 2400,
    },
    deductions: {
      other80CInvestments: 20000, // Combined 80C = 50k
      healthInsuranceSelfFamily: 10000,
      isSelfSeniorCitizen: false,
      healthInsuranceParents: 0,
      parentsAgeCategory: 'regular',
      preventiveHealthCheckup: 0,
      npsSelfContribution: 0,
      employerNPSContribution: 0,
      homeLoanInterestSelfOccupied: 0,
      educationLoanInterest: 0,
      savingsInterestDeduction: 4000,
      otherDeductions: 0,
      interestIncome: 5000,
      rentalIncome: 0,
      otherIncome: 0,
      rentPaidAnnually: 96000, // 8k/mo
      cityCategory: 'metro',
    },
  },
  {
    id: 'midlevel-10lpa',
    name: 'Pooja Verma',
    designation: 'Product Manager',
    badge: 'Old Regime Saves ₹18k+',
    description: 'Paying rent in Bengaluru/Mumbai and investing in 80C + 80D. Old Regime wins significantly due to high HRA and Section 80C deductions.',
    annualSalaryLPA: '₹10,50,000 (₹10.5 LPA)',
    salary: {
      basicSalary: 450000,
      hraReceived: 220000,
      specialAllowance: 250000,
      lta: 40000,
      bonus: 90000,
      otherAllowances: 0,
      employeePF: 54000,
      employerPF: 54000,
      professionalTax: 2500,
    },
    deductions: {
      other80CInvestments: 100000, // Total 80C = 54k + 100k = 1.54L (capped at 1.5L)
      healthInsuranceSelfFamily: 22000,
      isSelfSeniorCitizen: false,
      healthInsuranceParents: 25000, // Parents insurance
      parentsAgeCategory: 'senior',
      preventiveHealthCheckup: 5000,
      npsSelfContribution: 50000, // 80CCD(1B)
      employerNPSContribution: 0,
      homeLoanInterestSelfOccupied: 0,
      educationLoanInterest: 0,
      savingsInterestDeduction: 8000,
      otherDeductions: 0,
      interestIncome: 12000,
      rentalIncome: 0,
      otherIncome: 0,
      rentPaidAnnually: 216000, // ₹18,000/month rent in Metro
      cityCategory: 'metro',
    },
  },
  {
    id: 'homeowner-15lpa',
    name: 'Vikram Joshi',
    designation: 'Lead DevOps Engineer',
    badge: 'Old Regime Wins (Home Loan)',
    description: 'Homeowner servicing a home loan with ₹2 Lakhs interest under Sec 24(b), plus family insurance and NPS.',
    annualSalaryLPA: '₹15,00,000 (₹15 LPA)',
    salary: {
      basicSalary: 650000,
      hraReceived: 280000,
      specialAllowance: 380000,
      lta: 50000,
      bonus: 140000,
      otherAllowances: 0,
      employeePF: 78000,
      employerPF: 78000,
      professionalTax: 2500,
    },
    deductions: {
      other80CInvestments: 80000, // 80C capped at 1.5L
      healthInsuranceSelfFamily: 25000,
      isSelfSeniorCitizen: false,
      healthInsuranceParents: 50000,
      parentsAgeCategory: 'senior',
      preventiveHealthCheckup: 5000,
      npsSelfContribution: 50000,
      employerNPSContribution: 60000,
      homeLoanInterestSelfOccupied: 200000, // ₹2L interest
      educationLoanInterest: 0,
      savingsInterestDeduction: 10000,
      otherDeductions: 0,
      interestIncome: 15000,
      rentalIncome: 0,
      otherIncome: 0,
      rentPaidAnnually: 0, // Owns home
      cityCategory: 'metro',
    },
  },
  {
    id: 'experienced-18lpa',
    name: 'Sneha Patel',
    designation: 'Engineering Manager',
    badge: 'New Regime Wins (Lower Slabs)',
    description: 'High salary professional without home loan or high rent. New Regime wins due to lower slab rates (up to ₹15L) and ₹75,000 standard deduction.',
    annualSalaryLPA: '₹18,00,000 (₹18 LPA)',
    salary: {
      basicSalary: 800000,
      hraReceived: 350000,
      specialAllowance: 450000,
      lta: 60000,
      bonus: 140000,
      otherAllowances: 0,
      employeePF: 96000,
      employerPF: 96000,
      professionalTax: 2500,
    },
    deductions: {
      other80CInvestments: 54000, // 80C total = 1.5L
      healthInsuranceSelfFamily: 20000,
      isSelfSeniorCitizen: false,
      healthInsuranceParents: 0,
      parentsAgeCategory: 'regular',
      preventiveHealthCheckup: 0,
      npsSelfContribution: 0,
      employerNPSContribution: 50000,
      homeLoanInterestSelfOccupied: 0,
      educationLoanInterest: 0,
      savingsInterestDeduction: 5000,
      otherDeductions: 0,
      interestIncome: 25000,
      rentalIncome: 0,
      otherIncome: 0,
      rentPaidAnnually: 60000, // Small rent
      cityCategory: 'non-metro',
    },
  },
];
