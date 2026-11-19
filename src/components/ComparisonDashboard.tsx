'use client';

import React, { useEffect } from 'react';
import { TaxComparisonRecommendation, SalaryComponents, AdditionalDeductions } from '@/lib/tax/types';
import { formatINR } from '@/lib/utils';
import { VisualCharts } from './VisualCharts';
import { ComparisonTable } from './ComparisonTable';
import { generateTaxPDFReport } from '@/lib/reports/pdf-report';
import confetti from 'canvas-confetti';
import {
  Download,
  Printer,
  Edit2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface ComparisonDashboardProps {
  recommendation: TaxComparisonRecommendation;
  salary: SalaryComponents;
  deductions: AdditionalDeductions;
  onEditSalary: () => void;
  onEditDeductions: () => void;
}

export function ComparisonDashboard({
  recommendation,
  salary,
  deductions,
  onEditSalary,
  onEditDeductions,
}: ComparisonDashboardProps) {
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
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#6366f1'],
      });
    }
  }, [taxSavings]);

  const handleDownloadPDF = () => {
    const doc = generateTaxPDFReport(recommendation);
    doc.save(`TaxWise-Comparison-FY${oldRegimeResult.financialYear}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const isOldRecommended = recommendedRegime === 'OLD';
  const isNewRecommended = recommendedRegime === 'NEW';
  const isEqual = recommendedRegime === 'EQUAL';

  const winningResult = isOldRecommended ? oldRegimeResult : newRegimeResult;
  const otherResult = isOldRecommended ? newRegimeResult : oldRegimeResult;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tax Regime Recommendation
            </h1>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              FY {oldRegimeResult.financialYear}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official income tax calculation engine comparison for Indian salaried employees.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto no-print">
          <button
            type="button"
            onClick={onEditSalary}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Salary</span>
          </button>
          <button
            type="button"
            onClick={onEditDeductions}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5" />
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95"
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
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border-emerald-900 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Regime Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
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
                  You save <span className="text-emerald-400">{formatINR(taxSavings)}</span> per year
                </>
              ) : (
                'Zero Tax Difference Between Regimes'
              )}
            </h2>

            {/* Explanation paragraph */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {headlineExplanation}
            </p>

            {/* Break-even insight if New Regime won */}
            {breakEvenDeductionNeeded && breakEvenDeductionNeeded > 0 && (
              <div className="inline-flex items-center gap-2 text-xs text-amber-300 bg-amber-950/50 border border-amber-800/60 px-3 py-1.5 rounded-lg">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Tip: For the Old Regime to beat the New Regime at your salary, you would need total deductions of approx. {formatINR(breakEvenDeductionNeeded)}.
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics Callout Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shrink-0 min-w-[280px] space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-slate-300">Recommended Tax:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {formatINR(winningResult.finalTaxLiability)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs text-slate-300">Alternative Tax:</span>
              <span className="text-base font-bold text-slate-300 font-mono line-through decoration-rose-500">
                {formatINR(otherResult.finalTaxLiability)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xs font-semibold text-emerald-300">Monthly In-Hand Boost:</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                +{formatINR(monthlySavings)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Old Regime Tax */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isOldRecommended
            ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
            : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Old Regime Tax
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatINR(oldRegimeResult.finalTaxLiability)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {formatINR(oldRegimeResult.monthlyTaxLiability)}/month TDS
          </span>
          {isOldRecommended && (
            <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Winner • Lower Liability
            </span>
          )}
        </div>

        {/* Card 2: New Regime Tax */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isNewRecommended
            ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
            : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            New Regime Tax
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatINR(newRegimeResult.finalTaxLiability)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {formatINR(newRegimeResult.monthlyTaxLiability)}/month TDS
          </span>
          {isNewRecommended && (
            <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Winner • Lower Liability
            </span>
          )}
        </div>

        {/* Card 3: Old Regime Deductions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Exemptions & Deductions (Old)
          </span>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {formatINR(oldRegimeResult.exemptions.totalExemptions + oldRegimeResult.deductions.totalDeductions)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            HRA + 80C + 80D + Std Deduction
          </span>
        </div>

        {/* Card 4: New Regime Deductions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Standard Deduction (New)
          </span>
          <div className="text-2xl font-black text-slate-800 font-mono">
            {formatINR(newRegimeResult.exemptions.standardDeduction)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Budget 2024 Enhanced Limit
          </span>
        </div>
      </div>

      {/* 4. Why This Recommendation: Detailed Driving Factors */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Why {isOldRecommended ? 'Old' : isNewRecommended ? 'New' : 'Either'} Regime is Better for You</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Itemized financial drivers contributing to this recommendation based on your entered salary structure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {detailedFactors.map((factor, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                factor.impactType === 'favorable_old'
                  ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
                  : factor.impactType === 'favorable_new'
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {factor.impactType === 'favorable_old' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
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

      {/* 5. Visual Charts */}
      <VisualCharts recommendation={recommendation} salary={salary} />

      {/* 6. Comprehensive Ledger Table */}
      <ComparisonTable recommendation={recommendation} />

      {/* 7. Tax Slabs Reference Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Old Slabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h4 className="font-bold text-slate-900 mb-2">Old Regime Tax Slab Breakdown</h4>
          <div className="space-y-1.5">
            {oldRegimeResult.slabBreakdown.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                <span className="text-slate-600">{s.slab} ({(s.rate * 100).toFixed(0)}%)</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(s.taxAmount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* New Slabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h4 className="font-bold text-slate-900 mb-2">New Regime Tax Slab Breakdown (FY {oldRegimeResult.financialYear})</h4>
          <div className="space-y-1.5">
            {newRegimeResult.slabBreakdown.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                <span className="text-slate-600">{s.slab} ({(s.rate * 100).toFixed(0)}%)</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(s.taxAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. Statutory Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
        <span className="font-bold text-slate-700">Statutory Disclaimer: </span>
        The calculations and regime recommendations generated by TaxWise are based on provisions of the Indian Income Tax Act, 1961, as amended by the Finance Act 2024. Calculations assume individual salaried taxpayers under 60 years of age and standard salary exemptions. This tool provides financial planning estimates and does not constitute formal legal or tax advisory. Please verify with your employer or a chartered accountant when filing your ITR.
      </div>
    </div>
  );
}
