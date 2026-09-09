import React from 'react';
import { Clock, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RankedPartner } from '../../types/partner';
import { Language } from '../../services/i18nService';

interface ReliabilityBadgeProps {
  partner: RankedPartner;
  language: Language;
}

export const ReliabilityBadge: React.FC<ReliabilityBadgeProps> = ({
  partner,
  language
}) => {
  const isHindi = language === 'hi';
  const { reliability, reliabilityLevel, rankingRationale } = partner;

  const levelStyles = {
    EXCELLENT: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    GOOD: 'bg-blue-50 text-blue-800 border-blue-300',
    AVERAGE: 'bg-amber-50 text-amber-800 border-amber-300',
    CONGESTED: 'bg-rose-50 text-rose-800 border-rose-300'
  };

  const levelLabels = {
    EXCELLENT: isHindi ? 'उत्कृष्ट (त्वरित निस्तारण)' : 'Top Priority / Fast-Track',
    GOOD: isHindi ? 'सक्रिय एवं सामान्य' : 'Active Intake',
    AVERAGE: isHindi ? 'मध्यम कतार' : 'Moderate Queue',
    CONGESTED: isHindi ? 'अत्यधिक भार / कोटा पूर्ण' : 'Exhausted Quota / Congested'
  };

  return (
    <div className="space-y-2.5">
      
      {/* Top Metrics Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border flex items-center space-x-1 ${levelStyles[reliabilityLevel]}`}>
          {reliabilityLevel === 'CONGESTED' ? (
            <AlertTriangle className="w-3 h-3 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          )}
          <span>{levelLabels[reliabilityLevel]}</span>
        </span>

        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          ⏱️ <strong>{reliability.averageResponseTimeDays}</strong> {isHindi ? 'दिन औसत समय' : 'Days Avg. TAT'}
        </span>

        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          📊 <strong>{100 - reliability.allocatedFundUtilizationPercent}%</strong> {isHindi ? 'फंड कोटा शेष' : 'Quota Left'}
        </span>

        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          🛡️ <strong>{reliability.grievanceResolutionRate}%</strong> {isHindi ? 'संतुष्टि दर' : 'Resolution'}
        </span>
      </div>

      {/* Rationale Explanation Box */}
      <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
        {rankingRationale}
      </div>

    </div>
  );
};
