'use client';

import React from 'react';
import Image from 'next/image';
import { FinancialYear } from '@/lib/tax/types';
import { DEMO_PROFILES, DemoProfile } from '@/lib/demo-data';
import { Sparkles, RefreshCw, FileText, ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentFY: FinancialYear;
  onFYChange: (fy: FinancialYear) => void;
  onSelectDemo: (profile: DemoProfile) => void;
  onReset: () => void;
  hasCalculated: boolean;
  onOpenReport?: () => void;
  onStartCTC?: () => void;
  onStartUpload?: () => void;
  activeStep?: string;
}

export function Navbar({
  currentFY,
  onFYChange,
  onSelectDemo,
  onReset,
  hasCalculated,
  onOpenReport,
  onStartCTC,
  onStartUpload,
  activeStep,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with SALCAL logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onReset}>
            <div className="relative h-9 w-32 flex items-center">
              <Image
                src="/salcal-logo.png"
                alt="SALCAL Logo"
                width={140}
                height={36}
                className="object-contain object-left h-8 w-auto"
                priority
              />
            </div>
            <span className="hidden sm:inline-flex text-[11px] font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200">
              FY {currentFY}
            </span>
          </div>

          {/* Quick Navigation Modes */}
          <div className="hidden lg:flex items-center gap-1 border-l border-slate-200 pl-4">
            <button
              type="button"
              onClick={onStartCTC}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeStep === 'ctc-structuring'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>CTC Structuring</span>
            </button>
            <button
              type="button"
              onClick={onStartUpload}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeStep === 'upload'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Payslip Upload</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* FY selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => onFYChange('2025-2026')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                currentFY === '2025-2026'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FY 25-26 <span className="hidden md:inline font-normal">(Budget 2025)</span>
            </button>
            <button
              type="button"
              onClick={() => onFYChange('2024-2025')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                currentFY === '2024-2025'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FY 24-25 <span className="hidden md:inline font-normal">(AY 25-26)</span>
            </button>
            <button
              type="button"
              onClick={() => onFYChange('2023-2024')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                currentFY === '2023-2024'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FY 23-24
            </button>
          </div>

          {/* Demo Profiles Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Sample Scenarios</span>
              <span className="sm:hidden">Demos</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <div className="absolute right-0 mt-1.5 w-72 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 hidden group-hover:block hover:block z-50 animate-in fade-in-50 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Benchmark Scenario
              </div>
              <div className="space-y-1 mt-1">
                {DEMO_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => onSelectDemo(profile)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50/60 transition-colors flex flex-col group/item"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover/item:text-purple-900">
                        {profile.name}
                      </span>
                      <span className="text-[10px] font-mono text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        {profile.annualSalaryLPA.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5">{profile.designation}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1">
                      {profile.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset / Clear */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset Calculation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Quick PDF Report button */}
          {hasCalculated && onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
