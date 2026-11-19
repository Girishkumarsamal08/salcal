'use client';

import React, { useState } from 'react';
import { FinancialYear, SalaryComponents, AdditionalDeductions, ExtractedSalaryData, TaxComparisonRecommendation } from '@/lib/tax/types';
import { recommendTaxRegime } from '@/lib/tax/recommendation-engine';
import { DEMO_PROFILES, DemoProfile } from '@/lib/demo-data';
import { Navbar } from '@/components/Navbar';
import { LandingHero } from '@/components/LandingHero';
import { SalaryUpload } from '@/components/SalaryUpload';
import { SalaryReviewForm } from '@/components/SalaryReviewForm';
import { DeductionsForm } from '@/components/DeductionsForm';
import { ComparisonDashboard } from '@/components/ComparisonDashboard';

const defaultSalary: SalaryComponents = {
  basicSalary: 600000,
  hraReceived: 240000,
  specialAllowance: 200000,
  lta: 30000,
  bonus: 80000,
  otherAllowances: 0,
  employeePF: 72000,
  employerPF: 72000,
  professionalTax: 2500,
};

const defaultDeductions: AdditionalDeductions = {
  other80CInvestments: 80000,
  healthInsuranceSelfFamily: 20000,
  isSelfSeniorCitizen: false,
  healthInsuranceParents: 25000,
  parentsAgeCategory: 'senior',
  preventiveHealthCheckup: 5000,
  npsSelfContribution: 50000,
  employerNPSContribution: 0,
  homeLoanInterestSelfOccupied: 0,
  educationLoanInterest: 0,
  savingsInterestDeduction: 10000,
  otherDeductions: 0,
  interestIncome: 10000,
  rentalIncome: 0,
  otherIncome: 0,
  rentPaidAnnually: 180000, // 15k/month
  cityCategory: 'metro',
};

type AppStep = 'landing' | 'upload' | 'review-salary' | 'deductions' | 'dashboard';

export default function TaxWiseApp() {
  const [financialYear, setFinancialYear] = useState<FinancialYear>('2024-2025');
  const [step, setStep] = useState<AppStep>('landing');
  const [salary, setSalary] = useState<SalaryComponents>(defaultSalary);
  const [deductions, setDeductions] = useState<AdditionalDeductions>(defaultDeductions);
  const [extractedMeta, setExtractedMeta] = useState<ExtractedSalaryData | null>(null);
  const [recommendation, setRecommendation] = useState<TaxComparisonRecommendation | null>(null);

  // Load a sample demo profile
  const handleSelectDemo = (profile: DemoProfile) => {
    setSalary(profile.salary);
    setDeductions(profile.deductions);
    setExtractedMeta(null);
    const rec = recommendTaxRegime(profile.salary, profile.deductions, financialYear);
    setRecommendation(rec);
    setStep('dashboard');
  };

  // Switch FY and recalculate if already in dashboard
  const handleFYChange = (newFY: FinancialYear) => {
    setFinancialYear(newFY);
    if (recommendation) {
      const updated = recommendTaxRegime(salary, deductions, newFY);
      setRecommendation(updated);
    }
  };

  // Document extraction callback
  const handleExtractionComplete = (data: ExtractedSalaryData) => {
    setExtractedMeta(data);

    // Populate salary from extracted data
    setSalary({
      basicSalary: data.basicSalary.value,
      hraReceived: data.hraReceived.value,
      specialAllowance: data.specialAllowance.value,
      lta: data.lta.value,
      bonus: data.bonus.value,
      otherAllowances: data.otherAllowances.value,
      employeePF: data.employeePF.value,
      employerPF: data.employerPF.value,
      professionalTax: data.professionalTax.value || 2500,
    });

    setStep('review-salary');
  };

  // Salary confirmed -> Proceed to deductions
  const handleSalaryConfirmed = (confirmedSalary: SalaryComponents) => {
    setSalary(confirmedSalary);
    setStep('deductions');
  };

  // Deductions submitted -> Calculate & Show Dashboard
  const handleCalculate = (finalDeductions: AdditionalDeductions) => {
    setDeductions(finalDeductions);
    const rec = recommendTaxRegime(salary, finalDeductions, financialYear);
    setRecommendation(rec);
    setStep('dashboard');
  };

  // Reset to landing
  const handleReset = () => {
    setStep('landing');
    setExtractedMeta(null);
    setRecommendation(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <Navbar
        currentFY={financialYear}
        onFYChange={handleFYChange}
        onSelectDemo={handleSelectDemo}
        onReset={handleReset}
        hasCalculated={!!recommendation}
        onOpenReport={() => setStep('dashboard')}
      />

      {/* Main Body */}
      <main className="flex-1">
        {step === 'landing' && (
          <LandingHero
            onStartUpload={() => setStep('upload')}
            onStartManual={() => setStep('review-salary')}
            onSelectDemo={handleSelectDemo}
          />
        )}

        {step === 'upload' && (
          <SalaryUpload
            onExtractionComplete={handleExtractionComplete}
            onSwitchToManual={() => setStep('review-salary')}
          />
        )}

        {step === 'review-salary' && (
          <SalaryReviewForm
            initialSalary={salary}
            extractedMeta={extractedMeta}
            onConfirm={handleSalaryConfirmed}
            onBack={() => setStep(extractedMeta ? 'upload' : 'landing')}
          />
        )}

        {step === 'deductions' && (
          <DeductionsForm
            salary={salary}
            initialDeductions={deductions}
            onCalculate={handleCalculate}
            onBack={() => setStep('review-salary')}
          />
        )}

        {step === 'dashboard' && recommendation && (
          <ComparisonDashboard
            recommendation={recommendation}
            salary={salary}
            deductions={deductions}
            onEditSalary={() => setStep('review-salary')}
            onEditDeductions={() => setStep('deductions')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2025–2026 SALCAL – Smart Tax Regime Advisor & Salary Analyzer</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Budget 2025 & Finance Act 2024 Verified</span>
            <span>•</span>
            <span>Section 115BAC & Old Regime</span>
            <span>•</span>
            <span>Privacy First (Zero Document Storage)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
