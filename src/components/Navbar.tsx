'use client';

import React from 'react';
import { FinancialYear } from '@/lib/tax/types';
import { DEMO_PROFILES, DemoProfile } from '@/lib/demo-data';
import { ShieldCheck, Sparkles, RefreshCw, FileText } from 'lucide-react';

interface NavbarProps {
  currentFY: FinancialYear;
  onFYChange: (fy: FinancialYear) => void;
  onSelectDemo: (profile: DemoProfile) => void;
  onReset: () => void;
  hasCalculated: boolean;
  onOpenReport?: () => void;
}

export function Navbar({
  currentFY,
  onFYChange,
  onSelectDemo,
  onReset,
  hasCalculated,
  onOpenReport,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">TaxWise</span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                FY {currentFY}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Smart Tax Regime Advisor
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* FY selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => onFYChange('2025-2026')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                currentFY === '2025-2026'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FY 25-26 <span className="hidden md:inline">(AY 26-27)</span>
            </button>
            <button
              type="button"
              onClick={() => onFYChange('2024-2025')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                currentFY === '2024-2025'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FY 24-25 <span className="hidden md:inline">(AY 25-26)</span>
            </button>
            <button
              type="button"
              onClick={() => onFYChange('2023-2024')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                currentFY === '2023-2024'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FY 23-24 <span className="hidden md:inline">(AY 24-25)</span>
            </button>
          </div>

          {/* Demo Profiles Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Demo Profiles</span>
            </button>

            <div className="absolute right-0 mt-1 w-64 p-2 bg-white rounded-xl shadow-xl border border-slate-200 hidden group-hover:block hover:block z-50 animate-in fade-in-50 duration-150">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Sample Scenario
              </div>
              <div className="space-y-1 mt-1">
                {DEMO_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => onSelectDemo(profile)}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 transition-colors flex flex-col"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">{profile.name}</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">{profile.annualSalaryLPA.split(' ')[0]}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{profile.designation}</span>
                    <span className="text-[10px] text-indigo-600 font-medium mt-0.5">{profile.badge}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset / Clear */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset to New Calculation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Quick PDF Report button if calculated */}
          {hasCalculated && onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
