import React from 'react';
import { Language } from '../../services/i18nService';

interface CostBreakdownChartProps {
  principal: number;
  totalInterest: number;
  subsidy: number;
  language: Language;
}

export const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({
  principal,
  totalInterest,
  subsidy,
  language
}) => {
  const isHindi = language === 'hi';
  const effectivePrincipal = Math.max(0, principal - subsidy);
  const total = effectivePrincipal + totalInterest + subsidy;

  if (total <= 0) return null;

  const principalPct = Math.round((effectivePrincipal / total) * 100);
  const interestPct = Math.round((totalInterest / total) * 100);
  const subsidyPct = Math.max(0, 100 - principalPct - interestPct);

  // SVG Donut calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const principalStroke = (principalPct / 100) * circumference;
  const interestStroke = (interestPct / 100) * circumference;
  const subsidyStroke = (subsidyPct / 100) * circumference;

  return (
    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
      
      {/* SVG Donut Visual */}
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth="20"
          />
          {/* Principal (Blue/Navy) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#1e3a8a"
            strokeWidth="20"
            strokeDasharray={`${principalStroke} ${circumference}`}
            strokeDashoffset="0"
          />
          {/* Interest (Orange) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#ea580c"
            strokeWidth="20"
            strokeDasharray={`${interestStroke} ${circumference}`}
            strokeDashoffset={`-${principalStroke}`}
          />
          {/* Subsidy (Emerald) */}
          {subsidy > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="20"
              strokeDasharray={`${subsidyStroke} ${circumference}`}
              strokeDashoffset={`-${principalStroke + interestStroke}`}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {isHindi ? 'कुल लागत' : 'Total'}
          </span>
          <span className="text-sm font-black text-slate-800">
            ₹{((total) / 100000).toFixed(2)}L
          </span>
        </div>
      </div>

      {/* Legend & Amounts */}
      <div className="flex-1 space-y-3 w-full text-xs">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-900 shrink-0"></span>
            <span className="font-semibold text-slate-700">
              {isHindi ? 'निवल मूलधन (Net Principal)' : 'Net Principal Repaid'}
            </span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-slate-900 block">₹{effectivePrincipal.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400">{principalPct}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-600 shrink-0"></span>
            <span className="font-semibold text-slate-700">
              {isHindi ? 'कुल ब्याज (Total Interest)' : 'Total Interest Cost'}
            </span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-orange-600 block">₹{totalInterest.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400">{interestPct}%</span>
          </div>
        </div>

        {subsidy > 0 && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="font-bold text-emerald-900">
                {isHindi ? 'सरकारी अनुदान (Govt Subsidy)' : 'Govt Capital Subsidy'}
              </span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-emerald-700 block">- ₹{subsidy.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-600 font-bold">{subsidyPct}% SAVED</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
