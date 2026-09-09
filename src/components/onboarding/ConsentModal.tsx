import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle } from 'lucide-react';
import { Language } from '../../services/i18nService';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  hasConsented: boolean;
  language: Language;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  hasConsented,
  language
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {language !== 'en' ? 'नागरिक डेटा गोपनीयता एवं वैधानिक सहमति' : 'Citizen Privacy & Statutory Consent Notice'}
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Digital Personal Data Protection (DPDP) Act, 2023 Compliant
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p>
            {language !== 'en'
              ? 'सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) योजनाओं के अंतर्गत पात्रता मूल्यांकन हेतु संवेदनशील व्यक्तिगत जानकारी (जैसे सामाजिक वर्ग, पारिवारिक आय) की आवश्यकता होती है।'
              : 'Under MoSJE welfare credit guidelines, evaluating your exact scheme eligibility requires processing sensitive personal data, including your social category and family income.'}
          </p>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-start space-x-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">
                  {language !== 'en' ? 'उद्देश्य-सीमित प्रसंस्करण (Purpose Limitation):' : 'Purpose-Limited Processing:'}
                </strong>
                <p>
                  {language !== 'en'
                    ? 'आपकी जानकारी केवल और केवल सरकारी योजनाओं एवं निकटतम चैनल पार्टनर (निगम/बैंक) की मिलान गणना हेतु प्रयुक्त होगी।'
                    : 'Your information is used strictly for scheme matching, loan amortization modeling, and routing to authorized State Channelizing Agencies.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <EyeOff className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">
                  {language !== 'en' ? 'शून्य डेटा भंडारण (Data Minimization):' : 'Strict Data Minimization:'}
                </strong>
                <p>
                  {language !== 'en'
                    ? 'आपका डेटा क्लाउड डेटाबेस में संग्रहित नहीं किया जाता। यह सत्र समाप्त होते ही आपकी स्थानीय ब्राउज़र मेमोरी से स्वतः निष्कासित हो जाता है।'
                    : 'No persistent profiling. Beneficiary category and income figures remain on your browser session and are never sold, tracked, or monetized.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">
                  {language !== 'en' ? 'दस्तावेज़ सुरक्षा:' : 'No Raw Document Retention:'}
                </strong>
                <p>
                  {language !== 'en'
                    ? 'हम मूल प्रमाण पत्र अपलोड नहीं करवाते, केवल आपकी स्व-घोषणा के आधार पर पात्रता गणना प्रस्तुत करते हैं।'
                    : 'We do not store raw caste certificates or income proofs. Verification happens directly at the physical SCA or via official DigiLocker.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
            <strong>{language !== 'en' ? 'नागरिक का अधिकार:' : 'Citizen Rights:'}</strong>{' '}
            {language !== 'en'
              ? 'आप किसी भी समय "सहमति वापस लें" बटन दबाकर अपना सत्र डेटा तत्काल साफ़ कर सकते हैं।'
              : 'You retain the full statutory right to withdraw consent and purge all active session inputs instantly.'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            {language !== 'en' ? 'रद्द करें' : 'Close'}
          </button>

          <button
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5 transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {hasConsented
                ? (language !== 'en' ? 'सहमति स्वीकार्य है' : 'Consent Confirmed')
                : (language !== 'en' ? 'मैं सहमत हूँ एवं आगे बढ़ें' : 'I Consent & Proceed')}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
