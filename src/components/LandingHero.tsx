'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DEMO_PROFILES, DemoProfile } from '@/lib/demo-data';
import {
  UploadCloud,
  Edit3,
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  Percent,
  Zap,
  Sparkles,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface LandingHeroProps {
  onStartUpload: () => void;
  onStartManual: () => void;
  onStartCTCStructuring: (ctc?: number) => void;
  onSelectDemo: (profile: DemoProfile) => void;
}

const PRESET_CTCS = [
  { label: '₹6 LPA', value: 600000 },
  { label: '₹10 LPA', value: 1000000 },
  { label: '₹12 LPA', value: 1200000 },
  { label: '₹15 LPA', value: 1500000 },
  { label: '₹18 LPA', value: 1800000 },
  { label: '₹25 LPA', value: 2500000 },
];

export function LandingHero({
  onStartUpload,
  onStartManual,
  onStartCTCStructuring,
  onSelectDemo,
}: LandingHeroProps) {
  const [ctcInputValue, setCtcInputValue] = useState<string>('1200000');

  const handleCTCClick = () => {
    const val = parseInt(ctcInputValue.replace(/[^0-9]/g, ''), 10) || 1200000;
    onStartCTCStructuring(val);
  };

  return (
    <div className="relative overflow-hidden py-8 md:py-14">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] bg-purple-100/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">
        {/* Brand Logo Hero Feature */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 p-2 bg-white rounded-2xl shadow-sm border border-slate-200/80">
            <Image
              src="/salcal-logo.png"
              alt="SALCAL - Smart Tax Regime Advisor"
              width={180}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Budget 2025 & 2024 Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold mb-6 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
          <span>Updated for Budget 2025 & Finance Act 2024 – ₹75,000 Standard Deduction</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
          Find the Tax Regime That <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">Saves You More.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Enter your Annual CTC or upload your salary slip. Automatic RazorpayX-style salary structuring, precise take-home calculation, and mathematical Old vs New Regime recommendation.
        </p>

        {/* FEATURED: Instant CTC Salary Structuring Card */}
        <div className="mt-8 max-w-2xl mx-auto bg-white p-5 sm:p-6 rounded-3xl border-2 border-purple-200/80 shadow-lg text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/40 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Automatic CTC Salary Distribution Engine</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              RazorpayX-Inspired
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₹
              </span>
              <input
                type="text"
                value={ctcInputValue}
                onChange={(e) => setCtcInputValue(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="1200000"
                className="w-full pl-9 pr-24 py-3.5 text-base sm:text-lg font-black text-slate-900 rounded-2xl border-2 border-slate-200 focus:outline-hidden focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Annual CTC
              </span>
            </div>

            <button
              type="button"
              onClick={handleCTCClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 shrink-0"
            >
              <span>Structure Salary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Presets:</span>
            {PRESET_CTCS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setCtcInputValue(preset.value.toString());
                  onStartCTCStructuring(preset.value);
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-purple-100/70 text-slate-700 hover:text-purple-900 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Options: Payslip Upload or Manual Entry */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
          <span className="text-slate-400 font-medium">Or have an existing payslip?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStartUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold shadow-2xs transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
              <span>Upload Payslip (PDF / OCR)</span>
            </button>

            <button
              type="button"
              onClick={onStartManual}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold shadow-2xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero Manual Splitting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Accurate HRA, EPF &amp; Gratuity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>Exact Monthly Take-Home</span>
          </div>
        </div>

        {/* Instant Demo Profiles Section */}
        <div className="mt-12 pt-8 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 text-left">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Try Pre-Configured Benchmark Profiles</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Explore how deductions change the winning tax regime</p>
            </div>
            <span className="text-xs text-purple-700 font-bold hidden sm:inline">Click any card to analyze</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left">
            {DEMO_PROFILES.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onSelectDemo(profile)}
                className="group relative bg-white border border-slate-200 hover:border-purple-500 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-purple-900">
                      {profile.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {profile.annualSalaryLPA.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{profile.designation}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {profile.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {profile.badge}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
