import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, XCircle } from 'lucide-react';
import { SchemeRecommendation } from '../../types/recommendation';
import { Language, TRANSLATIONS } from '../../services/i18nService';

interface GapToEligibilityCardProps {
  nearMisses: SchemeRecommendation[];
  language: Language;
  onViewAudit: (rec: SchemeRecommendation) => void;
}

export const GapToEligibilityCard: React.FC<GapToEligibilityCardProps> = ({
  nearMisses,
  language,
  onViewAudit
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  if (nearMisses.length === 0) return null;

  return (
    <div className="mt-12">
      {/* Section Header with SIH Innovation Callout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              PRD §16 Novelty Feature
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 font-sans">
              {t.nearMissHeading}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.nearMissSubtitle}
          </p>
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 hidden md:block">
          💡 <em>Transparent Alternative: Ineligible schemes are not hidden; gaps are calculated.</em>
        </div>
      </div>

      {/* Grid of Near-Miss Schemes */}
      <div className="space-y-4">
        {nearMisses.map((rec) => (
          <div 
            key={rec.scheme.id}
            className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-slate-200 hover:border-slate-300 shadow-sm transition"
          >
            {/* Scheme Title & Ineligible Tag */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
                    {rec.scheme.agency}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center space-x-1">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>{isHindi ? 'वर्तमान में अपात्र (Not Eligible Today)' : 'Not Currently Eligible'}</span>
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mt-1">
                  {isHindi ? rec.scheme.hindiName : rec.scheme.name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {rec.scheme.tagline}
                </p>
              </div>

              <button
                onClick={() => onViewAudit(rec)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition shrink-0"
              >
                {isHindi ? 'नियम ट्रेस देखें' : 'View Rule Trace'}
              </button>
            </div>

            {/* Gap Breakdown Box */}
            <div className="mt-4 bg-rose-50/60 rounded-xl p-4 border border-rose-200/80 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>{isHindi ? 'पात्रता में अंतर (Why You Missed):' : 'Identified Eligibility Gap:'}</span>
              </span>

              {rec.eligibilityGaps.map((gap, i) => (
                <div key={i} className="space-y-1.5 text-xs text-slate-800">
                  <div className="flex items-start space-x-2">
                    <span className="text-rose-600 font-black text-sm shrink-0">✗</span>
                    <div>
                      <strong className="text-slate-900">{gap.fieldLabel}:</strong>{' '}
                      <span>{gap.gapDifference} (Your value: {gap.userValue} vs Required: {gap.requiredValue})</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pl-4 text-emerald-800 bg-white/80 p-2.5 rounded-lg border border-emerald-200 font-medium">
                    <span className="text-emerald-600 font-bold shrink-0">→</span>
                    <span>
                      <strong>{isHindi ? 'पात्र बनने का समाधान:' : 'How to Qualify:'}</strong>{' '}
                      {isHindi ? gap.hindiAdvice : gap.remediationAdvice}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
