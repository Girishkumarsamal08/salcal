'use client';

import React, { useState } from 'react';
import { AdditionalDeductions, SalaryComponents } from '@/lib/tax/types';
import { calculateHRAExemption } from '@/lib/tax/hra-intelligence';
import { analyzeEPFContributions, SECTION_80C_MAX_LIMIT } from '@/lib/tax/epf-intelligence';
import { formatINR } from '@/lib/utils';
import {
  Home,
  ShieldCheck,
  PiggyBank,
  GraduationCap,
  HeartPulse,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DeductionsFormProps {
  salary: SalaryComponents;
  initialDeductions: AdditionalDeductions;
  onCalculate: (deductions: AdditionalDeductions) => void;
  onBack: () => void;
}

export function DeductionsForm({
  salary,
  initialDeductions,
  onCalculate,
  onBack,
}: DeductionsFormProps) {
  const [deductions, setDeductions] = useState<AdditionalDeductions>(initialDeductions);

  // Live HRA calculation
  const liveHRA = calculateHRAExemption(
    salary.basicSalary,
    salary.hraReceived,
    deductions.rentPaidAnnually,
    deductions.cityCategory
  );

  // Live 80C calculation
  const live80C = analyzeEPFContributions(
    salary.employeePF,
    salary.employerPF,
    deductions.other80CInvestments
  );

  const updateField = (key: keyof AdditionalDeductions, value: any) => {
    setDeductions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNumberInput = (key: keyof AdditionalDeductions, rawVal: string) => {
    const num = Math.max(0, parseFloat(rawVal.replace(/,/g, '')) || 0);
    updateField(key, num);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tax Deductions & Additional Income
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Specify eligible exemptions and Chapter VI-A investments to discover your maximum tax savings.
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Basic Salary: {formatINR(salary.basicSalary)}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. HRA & Rent Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                House Rent Allowance (HRA) Details
              </h3>
              <p className="text-[11px] text-slate-500">
                Section 10(13A) exemption applies only under the Old Tax Regime.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Annual Rent Paid
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.rentPaidAnnually || ''}
                  onChange={(e) => handleNumberInput('rentPaidAnnually', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter ₹0 if you own a home or pay no rent. (e.g. ₹15,000/mo = ₹1,80,000/yr)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                City Category
              </label>
              <select
                value={deductions.cityCategory}
                onChange={(e) => updateField('cityCategory', e.target.value as any)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900 bg-white"
              >
                <option value="metro">Metro (Delhi, Mumbai, Kolkata, Chennai) - 50% limit</option>
                <option value="non-metro">Non-Metro (Bengaluru, Hyderabad, Pune, etc.) - 40% limit</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Income tax rules define metro strictly as Delhi, Mumbai, Kolkata, and Chennai.
              </p>
            </div>
          </div>

          {/* Live HRA Exemption Callout */}
          {salary.hraReceived > 0 && deductions.rentPaidAnnually > 0 && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between text-xs text-emerald-950">
              <div>
                <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Eligible HRA Exemption: {formatINR(liveHRA.exemptAmount)}
                </span>
                <p className="text-emerald-800 text-[11px] mt-0.5">{liveHRA.explanation}</p>
              </div>
              <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-700">
                Taxable HRA: {formatINR(liveHRA.taxableHra)}
              </span>
            </div>
          )}
        </div>

        {/* 2. Section 80C Investments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Section 80C Deductions (Max ₹1,50,000)
              </h3>
              <p className="text-[11px] text-slate-500">
                Combined cap for Employee EPF, PPF, ELSS Mutual Funds, Life Insurance, Tuition Fees, etc.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Employee EPF (Auto-Included)
              </label>
              <div className="w-full px-3 py-2 text-sm font-semibold rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                {formatINR(salary.employeePF)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Your annual EPF contribution is automatically counted toward your 80C limit.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Other 80C Investments
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.other80CInvestments || ''}
                  onChange={(e) => handleNumberInput('other80CInvestments', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                PPF, ELSS Tax-saver funds, NSC, LIC, Home loan principal repayment.
              </p>
            </div>
          </div>

          {/* 80C Progress Meter */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">
                Total 80C Claimed: {formatINR(live80C.combined80CTotal)}
              </span>
              <span className="font-bold text-emerald-700">
                Allowed Deduction: {formatINR(live80C.allowed80CDeduction)} / ₹1,50,000
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  live80C.hasCapped80C ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, (live80C.combined80CTotal / SECTION_80C_MAX_LIMIT) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{live80C.explanation[0]}</p>
          </div>
        </div>

        {/* 3. Section 80D Health Insurance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Section 80D – Medical Insurance Premium
              </h3>
              <p className="text-[11px] text-slate-500">
                Deduction for self, family, and parents medical insurance and preventive health checkups.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Self, Spouse & Children
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deductions.isSelfSeniorCitizen}
                    onChange={(e) => updateField('isSelfSeniorCitizen', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-purple-500"
                  />
                  <span>Senior Citizen (60+ yrs)</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.healthInsuranceSelfFamily || ''}
                  onChange={(e) => handleNumberInput('healthInsuranceSelfFamily', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Limit: {deductions.isSelfSeniorCitizen ? '₹50,000 (Senior Citizen)' : '₹25,000 (Regular)'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Parents Health Insurance
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="parentsAge"
                      checked={deductions.parentsAgeCategory === 'regular'}
                      onChange={() => updateField('parentsAgeCategory', 'regular')}
                      className="text-emerald-600"
                    />
                    <span>&lt;60 yrs</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="parentsAge"
                      checked={deductions.parentsAgeCategory === 'senior'}
                      onChange={() => updateField('parentsAgeCategory', 'senior')}
                      className="text-emerald-600"
                    />
                    <span>Senior (60+)</span>
                  </label>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.healthInsuranceParents || ''}
                  onChange={(e) => handleNumberInput('healthInsuranceParents', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Limit: {deductions.parentsAgeCategory === 'senior' ? '₹50,000 (Senior Parents)' : '₹25,000 (Regular)'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preventive Health Checkup
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.preventiveHealthCheckup || ''}
                  onChange={(e) => handleNumberInput('preventiveHealthCheckup', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Max ₹5,000 total (within the overall Section 80D ceiling).
              </p>
            </div>
          </div>
        </div>

        {/* 4. NPS, Home Loan & Other Deductions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                NPS, Home Loan & Education Loan
              </h3>
              <p className="text-[11px] text-slate-500">
                High-impact tax deductions including Section 24(b) and Section 80CCD(1B).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* NPS Self 80CCD(1B) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                NPS Self Contribution (Sec 80CCD 1B)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.npsSelfContribution || ''}
                  onChange={(e) => handleNumberInput('npsSelfContribution', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Additional exclusive NPS deduction up to ₹50,000 (over and above 80C). Old Regime only.
              </p>
            </div>

            {/* Employer NPS 80CCD(2) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Employer NPS Contribution (Sec 80CCD 2)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.employerNPSContribution || ''}
                  onChange={(e) => handleNumberInput('employerNPSContribution', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Deductible up to 14% of Basic pay in <span className="font-bold text-emerald-700">BOTH</span> Old and New regimes!
              </p>
            </div>

            {/* Home Loan Interest 24(b) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Home Loan Interest (Section 24b)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.homeLoanInterestSelfOccupied || ''}
                  onChange={(e) => handleNumberInput('homeLoanInterestSelfOccupied', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Interest paid on loan for self-occupied home (capped at ₹2,00,000). Old Regime only.
              </p>
            </div>

            {/* Education Loan Interest 80E */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Education Loan Interest (Section 80E)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.educationLoanInterest || ''}
                  onChange={(e) => handleNumberInput('educationLoanInterest', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Interest paid on higher education loan for self, spouse, or children (no upper limit).
              </p>
            </div>
          </div>
        </div>

        {/* 5. Other Income */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Other Income Sources
              </h3>
              <p className="text-[11px] text-slate-500">
                Interest on savings/FDs, rental earnings, or freelancing income.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Interest Income (Savings / FD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.interestIncome || ''}
                  onChange={(e) => handleNumberInput('interestIncome', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Rental Income (Net)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.rentalIncome || ''}
                  onChange={(e) => handleNumberInput('rentalIncome', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Other Taxable Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={deductions.otherIncome || ''}
                  onChange={(e) => handleNumberInput('otherIncome', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Salary Components</span>
          </button>

          <button
            type="button"
            onClick={() => onCalculate(deductions)}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Compare Regimes & Get Recommendation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
