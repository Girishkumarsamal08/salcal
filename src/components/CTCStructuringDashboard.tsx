'use client';

import React, { useState, useMemo } from 'react';
import {
  SalaryStructureConfig,
  DEFAULT_SALARY_CONFIG,
  CTCBreakdownResult,
  PFApplicabilityMode,
} from '@/lib/ctc/types';
import { structureSalaryFromCTC, toSalaryComponents } from '@/lib/ctc/salary-structuring';
import { calculateTakeHomePay } from '@/lib/ctc/take-home-calculator';
import {
  AdditionalDeductions,
  FinancialYear,
  MetroCity,
  SalaryComponents,
  TaxComparisonRecommendation,
} from '@/lib/tax/types';
import { recommendTaxRegime } from '@/lib/tax/recommendation-engine';
import { generateTaxPDFReport } from '@/lib/reports/pdf-report';
import { formatINR } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  ShieldCheck,
  Building2,
  Wallet,
  Receipt,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Percent,
} from 'lucide-react';

interface CTCStructuringDashboardProps {
  initialCTC?: number;
  initialFY?: FinancialYear;
  onSwitchToUpload?: () => void;
  onSwitchToManual?: () => void;
}

const PRESET_CTCS = [
  { label: '₹5 LPA', value: 500000 },
  { label: '₹8 LPA', value: 800000 },
  { label: '₹10 LPA', value: 1000000 },
  { label: '₹12 LPA', value: 1200000 },
  { label: '₹15 LPA', value: 1500000 },
  { label: '₹18 LPA', value: 1800000 },
  { label: '₹25 LPA', value: 2500000 },
];

const DONUT_COLORS = [
  '#7C3AED', // Basic - Violet 600
  '#A855F7', // HRA - Purple 500
  '#C084FC', // LTA - Purple 400
  '#6366F1', // Special Allowance - Indigo 500
  '#0EA5E9', // Employer PF - Sky 500
  '#10B981', // Gratuity - Emerald 500
  '#F59E0B', // Employer Benefits - Amber 500
];

