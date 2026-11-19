'use client';

import React from 'react';
import Image from 'next/image';
import { DEMO_PROFILES, DemoProfile } from '@/lib/demo-data';
import { UploadCloud, Edit3, ArrowRight, CheckCircle2, TrendingDown, Percent, Zap, Sparkles } from 'lucide-react';

interface LandingHeroProps {
  onStartUpload: () => void;
  onStartManual: () => void;
  onSelectDemo: (profile: DemoProfile) => void;
}

export function LandingHero({
  onStartUpload,
  onStartManual,
  onSelectDemo,
}: LandingHeroProps) {
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
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Upload your salary slip or enter your compensation details. Compare the Old and New Tax Regimes with precision mathematical verification and get clear actionable insights.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onStartUpload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-95"
          >
            <UploadCloud className="w-5 h-5 text-purple-200" />
            <span>Upload Salary Slip (PDF / Image)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onStartManual}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm shadow-2xs hover:border-slate-400 transition-all duration-150"
          >
            <Edit3 className="w-4 h-4 text-purple-600" />
            <span>Calculate Manually</span>
          </button>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Instant In-Browser OCR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Accurate HRA & 80C Limits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>Net Monthly In-Hand Analysis</span>
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
