'use client';

import React from 'react';
import { DEMO_PROFILES, DemoProfile } from '@/lib/demo-data';
import { UploadCloud, Edit3, ArrowRight, CheckCircle2, TrendingDown, Percent, Zap } from 'lucide-react';

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
    <div className="relative overflow-hidden py-10 md:py-16">
      {/* Background subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-100/40 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
        {/* Budget 2024 Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
          <span>Updated with Finance Act (Budget 2024) – Standard Deduction ₹75,000</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Find the Tax Regime That <span className="text-emerald-600">Saves You More.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload your salary slip. Compare both tax regimes. Make smarter financial decisions with precision mathematical verification.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onStartUpload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-95"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload Salary Slip</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onStartManual}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-base shadow-2xs hover:border-slate-400 transition-all duration-150"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Calculate Manually</span>
          </button>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No sign-up required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Accurate HRA & 80C Limits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>Side-by-side liability breakdown</span>
          </div>
        </div>

        {/* Instant Demo Profiles Section */}
        <div className="mt-14 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Or Try Sample Salary Profiles
              </h2>
              <p className="text-xs text-slate-400">Instant full calculation without uploading any files</p>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Click to load profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            {DEMO_PROFILES.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onSelectDemo(profile)}
                className="group relative bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{profile.name}</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {profile.annualSalaryLPA.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{profile.designation}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {profile.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-indigo-600">{profile.badge}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
