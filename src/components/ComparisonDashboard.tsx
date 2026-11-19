'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TaxComparisonRecommendation, SalaryComponents, AdditionalDeductions } from '@/lib/tax/types';
import { formatINR } from '@/lib/utils';
import { VisualCharts } from './VisualCharts';
import { ComparisonTable } from './ComparisonTable';
import { generateTaxPDFReport } from '@/lib/reports/pdf-report';
import { recommendTaxRegime } from '@/lib/tax/recommendation-engine';
import confetti from 'canvas-confetti';
import {
  Download,
  Printer,
  Edit2,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
  Info,
  Wallet,
  Sliders,
  TrendingUp,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

interface ComparisonDashboardProps {
  recommendation: TaxComparisonRecommendation;
  salary: SalaryComponents;
  deductions: AdditionalDeductions;
  onEditSalary: () => void;
  onEditDeductions: () => void;
}

export function ComparisonDashboard({
  recommendation: initialRecommendation,
  salary,
  deductions: initialDeductions,
  onEditSalary,
  onEditDeductions,
}: ComparisonDashboardProps) {
  // Simulator state for live interactive "What-If" analysis
  const [interactiveDeductions, setInteractiveDeductions] = useState<AdditionalDeductions>(initialDeductions);
  const [recommendation, setRecommendation] = useState<TaxComparisonRecommendation>(initialRecommendation);
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'ledger'>('overview');

  const {
    recommendedRegime,
    taxSavings,
    monthlySavings,
    oldRegimeResult,
    newRegimeResult,
    headlineExplanation,
    detailedFactors,
    breakEvenDeductionNeeded,
  } = recommendation;

  // Trigger confetti when there are meaningful tax savings
  useEffect(() => {
    if (taxSavings > 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#6366f1', '#059669', '#10b981'],
      });
    }
  }, [taxSavings]);

  // Recalculate on simulator changes
  const handleSimulatorChange = (key: keyof AdditionalDeductions, value: any) => {
    const updated = {
      ...interactiveDeductions,
      [key]: value,
    };
    setInteractiveDeductions(updated);
    const rec = recommendTaxRegime(salary, updated, oldRegimeResult.financialYear);
    setRecommendation(rec);
  };

  const handleQuickAdd = (key: keyof AdditionalDeductions, delta: number, maxCap?: number) => {
    const current = (interactiveDeductions[key] as number) || 0;
    const next = maxCap ? Math.min(maxCap, current + delta) : current + delta;
    handleSimulatorChange(key, next);
  };

  const handleResetSimulator = () => {
    setInteractiveDeductions(initialDeductions);
    setRecommendation(initialRecommendation);
  };

  const handleDownloadPDF = () => {
    const doc = generateTaxPDFReport(recommendation);
    doc.save(`SALCAL-Tax-Report-FY${oldRegimeResult.financialYear}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const isOldRecommended = recommendedRegime === 'OLD';
  const isNewRecommended = recommendedRegime === 'NEW';
  const isEqual = recommendedRegime === 'EQUAL';

  const winningResult = isOldRecommended ? oldRegimeResult : newRegimeResult;
  const otherResult = isOldRecommended ? newRegimeResult : oldRegimeResult;

  // Calculate Monthly In-Hand Cash Flow
  const monthlyGross = Math.round(salary.basicSalary + salary.hraReceived + salary.specialAllowance + salary.bonus + salary.lta + salary.otherAllowances) / 12;
  const monthlyEPF = Math.round(salary.employeePF / 12);
  const monthlyPT = Math.round(salary.professionalTax / 12);

  const monthlyOldTakeHome = Math.max(0, Math.round(monthlyGross - monthlyEPF - monthlyPT - oldRegimeResult.monthlyTaxLiability));
  const monthlyNewTakeHome = Math.max(0, Math.round(monthlyGross - monthlyEPF - newRegimeResult.monthlyTaxLiability));
  const takeHomeDiff = Math.abs(monthlyNewTakeHome - monthlyOldTakeHome);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-24">
              <Image
                src="/salcal-logo.png"
                alt="SALCAL"
                width={120}
                height={32}
                className="object-contain object-left h-7 w-auto"
                priority
              />
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
              FY {oldRegimeResult.financialYear} Analysis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Interactive side-by-side tax liability & take-home cash flow breakdown.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto no-print">
          <button
            type="button"
            onClick={onEditSalary}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Edit Salary</span>
          </button>
          <button
            type="button"
            onClick={onEditDeductions}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Edit Deductions</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            title="Print Summary"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Recommendation Hero Card */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-md transition-all ${
        isEqual
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 border-purple-900 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            {/* Regime Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-500/20 text-purple-200 border border-purple-400/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {isOldRecommended && 'OLD TAX REGIME RECOMMENDED'}
                {isNewRecommended && 'NEW TAX REGIME RECOMMENDED'}
                {isEqual && 'BOTH REGIMES HAVE EQUAL TAX LIABILITY'}
              </span>
            </div>

            {/* Savings Title */}
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {taxSavings > 0 ? (
                <>
                  You save <span className="text-emerald-400 font-mono">{formatINR(taxSavings)}</span> annually
                </>
              ) : (
                'Zero Tax Difference Between Regimes'
              )}
            </h2>

            {/* Explanation paragraph */}
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {headlineExplanation}
            </p>

            {/* Break-even insight if New Regime won */}
            {breakEvenDeductionNeeded && breakEvenDeductionNeeded > 0 && (
              <div className="inline-flex items-center gap-2 text-xs text-amber-200 bg-amber-950/60 border border-amber-800/80 px-3.5 py-2 rounded-xl">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Break-Even Insight: For the Old Regime to match the New Regime at this salary, you need total deductions of approx. <strong className="text-white">{formatINR(breakEvenDeductionNeeded)}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics Callout Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shrink-0 min-w-[290px] space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-slate-300">Recommended Tax:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {formatINR(winningResult.finalTaxLiability)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-slate-300">Alternative Tax:</span>
              <span className="text-base font-bold text-slate-400 font-mono line-through decoration-rose-500">
                {formatINR(otherResult.finalTaxLiability)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xs font-semibold text-purple-200">Extra In-Hand Take-Home:</span>
              <span className="text-base font-black text-emerald-300 font-mono">
                +{formatINR(monthlySavings)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Monthly Take-Home Bank Pay Comparison Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Estimated Monthly In-Hand Cash Flow (Bank Credit)
            </h3>
            <p className="text-xs text-slate-500">
              Actual estimated monthly salary deposited into your bank account after EPF and TDS tax deductions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Regime Take Home */}
          <div className={`p-4 rounded-xl border ${
            isOldRecommended ? 'bg-purple-50/60 border-purple-200' : 'bg-slate-50/60 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Old Regime Take-Home
              </span>
              {isOldRecommended && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Higher In-Hand
                </span>
              )}
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {formatINR(monthlyOldTakeHome)}<span className="text-xs font-normal text-slate-500">/mo</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex justify-between">
              <span>Gross: {formatINR(monthlyGross)}</span>
              <span>EPF: -{formatINR(monthlyEPF)}</span>
              <span>TDS: -{formatINR(oldRegimeResult.monthlyTaxLiability)}</span>
            </div>
          </div>

          {/* New Regime Take Home */}
          <div className={`p-4 rounded-xl border ${
            isNewRecommended ? 'bg-purple-50/60 border-purple-200' : 'bg-slate-50/60 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                New Regime Take-Home
              </span>
              {isNewRecommended && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Higher In-Hand
                </span>
              )}
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {formatINR(monthlyNewTakeHome)}<span className="text-xs font-normal text-slate-500">/mo</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex justify-between">
              <span>Gross: {formatINR(monthlyGross)}</span>
              <span>EPF: -{formatINR(monthlyEPF)}</span>
              <span>TDS: -{formatINR(newRegimeResult.monthlyTaxLiability)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive "What-If" Analysis Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Interactive "What-If" Analysis Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Simulate additional investments and see how they instantly impact your tax savings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetSimulator}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 self-start sm:self-auto font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>

        {/* Quick Add Chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickAdd('npsSelfContribution', 50000, 50000)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Max ₹50,000 NPS (80CCD 1B)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd('other80CInvestments', 50000, 150000)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ ₹50,000 ELSS/PPF (80C)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd('healthInsuranceParents', 25000, 50000)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ ₹25,000 Parents Insurance (80D)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd('homeLoanInterestSelfOccupied', 100000, 200000)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ ₹1,00,000 Home Loan Interest (24b)</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Slider 1: 80C Investments */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex justify-between font-bold mb-1.5 text-slate-800">
              <span>Other Section 80C Investments (PPF, ELSS, LIC)</span>
              <span className="font-mono text-purple-700">
                {formatINR(interactiveDeductions.other80CInvestments || 0)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="5000"
              value={interactiveDeductions.other80CInvestments || 0}
              onChange={(e) => handleSimulatorChange('other80CInvestments', Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹0</span>
              <span>₹75,000</span>
              <span>₹1,50,000 (Max Cap)</span>
            </div>
          </div>

          {/* Slider 2: NPS Self */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex justify-between font-bold mb-1.5 text-slate-800">
              <span>NPS Self Contribution (Sec 80CCD 1B)</span>
              <span className="font-mono text-purple-700">
                {formatINR(interactiveDeductions.npsSelfContribution || 0)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="5000"
              value={interactiveDeductions.npsSelfContribution || 0}
              onChange={(e) => handleSimulatorChange('npsSelfContribution', Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹0</span>
              <span>₹25,000</span>
              <span>₹50,000 (Max)</span>
            </div>
          </div>

          {/* Slider 3: Annual Rent Paid */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex justify-between font-bold mb-1.5 text-slate-800">
              <span>Annual Rent Paid (for HRA Exemption)</span>
              <span className="font-mono text-purple-700">
                {formatINR(interactiveDeductions.rentPaidAnnually || 0)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="600000"
              step="12000"
              value={interactiveDeductions.rentPaidAnnually || 0}
              onChange={(e) => handleSimulatorChange('rentPaidAnnually', Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹0</span>
              <span>₹3,00,000 (₹25k/mo)</span>
              <span>₹6,00,000 (₹50k/mo)</span>
            </div>
          </div>

          {/* Slider 4: Home Loan Interest */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex justify-between font-bold mb-1.5 text-slate-800">
              <span>Home Loan Interest (Section 24b)</span>
              <span className="font-mono text-purple-700">
                {formatINR(interactiveDeductions.homeLoanInterestSelfOccupied || 0)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={interactiveDeductions.homeLoanInterestSelfOccupied || 0}
              onChange={(e) => handleSimulatorChange('homeLoanInterestSelfOccupied', Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹0</span>
              <span>₹1,00,000</span>
              <span>₹2,00,000 (Max)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Why This Recommendation: Detailed Driving Factors */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Why {isOldRecommended ? 'Old' : isNewRecommended ? 'New' : 'Either'} Regime is Recommended for You</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Detailed financial drivers that resulted in this recommendation based on your entered salary structure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {detailedFactors.map((factor, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                factor.impactType === 'favorable_old'
                  ? 'bg-purple-50/60 border-purple-200 text-purple-950'
                  : factor.impactType === 'favorable_new'
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {factor.impactType === 'favorable_old' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    Old
                  </span>
                )}
                {factor.impactType === 'favorable_new' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    New
                  </span>
                )}
                {factor.impactType === 'neutral' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                    Both
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold mb-0.5 text-slate-900">{factor.category}</p>
                <p className="text-slate-600 leading-relaxed">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Visual Charts */}
      <VisualCharts recommendation={recommendation} salary={salary} />

      {/* 7. Comprehensive Ledger Table */}
      <ComparisonTable recommendation={recommendation} />

      {/* 8. Statutory Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
        <span className="font-bold text-slate-700">Statutory Disclaimer: </span>
        SALCAL provides deterministic tax comparisons based on the Indian Income Tax Act, 1961 (as amended by Finance Act 2024 and Budget 2025). This tool is built for financial planning and educational estimates and does not replace official chartered accountant certification.
      </div>
    </div>
  );
}
