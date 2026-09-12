import React, { useState } from 'react';
import { 
  CheckCircle, 
  ArrowRight, 
  Calculator, 
  MapPin, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  HelpCircle,
  Clock,
  Percent,
  Coins,
  Users
} from 'lucide-react';
import { SchemeRecommendation, EvaluationOutcome } from '../../types/recommendation';
import { Scheme } from '../../types/scheme';
import { Language, TRANSLATIONS } from '../../services/i18nService';
import { GapToEligibilityCard } from './GapToEligibilityCard';
import { RuleAuditModal } from './RuleAuditModal';

interface RecommendationListProps {
  evaluation: EvaluationOutcome;
  language: Language;
  isAuthenticated?: boolean;
  onNavigateToAuth?: () => void;
  onSelectSchemeForCalculator: (scheme: Scheme) => void;
  onSelectSchemeForPartners: (scheme: Scheme) => void;
  onSelectSchemeForChecklist: (scheme: Scheme) => void;
  onOpenAiExplainer: (rec: SchemeRecommendation) => void;
  onSelectSchemeForFamilyLoan?: (scheme: Scheme) => void;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  evaluation,
  language,
  isAuthenticated = false,
  onNavigateToAuth,
  onSelectSchemeForCalculator,
  onSelectSchemeForPartners,
  onSelectSchemeForChecklist,
  onOpenAiExplainer,
  onSelectSchemeForFamilyLoan
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';
  const [selectedAuditRec, setSelectedAuditRec] = useState<SchemeRecommendation | null>(null);

  const { eligibleSchemes, nearMissSchemes } = evaluation;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* Eligible Schemes Section */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                {isHindi ? 'पात्र योजनाएं' : 'Eligible Schemes Found'}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
                {t.eligibleSchemesHeading} ({eligibleSchemes.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.eligibleSubtitle}
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Evaluation ID: <span className="font-mono text-slate-700">{evaluation.evaluationId}</span>
          </div>
        </div>

        {eligibleSchemes.length === 0 ? (
          <div className="bg-amber-50 rounded-2xl p-8 text-center border border-amber-200">
            <p className="text-sm font-semibold text-amber-900">
              {t.noEligibleFound}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {eligibleSchemes.map((rec, index) => {
              const s = rec.scheme;
              const isTopPick = index === 0;

              return (
                <div 
                  key={s.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 border-2 transition shadow-sm hover:shadow-md ${
                    isTopPick ? 'border-orange-400 ring-4 ring-orange-100' : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {isTopPick && (
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-white rounded-full shadow-sm">
                            ★ Top Recommended Match
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
                          {s.agency}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">{s.code}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {isHindi ? s.hindiName : s.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isHindi ? s.hindiDescription : s.description}
                      </p>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          {t.matchScore}
                        </span>
                        <div className="text-2xl font-black text-emerald-600 font-sans">
                          {rec.matchScore}%
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200 font-bold">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Why You Qualify Section */}
                  <div className="my-5 bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.whyYouQualify}:</span>
                      </span>

                      <button
                        onClick={() => setSelectedAuditRec(rec)}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{t.viewAuditTrail}</span>
                      </button>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {(isHindi ? rec.hindiReasons : rec.reasons).map((reason, ri) => (
                        <li key={ri} className="flex items-start space-x-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Financial Highlights Pill Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-1 text-slate-400 mb-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Max Loan Band</span>
                      </div>
                      <span className="font-extrabold text-sm text-slate-900">
                        ₹{(s.maxLoanAmount / 100000).toFixed(2)} Lakh
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-1 text-slate-400 mb-1">
                        <Percent className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Concessional Rate</span>
                      </div>
                      <span className="font-extrabold text-sm text-emerald-700">
                        {rec.calculatedApplicableInterestRate}% p.a.
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-1 text-slate-400 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Moratorium Period</span>
                      </div>
                      <span className="font-extrabold text-sm text-slate-900">
                        {s.moratoriumMonths} Months
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-1 text-slate-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-bold uppercase">Capital Subsidy</span>
                      </div>
                      <span className="font-extrabold text-sm text-amber-700">
                        {s.maxSubsidyAmount ? `Up to ₹${(s.maxSubsidyAmount / 1000).toFixed(0)}k` : 'Not applicable'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onOpenAiExplainer(rec)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span>{isHindi ? 'एआई सरल व्याख्या (Plain AI Explanation)' : 'AI Plain Explanation'}</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {isAuthenticated && (
                        <button
                          onClick={() => {
                            if (onSelectSchemeForFamilyLoan) {
                              onSelectSchemeForFamilyLoan(s);
                            }
                          }}
                          className="px-3.5 py-2 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-2xs active:scale-95"
                          title="Take the Loan in a Family Member's Name"
                        >
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{isHindi ? 'परिवार के नाम पर ऋण' : "Take in Family Member's Name"}</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectSchemeForCalculator(s)}
                        className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5 text-orange-600" />
                        <span>{t.calculateEmi}</span>
                      </button>

                      <button
                        onClick={() => onSelectSchemeForPartners(s)}
                        className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-600/20 transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{t.routeToPartner}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Near Miss Schemes (Gap to Eligibility) */}
      <GapToEligibilityCard
        nearMisses={nearMissSchemes}
        language={language}
        isAuthenticated={isAuthenticated}
        onNavigateToAuth={onNavigateToAuth}
        onViewAudit={(rec) => setSelectedAuditRec(rec)}
      />

      {/* Rule Audit Modal */}
      <RuleAuditModal
        isOpen={Boolean(selectedAuditRec)}
        onClose={() => setSelectedAuditRec(null)}
        recommendation={selectedAuditRec}
        language={language}
      />

    </div>
  );
};
