'use client';

import React, { useState } from 'react';
import { ExtractedSalaryData, SalaryComponents } from '@/lib/tax/types';
import { formatINR } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Info, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

interface SalaryReviewFormProps {
  initialSalary: SalaryComponents;
  extractedMeta?: ExtractedSalaryData | null;
  onConfirm: (salary: SalaryComponents) => void;
  onBack: () => void;
}

export function SalaryReviewForm({
  initialSalary,
  extractedMeta,
  onConfirm,
  onBack,
}: SalaryReviewFormProps) {
  // Mode: monthly or annual editing
  const [isMonthlyMode, setIsMonthlyMode] = useState<boolean>(false);
  const [salaryState, setSalaryState] = useState<SalaryComponents>(initialSalary);

  const factor = isMonthlyMode ? 12 : 1;

  const handleFieldChange = (key: keyof SalaryComponents, rawInput: string) => {
    const num = parseFloat(rawInput.replace(/,/g, '')) || 0;
    const annualValue = isMonthlyMode ? Math.round(num * 12) : Math.round(num);

    setSalaryState(prev => ({
      ...prev,
      [key]: Math.max(0, annualValue),
    }));
  };

  const calculateGross = () => {
    return (
      salaryState.basicSalary +
      salaryState.hraReceived +
      salaryState.specialAllowance +
      salaryState.lta +
      salaryState.bonus +
      salaryState.otherAllowances
    );
  };

  const grossTotal = calculateGross();

  const getFieldValue = (key: keyof SalaryComponents) => {
    const val = salaryState[key] || 0;
    return isMonthlyMode ? Math.round(val / 12) : val;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Review Salary Components
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {extractedMeta
              ? 'Values extracted from your document. Please verify each component before tax calculation.'
              : 'Enter your salary breakdown. You can toggle between monthly or annual amounts.'}
          </p>
        </div>

        {/* Monthly vs Annual Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsMonthlyMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isMonthlyMode
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual (₹/Year)
          </button>
          <button
            type="button"
            onClick={() => setIsMonthlyMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isMonthlyMode
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly (₹/Month)
          </button>
        </div>
      </div>

      {/* Warnings / Uncertainty Alert */}
      {extractedMeta && extractedMeta.warnings.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold mb-1 text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Document Extraction Notes</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800">
            {extractedMeta.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
        {/* Live Gross Salary Header */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Calculated Annual Gross Earnings
            </span>
            <div className="text-2xl font-extrabold text-purple-300">
              {formatINR(grossTotal)}
              <span className="text-xs font-normal text-slate-300 ml-2">
                (~{formatINR(Math.round(grossTotal / 12))}/month)
              </span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400">Basic + HRA + Allowances + Bonus</span>
          </div>
        </div>

        {/* Component Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Basic Salary */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Basic Salary <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={getFieldValue('basicSalary') || ''}
                onChange={(e) => handleFieldChange('basicSalary', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Base pay. Used for HRA exemption and EPF calculations.
            </p>
          </div>

          {/* HRA Received */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              House Rent Allowance (HRA)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={getFieldValue('hraReceived') || ''}
                onChange={(e) => handleFieldChange('hraReceived', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Allowance provided by employer for house rent.
            </p>
          </div>

          {/* Special Allowance */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Special Allowance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={getFieldValue('specialAllowance') || ''}
                onChange={(e) => handleFieldChange('specialAllowance', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Fully taxable allowance component.</p>
          </div>

          {/* Leave Travel Allowance (LTA) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Leave Travel Allowance (LTA)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={getFieldValue('lta') || ''}
                onChange={(e) => handleFieldChange('lta', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Travel allowance component.</p>
          </div>

          {/* Bonus / Variable / Incentives */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Annual Bonus / Incentives
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={getFieldValue('bonus') || ''}
                onChange={(e) => handleFieldChange('bonus', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Performance bonus, joining bonus, or variable pay.</p>
          </div>

          {/* Other Allowances */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Other Allowances
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={getFieldValue('otherAllowances') || ''}
                onChange={(e) => handleFieldChange('otherAllowances', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Medical, conveyance, telephone, food coupons, etc.</p>
          </div>

          {/* Employee PF Contribution */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Employee EPF Contribution
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={getFieldValue('employeePF') || ''}
                onChange={(e) => handleFieldChange('employeePF', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Deducted from your salary. Automatically eligible under Section 80C.
            </p>
          </div>

          {/* Employer PF Contribution */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Employer EPF Contribution
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={getFieldValue('employerPF') || ''}
                onChange={(e) => handleFieldChange('employerPF', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Contributed by company. Tax-free up to ₹7.5 Lakhs combined threshold.
            </p>
          </div>

          {/* Professional Tax */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Professional Tax (PT)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                value={getFieldValue('professionalTax') || ''}
                onChange={(e) => handleFieldChange('professionalTax', e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              State professional tax (usually ₹2,400 or ₹2,500/year). Deductible in Old Regime.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Upload</span>
          </button>

          <button
            type="button"
            onClick={() => onConfirm(salaryState)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <span>Proceed to Tax Deductions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
