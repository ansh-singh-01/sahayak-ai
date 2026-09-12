import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, FileText, ShieldAlert, Sparkles, XCircle } from 'lucide-react';
import { SchemeRecommendation } from '../../types/recommendation';
import { Language, TRANSLATIONS } from '../../services/i18nService';

interface GapToEligibilityCardProps {
  nearMisses: SchemeRecommendation[];
  language: Language;
  isAuthenticated?: boolean;
  onNavigateToAuth?: () => void;
  onViewAudit: (rec: SchemeRecommendation) => void;
}

export const GapToEligibilityCard: React.FC<GapToEligibilityCardProps> = ({
  nearMisses,
  language,
  isAuthenticated = false,
  onNavigateToAuth,
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
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
              isAuthenticated 
                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {isAuthenticated ? (isHindi ? 'पात्रता अंतर विश्लेषण' : 'Eligibility Gap Analysis') : (isHindi ? 'दस्तावेज़ आवश्यकता स्थिति' : 'Document Verification Pending')}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 font-sans">
              {isAuthenticated 
                ? t.nearMissHeading 
                : (isHindi ? 'आवश्यक दस्तावेज़ और संभावित योजनाएं' : 'Required Documents for Scheme Eligibility')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAuthenticated 
              ? t.nearMissSubtitle 
              : (isHindi 
                ? 'आप अभी साइन-इन नहीं हैं। इन योजनाओं के लिए पात्र होने हेतु निम्नलिखित आधिकारिक दस्तावेज़ों का सत्यापन आवश्यक है।' 
                : 'You are currently browsing as a guest. The following documents are required to verify your official scheme eligibility.')}
          </p>
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 hidden md:block">
          💡 <em>{isAuthenticated ? 'Transparent Alternative: Ineligible schemes are not hidden; gaps are calculated.' : 'Sign in & submit documents via DigiLocker to unlock instant eligibility.'}</em>
        </div>
      </div>

      {/* Grid of Near-Miss / Pending Document Schemes */}
      <div className="space-y-4">
        {nearMisses.map((rec) => {
          const reqDocs = rec.scheme.requiredDocuments || [
            'Aadhaar Card',
            'Caste Certificate',
            'Income Certificate',
            'Project Cost DPR'
          ];

          return (
            <div 
              key={rec.scheme.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 border-2 transition shadow-sm ${
                isAuthenticated ? 'border-slate-200 hover:border-slate-300' : 'border-amber-200 hover:border-amber-300'
              }`}
            >
              {/* Scheme Title & Status Tag */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
                      {rec.scheme.agency}
                    </span>
                    {isAuthenticated ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center space-x-1">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>{isHindi ? 'वर्तमान में अपात्र (Not Eligible Today)' : 'Not Currently Eligible'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-amber-600" />
                        <span>{isHindi ? `${reqDocs.length} दस्तावेज़ सत्यापन आवश्यक` : `${reqDocs.length} Documents Required to Verify`}</span>
                      </span>
                    )}
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

              {/* Conditional Rendering: Non-Signed-In vs Signed-In */}
              {!isAuthenticated ? (
                /* UN-AUTHENTICATED STATE: SHOW REQUIRED DOCUMENTS NEEDED FOR ELIGIBILITY */
                <div className="mt-4 bg-amber-50/70 rounded-xl p-4 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isHindi ? `पात्रता सत्यापन हेतु आवश्यक ${reqDocs.length} दस्तावेज़:` : `Documents Required for Full Eligibility Verification (${reqDocs.length}):`}</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      DigiLocker Ready
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isHindi 
                      ? 'आप अभी अतिथि के रूप में देख रहे हैं। इस योजना के लिए 100% सटीक पात्रता अनलॉक करने हेतु निम्नलिखित प्रमाणपत्र जमा या डिजिलॉकर से लिंक करें:'
                      : 'You have not signed in or uploaded documents yet. To unlock official eligibility & reserved quota for this scheme, you require the following documents:'}
                  </p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {reqDocs.map((doc, idx) => (
                      <li key={idx} className="flex items-center space-x-2 bg-white/90 p-2.5 rounded-lg border border-amber-200/80 font-medium text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 flex items-center justify-between border-t border-amber-200/60">
                    <span className="text-xs text-amber-900 font-semibold">
                      {isHindi ? 'साइन-इन कर डिजिलॉकर से 1-क्लिक में लिंक करें' : 'Sign in to link DigiLocker certificates in 1-click'}
                    </span>
                    {onNavigateToAuth && (
                      <button
                        onClick={onNavigateToAuth}
                        className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>{isHindi ? 'साइन-इन करें व दस्तावेज़ जमा करें →' : 'Sign In & Submit Documents →'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* AUTHENTICATED STATE: SHOW GAP BREAKDOWN BOX */
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
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
