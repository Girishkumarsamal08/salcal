'use client';

import React from 'react';
import { TaxComparisonRecommendation, SalaryComponents } from '@/lib/tax/types';
import { formatINR } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface VisualChartsProps {
  recommendation: TaxComparisonRecommendation;
  salary: SalaryComponents;
}

const PIE_COLORS = ['#059669', '#3b82f6', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

export function VisualCharts({ recommendation, salary }: VisualChartsProps) {
  const { oldRegimeResult, newRegimeResult } = recommendation;

  // Data for Comparison Bar Chart
  const comparisonData = [
    {
      name: 'Gross Total Income',
      'Old Regime': oldRegimeResult.grossTotalIncome,
      'New Regime': newRegimeResult.grossTotalIncome,
    },
    {
      name: 'Exemptions & Deductions',
      'Old Regime': oldRegimeResult.exemptions.totalExemptions + oldRegimeResult.deductions.totalDeductions,
      'New Regime': newRegimeResult.exemptions.totalExemptions + newRegimeResult.deductions.totalDeductions,
    },
    {
      name: 'Net Taxable Income',
      'Old Regime': oldRegimeResult.taxableIncome,
      'New Regime': newRegimeResult.taxableIncome,
    },
    {
      name: 'Final Estimated Tax',
      'Old Regime': oldRegimeResult.finalTaxLiability,
      'New Regime': newRegimeResult.finalTaxLiability,
    },
  ];

  // Data for Salary Breakdown Pie Chart
  const pieData = [
    { name: 'Basic Salary', value: salary.basicSalary },
    { name: 'HRA Received', value: salary.hraReceived },
    { name: 'Special Allowance', value: salary.specialAllowance },
    { name: 'Employee PF', value: salary.employeePF },
    { name: 'Bonus / Variable', value: salary.bonus },
    { name: 'Other Allowances', value: salary.otherAllowances + salary.lta },
  ].filter(item => item.value > 0);

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
          <p className="font-bold text-slate-300 mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-amber-400 font-semibold">
              Old Regime: {formatINR(payload[0].value)}
            </p>
            <p className="text-emerald-400 font-semibold">
              New Regime: {formatINR(payload[1].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg border border-slate-700">
          <p className="font-semibold">{data.name}</p>
          <p className="text-emerald-400 font-bold">{formatINR(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Comparison Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Tax Liability & Income Comparison
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Side-by-side comparison of income, deductions, and tax liability under both regimes.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="Old Regime" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="New Regime" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Salary Components Donut Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Salary Structure Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Breakdown of your annualized compensation components.
          </p>
        </div>

        <div className="h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px' }}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
