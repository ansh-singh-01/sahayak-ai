import React, { useState } from 'react';
import { AmortizationRow } from '../../services/loanCalculator';
import { Language } from '../../services/i18nService';

interface AmortizationTableProps {
  yearlySchedule: AmortizationRow[];
  monthlySchedule: AmortizationRow[];
  language: Language;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  yearlySchedule,
  monthlySchedule,
  language
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const isHindi = language === 'hi';

  const rows = viewMode === 'yearly' ? yearlySchedule : monthlySchedule;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mt-8">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h4 className="text-lg font-bold text-slate-900 font-sans">
            {isHindi ? 'ऋण परिशोधन तालिका (Amortization Schedule)' : 'Loan Amortization & Repayment Schedule'}
          </h4>
          <p className="text-xs text-slate-500">
            {isHindi 
              ? 'मोराटोरियम एवं नियमित पुनर्भुगतान का अवधि-वार विभाजन' 
              : 'Detailed breakdown of principal, interest, and remaining balance across tenure'}
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'yearly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isHindi ? 'वार्षिक (Yearly)' : 'Yearly View'}
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isHindi ? 'मासिक (Monthly)' : 'Monthly View'}
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-4 max-h-96">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-600 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3 rounded-l-lg">{isHindi ? 'अवधि' : 'Period'}</th>
              <th className="p-3 text-right">{isHindi ? 'प्रारंभिक शेष' : 'Opening Bal'}</th>
              <th className="p-3 text-right">{isHindi ? 'किस्त भुगतान' : 'Total Payment'}</th>
              <th className="p-3 text-right">{isHindi ? 'मूलधन अंश' : 'Principal'}</th>
              <th className="p-3 text-right">{isHindi ? 'ब्याज अंश' : 'Interest'}</th>
              <th className="p-3 text-right rounded-r-lg">{isHindi ? 'अंतिम शेष' : 'Closing Bal'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr 
                key={i} 
                className={`hover:bg-slate-50 transition ${
                  r.isMoratorium ? 'bg-amber-50/50' : ''
                }`}
              >
                <td className="p-3 font-semibold text-slate-800 flex items-center space-x-2">
                  <span>{r.label}</span>
                  {r.isMoratorium && (
                    <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                      Moratorium
                    </span>
                  )}
                </td>
                <td className="p-3 text-right text-slate-600 font-mono">
                  ₹{r.openingBalance.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-right font-bold text-slate-900 font-mono">
                  ₹{r.emiPayment.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-right text-emerald-700 font-semibold font-mono">
                  ₹{r.principalComponent.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-right text-orange-600 font-semibold font-mono">
                  ₹{r.interestComponent.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-right text-slate-700 font-bold font-mono">
                  ₹{r.closingBalance.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