export function CTCStructuringDashboard({
  initialCTC = 1200000,
  initialFY = '2024-2025',
  onSwitchToUpload,
}: CTCStructuringDashboardProps) {
  // CTC input state
  const [ctcInput, setCtcInput] = useState<string>(initialCTC.toString());
  const [financialYear, setFinancialYear] = useState<FinancialYear>(initialFY);

  // Salary Structure Configuration state
  const [config, setConfig] = useState<SalaryStructureConfig>(DEFAULT_SALARY_CONFIG);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState<boolean>(false);
  const [isDeductionsOpen, setIsDeductionsOpen] = useState<boolean>(false);

  // Deductions state for Old vs New Regime comparison
  const [rentPaidMonthly, setRentPaidMonthly] = useState<number>(15000); // default 15k/month
  const [cityCategory, setCityCategory] = useState<MetroCity>('metro');
  const [other80C, setOther80C] = useState<number>(50000);
  const [healthInsuranceSelf, setHealthInsuranceSelf] = useState<number>(20000);
  const [healthInsuranceParents, setHealthInsuranceParents] = useState<number>(25000);
  const [npsSelf, setNpsSelf] = useState<number>(50000);
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(0);

  const numericCTC = Math.max(0, parseInt(ctcInput.replace(/,/g, ''), 10) || 0);

  // 1. Calculate structured CTC distribution
  const breakdown: CTCBreakdownResult = useMemo(() => {
    return structureSalaryFromCTC(numericCTC, config);
  }, [numericCTC, config]);

  // 2. Prepare deductions payload
  const deductions: AdditionalDeductions = useMemo(() => {
    return {
      other80CInvestments: other80C,
      healthInsuranceSelfFamily: healthInsuranceSelf,
      isSelfSeniorCitizen: false,
      healthInsuranceParents: healthInsuranceParents,
      parentsAgeCategory: 'senior',
      preventiveHealthCheckup: 5000,
      npsSelfContribution: npsSelf,
      employerNPSContribution: 0,
      homeLoanInterestSelfOccupied: homeLoanInterest,
      educationLoanInterest: 0,
      savingsInterestDeduction: 10000,
      otherDeductions: 0,
      interestIncome: 0,
      rentalIncome: 0,
      otherIncome: 0,
      rentPaidAnnually: rentPaidMonthly * 12,
      cityCategory,
    };
  }, [
    rentPaidMonthly,
    cityCategory,
    other80C,
    healthInsuranceSelf,
    healthInsuranceParents,
    npsSelf,
    homeLoanInterest,
  ]);

  // 3. Connect to Tax Recommendation Engine
  const salaryComponents: SalaryComponents = useMemo(() => {
    return toSalaryComponents(breakdown);
  }, [breakdown]);

  const recommendation: TaxComparisonRecommendation = useMemo(() => {
    return recommendTaxRegime(salaryComponents, deductions, financialYear);
  }, [salaryComponents, deductions, financialYear]);

  // 4. Calculate Net Take-Home for Old and New Regimes
  const takeHomeOld = useMemo(() => {
    return calculateTakeHomePay({
      breakdown,
      annualTaxLiability: recommendation.oldRegimeResult.finalTaxLiability,
    });
  }, [breakdown, recommendation.oldRegimeResult.finalTaxLiability]);

  const takeHomeNew = useMemo(() => {
    return calculateTakeHomePay({
      breakdown,
      annualTaxLiability: recommendation.newRegimeResult.finalTaxLiability,
    });
  }, [breakdown, recommendation.newRegimeResult.finalTaxLiability]);

  const winningTakeHome =
    recommendation.recommendedRegime === 'OLD' ? takeHomeOld : takeHomeNew;

  // Donut chart data for CTC allocation
  const chartData = useMemo(() => {
    return [
      { name: 'Basic Salary', value: breakdown.basicSalary.annualAmount, percent: breakdown.basicSalary.percentageOfCTC },
      { name: 'HRA', value: breakdown.hra.annualAmount, percent: breakdown.hra.percentageOfCTC },
      { name: 'LTA', value: breakdown.lta.annualAmount, percent: breakdown.lta.percentageOfCTC },
      { name: 'Special Allowance', value: breakdown.specialAllowance.annualAmount, percent: breakdown.specialAllowance.percentageOfCTC },
      { name: 'Employer PF', value: breakdown.employerPF.annualAmount, percent: breakdown.employerPF.percentageOfCTC },
      { name: 'Gratuity', value: breakdown.gratuity.annualAmount, percent: breakdown.gratuity.percentageOfCTC },
      { name: 'Employer Benefits', value: breakdown.employerBenefits.annualAmount, percent: breakdown.employerBenefits.percentageOfCTC },
    ].filter((item) => item.value > 0);
  }, [breakdown]);

  // Preset switch handler
  const handlePresetChange = (preset: 'standard' | 'custom') => {
    if (preset === 'standard') {
      setConfig({
        ...DEFAULT_SALARY_CONFIG,
        presetName: 'standard',
      });
    } else {
      setConfig((prev) => ({
        ...prev,
        presetName: 'custom',
      }));
    }
  };

  const handleExportPDF = () => {
    const doc = generateTaxPDFReport(recommendation, 'Valued Employee');
    doc.save(`SALCAL-Tax-Report-FY${recommendation.oldRegimeResult.financialYear}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Hero Input */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>RazorpayX-Inspired Automatic CTC Structuring Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Enter Your Annual CTC. We Structure Your Salary &amp; Tax.
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl font-normal">
              Enter your total compensation package. SALCAL automatically distributes Basic, HRA, PF, Gratuity, and Special Allowance, then calculates your exact take-home pay and winning tax regime.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onSwitchToUpload && (
              <button
                type="button"
                onClick={onSwitchToUpload}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                <span>Upload Payslip Instead</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* Input Bar & Preset Chips */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₹
              </span>
              <input
                type="text"
                value={ctcInput}
                onChange={(e) => setCtcInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="12,00,000"
                className="w-full pl-9 pr-24 py-3.5 text-lg font-black text-slate-900 rounded-2xl border-2 border-purple-200 focus:outline-hidden focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Annual CTC
              </span>
            </div>

            {/* Financial Year Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setFinancialYear('2025-2026')}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                  financialYear === '2025-2026'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FY 25-26 (Budget 2025)
              </button>
              <button
                type="button"
                onClick={() => setFinancialYear('2024-2025')}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                  financialYear === '2024-2025'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FY 24-25 (AY 25-26)
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Quick Presets:</span>
            {PRESET_CTCS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setCtcInput(preset.value.toString())}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  numericCTC === preset.value
                    ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Alert if Structure Exceeds CTC */}
      {!breakdown.isValid && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-rose-950">Salary Structure Imbalance</h4>
            {breakdown.validationErrors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        </div>
      )}

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Annual CTC */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annual CTC</span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatINR(breakdown.annualCTC)}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>~{formatINR(breakdown.monthlyCTC)} / month</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> 100% Reconciled
            </span>
          </div>
        </div>

        {/* Gross Annual Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Annual Salary</span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatINR(breakdown.annualGrossSalary)}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>~{formatINR(breakdown.monthlyGrossSalary)} / month</span>
            <span className="text-indigo-600 font-semibold text-[11px]">
              {Number(((breakdown.annualGrossSalary / (breakdown.annualCTC || 1)) * 100).toFixed(1))}% of CTC
            </span>
          </div>
        </div>

        {/* Employer Contributions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employer Contributions</span>
            <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatINR(breakdown.totalEmployerContributions.annualAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Employer PF + Gratuity</span>
            <span className="text-sky-600 font-semibold text-[11px]">
              ~{formatINR(breakdown.totalEmployerContributions.monthlyAmount)} / mo
            </span>
          </div>
        </div>

        {/* Estimated Monthly In-Hand */}
        <div className="bg-gradient-to-br from-purple-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Estimated Monthly Take-Home</span>
            <span className="w-8 h-8 rounded-lg bg-white/10 text-purple-300 flex items-center justify-center font-bold text-xs">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {formatINR(winningTakeHome.monthlyNetTakeHome)}
          </div>
          <div className="text-xs text-purple-200 mt-1 flex items-center justify-between">
            <span>Net cash in bank</span>
            <span className="text-emerald-300 font-semibold text-[11px]">
              ({recommendation.recommendedRegime === 'OLD' ? 'Old Regime' : 'New Regime'})
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Salary Distribution Table & Visual Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col (8 cols): RazorpayX-style Salary Breakdown Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                <span>Annual &amp; Monthly Salary Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact component distribution compliant with statutory wage rules and RazorpayX payroll principles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-100/50 transition-colors self-start sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize Your Salary</span>
              {isCustomizeOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Salary Structure Customization Accordion */}
          {isCustomizeOpen && (
            <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Configure Salary Distribution Percentages
                </h3>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handlePresetChange('standard')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      config.presetName === 'standard'
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Standard (RazorpayX)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('custom')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      config.presetName === 'custom'
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Basic Salary Slider */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Basic Salary</span>
                    <span className="text-purple-700">{config.basicPercentOfCTC}% of CTC</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="60"
                    step="5"
                    value={config.basicPercentOfCTC}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        presetName: 'custom',
                        basicPercentOfCTC: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">Reference base for EPF, Gratuity and HRA.</p>
                </div>

                {/* HRA Slider */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>HRA</span>
                    <span className="text-purple-700">{config.hraPercentOfCTC}% of CTC</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="35"
                    step="5"
                    value={config.hraPercentOfCTC}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        presetName: 'custom',
                        hraPercentOfCTC: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">Typically 50% of Basic (25% of CTC).</p>
                </div>

                {/* LTA Slider */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>LTA</span>
                    <span className="text-purple-700">{config.ltaPercentOfBasic}% of Basic</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="5"
                    value={config.ltaPercentOfBasic}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        presetName: 'custom',
                        ltaPercentOfBasic: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">Leave Travel Allowance proportion.</p>
                </div>
              </div>

              {/* Statutory Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* PF Rule Toggle */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="block text-xs font-bold text-slate-800">EPF Applicability &amp; Wage Ceiling</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          presetName: 'custom',
                          pfApplicability: 'uncapped' as PFApplicabilityMode,
                        }))
                      }
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        config.pfApplicability === 'uncapped'
                          ? 'bg-purple-50 text-purple-700 border-purple-400 font-bold'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Uncapped (12% of Basic)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          presetName: 'custom',
                          pfApplicability: 'statutory_wage_ceiling' as PFApplicabilityMode,
                        }))
                      }
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        config.pfApplicability === 'statutory_wage_ceiling'
                          ? 'bg-purple-50 text-purple-700 border-purple-400 font-bold'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Statutory Cap (₹15,000/mo)
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {config.pfApplicability === 'statutory_wage_ceiling'
                      ? 'Capped at ₹1,800/mo (₹21,600/yr), leaving more special allowance in take-home.'
                      : 'Calculated on actual basic salary. Maximizes retirement savings.'}
                  </p>
                </div>

                {/* Gratuity Toggle */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="block text-xs font-bold text-slate-800">Statutory Gratuity Provision</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          presetName: 'custom',
                          includeGratuity: true,
                        }))
                      }
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        config.includeGratuity
                          ? 'bg-purple-50 text-purple-700 border-purple-400 font-bold'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Include (Statutory 4.81%)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          presetName: 'custom',
                          includeGratuity: false,
                        }))
                      }
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        !config.includeGratuity
                          ? 'bg-purple-50 text-purple-700 border-purple-400 font-bold'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Exclude From CTC
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {config.includeGratuity
                      ? 'Payment of Gratuity Act 1972 formula: 15/26 × monthly basic.'
                      : 'Gratuity provision removed from CTC, increasing special allowance.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Table Breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Salary Component</th>
                  <th className="py-3.5 px-3 text-right">Annual Amount</th>
                  <th className="py-3.5 px-3 text-right">Monthly Amount</th>
                  <th className="py-3.5 px-3 text-right">% of CTC</th>
                  <th className="py-3.5 px-4 text-left hidden sm:table-cell">Tax Treatment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* 1. Basic Salary */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 sm:px-6 font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                      Basic Salary
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(breakdown.basicSalary.annualAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {formatINR(breakdown.basicSalary.monthlyAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {breakdown.basicSalary.percentageOfCTC}%
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] hidden sm:table-cell">
                    Fully taxable; reference for EPF &amp; HRA.
                  </td>
                </tr>

                {/* 2. HRA */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 sm:px-6 font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                      House Rent Allowance (HRA)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(breakdown.hra.annualAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {formatINR(breakdown.hra.monthlyAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {breakdown.hra.percentageOfCTC}%
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] hidden sm:table-cell">
                    Exempt under Sec 10(13A) with rent receipts (Old Regime).
                  </td>
                </tr>

                {/* 3. LTA */}
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 sm:px-6 font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-300 shrink-0" />
                      Leave Travel Allowance (LTA)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(breakdown.lta.annualAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {formatINR(breakdown.lta.monthlyAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {breakdown.lta.percentageOfCTC}%
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] hidden sm:table-cell">
                    Exempt for domestic travel tickets twice in 4 years (Old Regime).
                  </td>
                </tr>

                {/* 4. Special Allowance */}
                <tr className="hover:bg-slate-50/70 transition-colors bg-purple-50/30">
                  <td className="py-3 px-4 sm:px-6 font-bold text-purple-950">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      Special Allowance (Residual)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-purple-950">
                    {formatINR(breakdown.specialAllowance.annualAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-900">
                    {formatINR(breakdown.specialAllowance.monthlyAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-800">
                    {breakdown.specialAllowance.percentageOfCTC}%
                  </td>
                  <td className="py-3 px-4 text-purple-800 text-[11px] hidden sm:table-cell">
                    Balancing component; fully taxable in both regimes.
                  </td>
                </tr>

                {/* Gross Salary Subtotal Row */}
                <tr className="bg-slate-100/80 font-black border-t-2 border-slate-200">
                  <td className="py-3 px-4 sm:px-6 text-slate-900">
                    GROSS ANNUAL SALARY
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900">
                    {formatINR(breakdown.annualGrossSalary)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800">
                    {formatINR(breakdown.monthlyGrossSalary)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {Number(((breakdown.annualGrossSalary / (breakdown.annualCTC || 1)) * 100).toFixed(1))}%
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600 hidden sm:table-cell">
                    Cash earnings before employee deductions.
                  </td>
                </tr>

                {/* Employee PF Deduction */}
                <tr className="hover:bg-slate-50/70 transition-colors text-rose-800">
                  <td className="py-2.5 px-4 sm:px-6 font-medium">
                    <span className="flex items-center gap-2 pl-4">
                      ↳ Employee PF Deduction (12%)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                    - {formatINR(breakdown.employeePF.annualAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                    - {formatINR(breakdown.employeePF.monthlyAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                    {breakdown.employeePF.percentageOfCTC}%
                  </td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-500 hidden sm:table-cell">
                    Deducted from gross; deposited into EPFO; Sec 80C eligible.
                  </td>
                </tr>

                {/* Professional Tax Deduction */}
                <tr className="hover:bg-slate-50/70 transition-colors text-rose-800">
                  <td className="py-2.5 px-4 sm:px-6 font-medium">
                    <span className="flex items-center gap-2 pl-4">
                      ↳ Professional Tax (PT)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                    - {formatINR(breakdown.professionalTax.annualAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                    - {formatINR(breakdown.professionalTax.monthlyAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                    &lt; 0.5%
                  </td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-500 hidden sm:table-cell">
                    State tax deduction under Section 16(iii) (Old Regime).
                  </td>
                </tr>

                {/* Employer PF */}
                <tr className="hover:bg-slate-50/70 transition-colors text-sky-900 bg-sky-50/20">
                  <td className="py-2.5 px-4 sm:px-6 font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                      Employer PF Contribution (12%)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-900">
                    {formatINR(breakdown.employerPF.annualAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sky-700">
                    {formatINR(breakdown.employerPF.monthlyAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    {breakdown.employerPF.percentageOfCTC}%
                  </td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-500 hidden sm:table-cell">
                    Employer statutory contribution. Tax-free up to ₹7.5L.
                  </td>
                </tr>

                {/* Gratuity */}
                <tr className="hover:bg-slate-50/70 transition-colors text-emerald-900 bg-emerald-50/20">
                  <td className="py-2.5 px-4 sm:px-6 font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      Gratuity Provision (Statutory 4.81%)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900">
                    {formatINR(breakdown.gratuity.annualAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                    {formatINR(breakdown.gratuity.monthlyAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    {breakdown.gratuity.percentageOfCTC}%
                  </td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-500 hidden sm:table-cell">
                    Payment of Gratuity Act 1972 (15/26 of monthly basic).
                  </td>
                </tr>

                {/* TOTAL CTC ROW */}
                <tr className="bg-purple-900 text-white font-black text-sm">
                  <td className="py-4 px-4 sm:px-6">
                    TOTAL ANNUAL CTC (Cost to Company)
                  </td>
                  <td className="py-4 px-3 text-right font-mono text-emerald-300">
                    {formatINR(breakdown.annualCTC)}
                  </td>
                  <td className="py-4 px-3 text-right font-mono text-purple-200">
                    {formatINR(breakdown.monthlyCTC)}
                  </td>
                  <td className="py-4 px-3 text-right font-mono text-white">
                    100.0%
                  </td>
                  <td className="py-4 px-4 text-[11px] text-purple-200 hidden sm:table-cell">
                    Exact reconciliation (Gross + Employer Contributions).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col (4 cols): Visual Donut Chart & In-Hand Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Visual Salary Distribution Chart Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-purple-600" />
              <span>CTC Component Allocation</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Visual proportion of your package components.
            </p>

            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatINR(Number(val))}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">CTC</span>
                <span className="text-sm font-black text-slate-900">
                  {formatINR(breakdown.annualCTC)}
                </span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate">{item.name}</span>
                  <span className="font-bold text-slate-800 ml-auto">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* In-Hand Monthly Take-Home Pay Slip Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Monthly In-Hand Pay Slip</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Under Recommended {recommendation.recommendedRegime === 'OLD' ? 'Old Regime' : 'New Regime'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                Active FY {financialYear}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Monthly Gross Salary</span>
                <span className="font-mono font-bold text-white">
                  + {formatINR(breakdown.monthlyGrossSalary)}
                </span>
              </div>

              <div className="flex justify-between items-center text-rose-300">
                <span>Employee PF (EPF)</span>
                <span className="font-mono font-bold">
                  - {formatINR(breakdown.employeePF.monthlyAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-rose-300">
                <span>Professional Tax (PT)</span>
                <span className="font-mono font-bold">
                  - {formatINR(breakdown.professionalTax.monthlyAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-rose-300">
                <span>Estimated Monthly TDS (Tax)</span>
                <span className="font-mono font-bold">
                  - {formatINR(winningTakeHome.monthlyTDS)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Net Monthly In-Hand
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatINR(winningTakeHome.monthlyNetTakeHome)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
              Employer PF ({formatINR(breakdown.employerPF.monthlyAmount)}/mo) and Gratuity ({formatINR(breakdown.gratuity.monthlyAmount)}/mo) are part of your CTC package but are not deposited into your monthly bank cash flow.
            </p>
          </div>
        </div>
      </div>

      {/* Tax Regime Recommendation & Deductions Tuning Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Recommendation Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-purple-200 text-purple-900 text-xs font-bold shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
              <span>Official Recommendation for FY {financialYear}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {recommendation.recommendedRegime === 'OLD' ? (
                <>Old Tax Regime saves you <span className="text-purple-700">{formatINR(recommendation.taxSavings)}/year</span></>
              ) : recommendation.recommendedRegime === 'NEW' ? (
                <>New Tax Regime saves you <span className="text-purple-700">{formatINR(recommendation.taxSavings)}/year</span></>
              ) : (
                <>Both regimes produce identical tax liability</>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              {recommendation.headlineExplanation}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDeductionsOpen(!isDeductionsOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-colors self-start md:self-auto shrink-0"
          >
            <Sliders className="w-4 h-4" />
            <span>Tune Rent &amp; Tax Deductions</span>
            {isDeductionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Deductions Tuning Accordion */}
        {isDeductionsOpen && (
          <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-600" />
                <span>Rent &amp; Tax Saving Deductions (Section 80C, 80D, HRA)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Adjust your rent paid and investments to see if the Old Tax Regime becomes more beneficial.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Rent Paid Monthly */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Monthly Rent Paid
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={rentPaidMonthly || ''}
                    onChange={(e) => setRentPaidMonthly(Math.max(0, Number(e.target.value)))}
                    placeholder="15000"
                    className="w-full pl-7 pr-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="text-slate-500">City:</span>
                  <button
                    type="button"
                    onClick={() => setCityCategory('metro')}
                    className={`px-2 py-0.5 rounded font-semibold ${
                      cityCategory === 'metro' ? 'bg-purple-100 text-purple-800 font-bold' : 'text-slate-600'
                    }`}
                  >
                    Metro (50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCityCategory('non-metro')}
                    className={`px-2 py-0.5 rounded font-semibold ${
                      cityCategory === 'non-metro' ? 'bg-purple-100 text-purple-800 font-bold' : 'text-slate-600'
                    }`}
                  >
                    Non-Metro (40%)
                  </button>
                </div>
              </div>

              {/* Other Section 80C */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Other 80C Investments
                  </label>
                  <span className="text-[10px] text-purple-700 font-bold">Max ₹1.5L</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={other80C || ''}
                    onChange={(e) => setOther80C(Math.max(0, Number(e.target.value)))}
                    placeholder="50000"
                    className="w-full pl-7 pr-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  PPF, ELSS, Life Insurance. Combined with Employee PF (auto-capped at ₹1.5L).
                </p>
              </div>

              {/* Section 80D Health Insurance */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Health Insurance (Self + Family)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={healthInsuranceSelf || ''}
                    onChange={(e) => setHealthInsuranceSelf(Math.max(0, Number(e.target.value)))}
                    placeholder="20000"
                    className="w-full pl-7 pr-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Section 80D deduction (up to ₹25,000).</p>
              </div>

              {/* Section 80D Parents Health Insurance */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Parents Health Insurance (Senior)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={healthInsuranceParents || ''}
                    onChange={(e) => setHealthInsuranceParents(Math.max(0, Number(e.target.value)))}
                    placeholder="25000"
                    className="w-full pl-7 pr-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Section 80D senior citizen deduction (up to ₹50,000).</p>
              </div>

              {/* Section 80CCD(1B) Additional NPS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Additional NPS (80CCD 1B)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={npsSelf || ''}
                    onChange={(e) => setNpsSelf(Math.max(0, Number(e.target.value)))}
                    placeholder="50000"
                    className="w-full pl-7 pr-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Exclusive additional deduction up to ₹50,000.</p>
              </div>

              {/* Section 24(b) Home Loan Interest */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Home Loan Interest (Sec 24b)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={homeLoanInterest || ''}
                    onChange={(e) => setHomeLoanInterest(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Deduction up to ₹2,00,000 for self-occupied property.</p>
              </div>
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison Cards */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Tax Regime Card */}
          <div
            className={`p-6 rounded-3xl border-2 transition-all ${
              recommendation.recommendedRegime === 'OLD'
                ? 'border-purple-600 bg-purple-50/20 shadow-md ring-2 ring-purple-100'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Old Tax Regime</h3>
                <span className="text-xs text-slate-500">With full exemptions &amp; itemized deductions</span>
              </div>
              {recommendation.recommendedRegime === 'OLD' && (
                <span className="px-3 py-1 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> WINNER
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center text-slate-600">
                <span>Gross Total Income</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatINR(recommendation.oldRegimeResult.grossTotalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Standard Deduction</span>
                <span className="font-mono text-slate-700">
                  - {formatINR(recommendation.oldRegimeResult.exemptions.standardDeduction)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>HRA Exemption (Sec 10(13A))</span>
                <span className="font-mono text-purple-700 font-bold">
                  - {formatINR(recommendation.oldRegimeResult.exemptions.hraExemption)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Professional Tax (Sec 16(iii))</span>
                <span className="font-mono text-slate-700">
                  - {formatINR(recommendation.oldRegimeResult.exemptions.professionalTax)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total 80C (EPF + Other capped)</span>
                <span className="font-mono text-slate-700">
                  - {formatINR(recommendation.oldRegimeResult.deductions.section80C)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Other Deductions (80D, NPS, Home Loan)</span>
                <span className="font-mono text-slate-700">
                  - {formatINR(
                    recommendation.oldRegimeResult.deductions.totalDeductions -
                      recommendation.oldRegimeResult.deductions.section80C
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold text-slate-900">
                <span>Net Taxable Income</span>
                <span className="font-mono text-sm">
                  {formatINR(recommendation.oldRegimeResult.taxableIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-slate-900">
                <span>Total Tax (inc. 4% Cess)</span>
                <span className="font-mono text-base text-purple-950">
                  {formatINR(recommendation.oldRegimeResult.finalTaxLiability)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-700 font-bold">
                <span>Monthly Net Take-Home</span>
                <span className="font-mono text-emerald-700 text-sm">
                  {formatINR(takeHomeOld.monthlyNetTakeHome)}
                </span>
              </div>
            </div>
          </div>

          {/* New Tax Regime Card */}
          <div
            className={`p-6 rounded-3xl border-2 transition-all ${
              recommendation.recommendedRegime === 'NEW'
                ? 'border-purple-600 bg-purple-50/20 shadow-md ring-2 ring-purple-100'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">New Tax Regime (Section 115BAC)</h3>
                <span className="text-xs text-slate-500">
                  Lower tax slab rates &amp; enhanced standard deduction
                </span>
              </div>
              {recommendation.recommendedRegime === 'NEW' && (
                <span className="px-3 py-1 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> WINNER
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center text-slate-600">
                <span>Gross Total Income</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatINR(recommendation.newRegimeResult.grossTotalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Standard Deduction (Budget 2025 / FY 24-25)</span>
                <span className="font-mono text-purple-700 font-bold">
                  - {formatINR(recommendation.newRegimeResult.exemptions.standardDeduction)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>HRA Exemption</span>
                <span className="font-mono text-slate-400">₹0 (Not Allowed)</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Section 80C Deductions</span>
                <span className="font-mono text-slate-400">₹0 (Not Allowed)</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Section 80D Health Insurance</span>
                <span className="font-mono text-slate-400">₹0 (Not Allowed)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Employer NPS (Sec 80CCD(2))</span>
                <span className="font-mono text-slate-700">
                  {formatINR(recommendation.newRegimeResult.deductions.section80CCD2)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold text-slate-900">
                <span>Net Taxable Income</span>
                <span className="font-mono text-sm">
                  {formatINR(recommendation.newRegimeResult.taxableIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-slate-900">
                <span>Total Tax (inc. 4% Cess)</span>
                <span className="font-mono text-base text-purple-950">
                  {formatINR(recommendation.newRegimeResult.finalTaxLiability)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-700 font-bold">
                <span>Monthly Net Take-Home</span>
                <span className="font-mono text-emerald-700 text-sm">
                  {formatINR(takeHomeNew.monthlyNetTakeHome)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Break-Even Insight Banner */}
        {recommendation.breakEvenDeductionNeeded !== undefined && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                <strong>Break-Even Deduction Threshold:</strong> You need at least{' '}
                <strong className="text-purple-700 font-mono">
                  {formatINR(recommendation.breakEvenDeductionNeeded)}
                </strong>{' '}
                in total eligible deductions (HRA + 80C + 80D + Home Loan) for the Old Tax Regime to be beneficial for you.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
