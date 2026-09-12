import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  FileWarning, 
  Sparkles, 
  HelpCircle, 
  ExternalLink,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { RejectionDetails, ApplicationStage } from '../../types/beneficiary';
import { Language } from '../../services/i18nService';

interface ExplainMyRejectionCardProps {
  rejectionDetails?: RejectionDetails;
  language: Language;
  onResubmitFixable: () => void;
  onSelectAlternativeScheme: (schemeName: string) => void;
}

export const ExplainMyRejectionCard: React.FC<ExplainMyRejectionCardProps> = ({
  rejectionDetails,
  language,
  onResubmitFixable,
  onSelectAlternativeScheme
}) => {
  const isHindi = language === 'hi';

  // Demo toggle between Fixable and Hard-Ineligible for judging pitch
  const [rejectionMode, setRejectionMode] = useState<'FIXABLE' | 'HARD_INELIGIBLE'>(
    rejectionDetails?.type || 'FIXABLE'
  );

  const fixableCase: RejectionDetails = {
    type: 'FIXABLE',
    code: 'DOCUMENT_STALE',
    title: 'Income Certificate Expired',
    hindiTitle: 'आय प्रमाण पत्र की वैधता समाप्त',
    reason: 'Income certificate issued 14 months ago. Statutory scheme guidelines (§4.2) mandate validity within 12 months of application date.',
    hindiReason: 'प्रस्तुत आय प्रमाण पत्र 14 माह पूर्व जारी हुआ था। योजना दिशा-निर्देश (§4.2) अनुसार यह 12 माह के भीतर का होना अनिवार्य है।',
    ruleCitation: 'NBCFDC Lending Guidelines 2026 §4.2 (Annual Income Proof Recency)',
    resolutionStep: 'Download fresh digital income certificate from State e-District portal or Tehsildar and resubmit. No new application needed.',
    hindiResolutionStep: 'ई-डिस्ट्रिक्ट पोर्टल अथवा तहसील कार्यालय से नया आय प्रमाण पत्र प्राप्त कर पुनः अपलोड करें। नया आवेदन करने की आवश्यकता नहीं है।',
    actionableCta: 'Resubmit Updated Document & Resume Review'
  };

  const hardIneligibleCase: RejectionDetails = {
    type: 'HARD_INELIGIBLE',
    code: 'INCOME_CEILING_EXCEEDED',
    title: 'Income Ceiling Exceeded for Scheme Quota',
    hindiTitle: 'योजना आय सीमा से अधिक पारिवारिक आय',
    reason: 'Reported family annual income of ₹4.20 Lakh exceeds the ₹3.00 Lakh statutory ceiling for Mahila Samriddhi Yojana 100% interest subvention.',
    hindiReason: 'दर्ज वार्षिक पारिवारिक आय ₹4.20 लाख, महिला समृद्धि योजना की ₹3.00 लाख की रियायती सीमा से अधिक है।',
    ruleCitation: 'MoSJE Direct Credit Rules §8.1 (Income Threshold Cap)',
    resolutionStep: 'Your profile remains 100% eligible for NBCFDC General Term Loan (ceiling up to ₹8.00 Lakh) with 5.0% concessional interest.',
    hindiResolutionStep: 'आप एनबीसीएफडीसी जनरल टर्म लोन (वार्षिक आय ₹8 लाख तक) हेतु 5.0% रियायती दर पर पूर्णतः पात्र हैं।',
    actionableCta: 'Switch to Eligible Near-Miss Scheme',
    alternativeSchemes: [
      {
        schemeName: 'NBCFDC General Term Loan (Medium Business)',
        agency: 'NBCFDC',
        reason: 'Allows income up to ₹8.00 Lakh with project loans up to ₹15.00 Lakh.'
      },
      {
        schemeName: 'NSFDC Micro-Credit Scheme (Credit Line)',
        agency: 'NSFDC',
        reason: 'Flexible collateral-free working capital via State Channelizing Agency.'
      }
    ]
  };

  const activeCase = rejectionMode === 'FIXABLE' ? fixableCase : hardIneligibleCase;

  return (
    <div className="rounded-3xl border-2 border-rose-200 bg-gradient-to-b from-rose-50/70 to-white p-6 sm:p-7 shadow-md space-y-5 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase tracking-wider">
                {isHindi ? 'यूएसपी 2 · अस्वीकृति का पारदर्शी कारण' : 'USP 2 · Explain My Rejection'}
              </span>
              <span className="text-xs font-bold text-rose-700 font-mono">
                {activeCase.code}
              </span>
            </div>
            <h4 className="text-lg font-black text-slate-900 mt-1">
              {isHindi && activeCase.hindiTitle ? activeCase.hindiTitle : activeCase.title}
            </h4>
          </div>
        </div>

        {/* Live Jury Demo Mode Switcher */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-rose-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setRejectionMode('FIXABLE')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              rejectionMode === 'FIXABLE'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fixable Document Stale
          </button>
          <button
            type="button"
            onClick={() => setRejectionMode('HARD_INELIGIBLE')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              rejectionMode === 'HARD_INELIGIBLE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hard-Ineligible Gap
          </button>
        </div>
      </div>

      {/* Rationale Breakdown Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Statutory Diagnosis */}
        <div className="md:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {isHindi ? 'सटीक वैधानिक कारण' : 'Statutory Diagnostic Breakdown'}
          </span>

          <p className="text-xs font-medium text-slate-700 leading-relaxed">
            {isHindi && activeCase.hindiReason ? activeCase.hindiReason : activeCase.reason}
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center space-x-1.5 text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">Legal Reference:</span>
            <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {activeCase.ruleCitation}
            </span>
          </div>
        </div>

        {/* Actionable Path */}
        <div className="md:col-span-5 bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                rejectionMode === 'FIXABLE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {rejectionMode === 'FIXABLE' ? '✔ Fixable Issue (No Loss of Queue)' : '★ Direct Near-Miss Alternative'}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-800 mt-2 leading-relaxed">
              {isHindi && activeCase.hindiResolutionStep ? activeCase.hindiResolutionStep : activeCase.resolutionStep}
            </p>
          </div>

          {/* Action Trigger */}
          {rejectionMode === 'FIXABLE' ? (
            <button
              type="button"
              onClick={onResubmitFixable}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isHindi ? 'दस्तावेज़ पुनः अपलोड कर समीक्षा में भेजें' : 'Upload Updated Document (Resume Queue)'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectAlternativeScheme(activeCase.alternativeSchemes?.[0]?.schemeName || 'NBCFDC General Term Loan')}
              className="w-full px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <span>{isHindi ? 'वैकल्पिक योजना पर स्विच करें →' : 'Switch to Alternative Scheme →'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Alternative Schemes (if Hard Ineligible) */}
      {rejectionMode === 'HARD_INELIGIBLE' && activeCase.alternativeSchemes && (
        <div className="pt-2 border-t border-rose-100 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
            {isHindi ? 'आपकी प्रोफाइल हेतु उपयुक्त वैकल्पिक योजनाएं:' : 'Pre-Evaluated Alternative Schemes for Your Profile:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeCase.alternativeSchemes.map((alt, idx) => (
              <div 
                key={idx}
                onClick={() => onSelectAlternativeScheme(alt.schemeName)}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">{alt.agency}</span>
                  <span className="text-xs font-bold text-slate-900">{alt.schemeName}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{alt.reason}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-600 shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
