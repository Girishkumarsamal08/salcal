'use client';

import React, { useState } from 'react';
import { TaxComparisonRecommendation } from '@/lib/tax/types';
import { formatINR } from '@/lib/utils';
import { ChevronDown, ChevronUp, Check, X, Info } from 'lucide-react';

interface ComparisonTableProps {
  recommendation: TaxComparisonRecommendation;
}

export function ComparisonTable({ recommendation }: ComparisonTableProps) {
  const [showItemized, setShowItemized] = useState<boolean>(true);
  const { oldRegimeResult: oldR, newRegimeResult: newR, recommendedRegime } = recommendation;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Comprehensive Tax Regime Comparison Table
          </h3>
          <p className="text-xs text-slate-500">
            Side-by-side mathematical ledger between Old and New regimes for FY {oldR.financialYear}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowItemized(!showItemized)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors self-start sm:self-auto"
        >
          <span>{showItemized ? 'Collapse Itemized Rows' : 'Expand Itemized Rows'}</span>
          {showItemized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Particulars</th>
              <th className="py-3.5 px-4 sm:px-6 text-right w-48">Old Tax Regime</th>
              <th className="py-3.5 px-4 sm:px-6 text-right w-48">New Tax Regime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* 1. Gross Income */}
            <tr className="hover:bg-slate-50/80 font-semibold text-slate-900">
              <td className="py-3 px-4 sm:px-6">Gross Salary Income</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.grossSalary)}</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">{formatINR(newR.grossSalary)}</td>
            </tr>

            {/* Salary Exemptions */}
            <tr className="hover:bg-slate-50/80 font-semibold text-slate-900">
              <td className="py-3 px-4 sm:px-6">Less: Salary Exemptions (Section 10 & 16)</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono text-emerald-700">
                - {formatINR(oldR.exemptions.totalExemptions)}
              </td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono text-emerald-700">
                - {formatINR(newR.exemptions.totalExemptions)}
              </td>
            </tr>

            {/* Sub-items for Exemptions */}
            {showItemized && (
              <>
                <tr className="bg-slate-50/40 text-slate-600">
                  <td className="py-2 pl-8 sm:pl-10 pr-4">• HRA Exemption u/s 10(13A)</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.exemptions.hraExemption)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right text-slate-400">Not Allowed</td>
                </tr>
                <tr className="bg-slate-50/40 text-slate-600">
                  <td className="py-2 pl-8 sm:pl-10 pr-4">• Standard Deduction u/s 16(ia)</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.exemptions.standardDeduction)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(newR.exemptions.standardDeduction)}</td>
                </tr>
                <tr className="bg-slate-50/40 text-slate-600">
                  <td className="py-2 pl-8 sm:pl-10 pr-4">• Professional Tax u/s 16(iii)</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.exemptions.professionalTax)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right text-slate-400">Not Allowed</td>
                </tr>
              </>
            )}

            {/* Other Income */}
            {oldR.otherIncomeTotal > 0 && (
              <tr className="hover:bg-slate-50/80 text-slate-700">
                <td className="py-3 px-4 sm:px-6">Add: Other Income (Interest, etc.)</td>
                <td className="py-3 px-4 sm:px-6 text-right font-mono">+{formatINR(oldR.otherIncomeTotal)}</td>
                <td className="py-3 px-4 sm:px-6 text-right font-mono">+{formatINR(newR.otherIncomeTotal)}</td>
              </tr>
            )}

            {/* Gross Total Income (GTI) */}
            <tr className="bg-slate-50 font-bold text-slate-900">
              <td className="py-3 px-4 sm:px-6">Gross Total Income (GTI)</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.grossTotalIncome)}</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">{formatINR(newR.grossTotalIncome)}</td>
            </tr>

            {/* Chapter VI-A Deductions */}
            <tr className="hover:bg-slate-50/80 font-semibold text-slate-900">
              <td className="py-3 px-4 sm:px-6">Less: Chapter VI-A Deductions</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono text-emerald-700">
                - {formatINR(oldR.deductions.totalDeductions)}
              </td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono text-emerald-700">
                - {formatINR(newR.deductions.totalDeductions)}
              </td>
            </tr>

            {/* Sub-items for Chapter VI-A */}
            {showItemized && (
              <>
                <tr className="bg-slate-50/40 text-slate-600">
                  <td className="py-2 pl-8 sm:pl-10 pr-4">
                    • Section 80C (EPF ₹{oldR.deductions.section80CDetails.epf.toLocaleString('en-IN')} + Other ₹{oldR.deductions.section80CDetails.other.toLocaleString('en-IN')})
                  </td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.deductions.section80C)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right text-slate-400">Not Allowed</td>
                </tr>
                <tr className="bg-slate-50/40 text-slate-600">
                  <td className="py-2 pl-8 sm:pl-10 pr-4">• Section 80D Health Insurance</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.deductions.section80D)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right text-slate-400">Not Allowed</td>
                </tr>
                <tr className="bg-slate-50/40 text-slate-600">
                  <td className="py-2 pl-8 sm:pl-10 pr-4">• Section 80CCD(1B) Self NPS</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.deductions.section80CCD1B)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right text-slate-400">Not Allowed</td>
                </tr>
                <tr className="bg-slate-50/40 text-slate-600">
                  <td className="py-2 pl-8 sm:pl-10 pr-4">• Section 80CCD(2) Employer NPS</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.deductions.section80CCD2)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(newR.deductions.section80CCD2)}</td>
                </tr>
                <tr className="bg-slate-50/40 text-slate-600">
                  <td className="py-2 pl-8 sm:pl-10 pr-4">• Section 24(b) Home Loan Interest</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.deductions.section24b)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right text-slate-400">Not Allowed</td>
                </tr>
                <tr className="bg-slate-50/40 text-slate-600">
                  <td className="py-2 pl-8 sm:pl-10 pr-4">• Other Deductions (80E, 80TTA, etc.)</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-mono">
                    {formatINR(oldR.deductions.otherDeductions + oldR.deductions.section80E)}
                  </td>
                  <td className="py-2 px-4 sm:px-6 text-right text-slate-400">Not Allowed</td>
                </tr>
              </>
            )}

            {/* Net Taxable Income */}
            <tr className="bg-indigo-50/50 font-bold text-slate-900 border-t border-b border-indigo-100">
              <td className="py-3 px-4 sm:px-6">Net Taxable Income</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono text-indigo-900">{formatINR(oldR.taxableIncome)}</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono text-indigo-900">{formatINR(newR.taxableIncome)}</td>
            </tr>

            {/* Tax Before Rebate */}
            <tr className="hover:bg-slate-50/80 text-slate-700">
              <td className="py-3 px-4 sm:px-6">Income Tax on Slabs (Before Rebate)</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.taxBeforeRebate)}</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">{formatINR(newR.taxBeforeRebate)}</td>
            </tr>

            {/* Rebate 87A */}
            <tr className="hover:bg-slate-50/80 text-slate-700">
              <td className="py-3 px-4 sm:px-6">Less: Tax Rebate u/s 87A & Relief</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono text-emerald-700">
                - {formatINR(oldR.rebate87A)}
              </td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono text-emerald-700">
                - {formatINR(newR.rebate87A + newR.marginalRelief)}
              </td>
            </tr>

            {/* Surcharge if applicable */}
            {(oldR.surcharge > 0 || newR.surcharge > 0) && (
              <tr className="hover:bg-slate-50/80 text-slate-700">
                <td className="py-3 px-4 sm:px-6">Add: Surcharge</td>
                <td className="py-3 px-4 sm:px-6 text-right font-mono">+{formatINR(oldR.surcharge)}</td>
                <td className="py-3 px-4 sm:px-6 text-right font-mono">+{formatINR(newR.surcharge)}</td>
              </tr>
            )}

            {/* Health and Education Cess */}
            <tr className="hover:bg-slate-50/80 text-slate-700">
              <td className="py-3 px-4 sm:px-6">Add: Health & Education Cess (4%)</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">+{formatINR(oldR.cess)}</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">+{formatINR(newR.cess)}</td>
            </tr>

            {/* FINAL ESTIMATED TAX ROW */}
            <tr className="border-t-2 border-slate-900 bg-slate-900 text-white font-extrabold text-sm">
              <td className="py-4 px-4 sm:px-6 flex items-center gap-2">
                <span>Final Estimated Annual Tax</span>
              </td>
              <td className={`py-4 px-4 sm:px-6 text-right font-mono ${
                recommendedRegime === 'OLD' ? 'text-emerald-400 font-black' : 'text-slate-300'
              }`}>
                {formatINR(oldR.finalTaxLiability)}
                {recommendedRegime === 'OLD' && (
                  <span className="block text-[10px] text-emerald-300 font-sans uppercase tracking-wider">
                    Recommended
                  </span>
                )}
              </td>
              <td className={`py-4 px-4 sm:px-6 text-right font-mono ${
                recommendedRegime === 'NEW' ? 'text-emerald-400 font-black' : 'text-slate-300'
              }`}>
                {formatINR(newR.finalTaxLiability)}
                {recommendedRegime === 'NEW' && (
                  <span className="block text-[10px] text-emerald-300 font-sans uppercase tracking-wider">
                    Recommended
                  </span>
                )}
              </td>
            </tr>

            {/* Monthly Tax (TDS) */}
            <tr className="bg-slate-50 font-semibold text-slate-800">
              <td className="py-3 px-4 sm:px-6">Estimated Monthly Tax Burden (TDS)</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">{formatINR(oldR.monthlyTaxLiability)}/mo</td>
              <td className="py-3 px-4 sm:px-6 text-right font-mono">{formatINR(newR.monthlyTaxLiability)}/mo</td>
            </tr>

            {/* Effective Tax Rate */}
            <tr className="bg-slate-50/50 text-slate-600">
              <td className="py-2.5 px-4 sm:px-6">Effective Tax Rate</td>
              <td className="py-2.5 px-4 sm:px-6 text-right font-mono font-bold">{oldR.effectiveTaxRate}%</td>
              <td className="py-2.5 px-4 sm:px-6 text-right font-mono font-bold">{newR.effectiveTaxRate}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
