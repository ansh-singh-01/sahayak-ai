import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Building2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  FileText, 
  ArrowRight,
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { BeneficiaryApplicationItem, ApplicationStage } from '../../types/beneficiary';
import { Language, TRANSLATIONS } from '../../services/i18nService';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: BeneficiaryApplicationItem | null;
  onUpdateStage: (newStage: ApplicationStage) => void;
  onNavigateToChecklist: () => void;
  language: Language;
}

const STAGES: { stage: ApplicationStage; label: string; hindiLabel: string }[] = [
  { stage: 'RECOMMENDED', label: 'Recommended', hindiLabel: 'अनुशंसित' },
  { stage: 'DOCUMENTS_PENDING', label: 'Documents Pending', hindiLabel: 'दस्तावेज़ अपेक्षित' },
  { stage: 'SUBMITTED', label: 'Submitted', hindiLabel: 'प्रस्तुत' },
  { stage: 'UNDER_REVIEW', label: 'Under Review', hindiLabel: 'समीक्षाधीन' },
  { stage: 'APPROVED', label: 'Approved', hindiLabel: 'स्वीकृत' }
];

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  onClose,
  application,
  onUpdateStage,
  onNavigateToChecklist,
  language
}) => {
  if (!isOpen || !application) return null;

  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';
  const [showPrintView, setShowPrintView] = useState(false);

  const currentStageIndex = STAGES.findIndex(s => s.stage === application.stage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-lg text-white shadow-sm">
              स
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-tight">
                  {isHindi ? 'आवेदन स्थिति एवं रूटिंग पास' : 'Application Tracking & Routing Details'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {application.referenceNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {application.agency} · {application.schemeName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Print Citizen Pass"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

          {/* Stepper Progress Bar */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isHindi ? 'वर्तमान आवेदन चरण' : 'Current Application Milestone'}
              </span>
              <span className="text-xs text-slate-500">
                {isHindi ? 'अंतिम अद्यतन:' : 'Last updated:'} {application.lastUpdated}
              </span>
            </div>

            {/* Stepper Steps */}
            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 -z-0">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ 
                    width: `${Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100)}%` 
                  }}
                />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                {STAGES.map((s, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={s.stage} className="flex flex-col items-center">
                      <div 
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-orange-600 text-white ring-4 ring-orange-200 animate-pulse'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className={`text-[11px] font-semibold mt-2 text-center max-w-[80px] leading-tight ${
                        isCurrent ? 'text-orange-700 font-bold' : isCompleted ? 'text-emerald-800' : 'text-slate-400'
                      }`}>
                        {isHindi ? s.hindiLabel : s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SIH Judging Stage Simulator */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isHindi ? '⚡ लाइव जूरी डेमो: चरण परिवर्तन परीक्षण' : '⚡ Live Jury Demo: Test Status Progression'}</span>
              </span>
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {STAGES.map(s => (
                  <button
                    key={s.stage}
                    onClick={() => onUpdateStage(s.stage)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      application.stage === s.stage
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {isHindi ? s.hindiLabel : s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'ऋण राशि' : 'Requested Loan'}
              </span>
              <span className="text-lg font-black text-slate-900 font-sans">
                ₹{(application.requestedAmount / 100000).toFixed(2)} L
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isHindi ? 'परियोजना लागत: ₹' : 'Project: ₹'}{(application.projectCost / 100000).toFixed(2)} L
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'दस्तावेज़ स्थिति' : 'Document Audit'}
              </span>
              <span className="text-lg font-black text-emerald-700 font-sans">
                {application.documentsReady} / {application.documentsTotal}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium block">
                {Math.round((application.documentsReady / application.documentsTotal) * 100)}% {isHindi ? 'तैयार' : 'Completed'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'आवेदन तिथि' : 'Applied On'}
              </span>
              <span className="text-sm font-black text-slate-900 font-sans mt-1 block">
                {application.appliedDate}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isHindi ? 'सत्यापित पोर्टल रिकॉर्ड' : 'Direct MoSJE Gateway'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'गोपनीयता मानक' : 'Privacy Standard'}
              </span>
              <span className="text-sm font-bold text-emerald-700 font-sans flex items-center space-x-1 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>DPDP 2023</span>
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isHindi ? 'सहमति टोकन सक्रिय' : 'Consent Token Active'}
              </span>
            </div>
          </div>

          {/* Designated Channel Partner Desk Card */}
          {application.partner && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {isHindi ? 'नामित चैनल पार्टनर (निकटतम कार्यालय)' : 'Designated Channel Partner Desk'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {application.partner.name}
                    </h4>
                    <p className="text-xs text-slate-600 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{application.partner.address}</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                  {application.partner.distanceKm} km
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isHindi ? 'नोडल अधिकारी' : 'Nodal Officer'}</span>
                  <span className="font-semibold text-slate-800">{application.partner.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isHindi ? 'सीधा संपर्क' : 'Helpline'}</span>
                  <a href={`tel:${application.partner.phone}`} className="font-semibold text-emerald-700 hover:underline">
                    {application.partner.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isHindi ? 'कार्यालय समय' : 'Office Hours'}</span>
                  <span className="font-semibold text-slate-800">{application.partner.workingHours}</span>
                </div>
              </div>
            </div>
          )}

          {/* Official QR Pass & Audit Box */}
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-slate-100 border border-slate-300 rounded-2xl flex items-center justify-center p-2 text-slate-900 shrink-0">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  {isHindi ? 'डिजिटल सत्यापन क्यूआर' : 'Official Verification QR'}
                </span>
                <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                  SAHAYAK Citizen Routing Token
                </h5>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {isHindi 
                    ? 'कार्यालय में सत्यापन हेतु यह क्यूआर कोड अथवा संदर्भ संख्या दिखाएं।' 
                    : 'Show this QR at the desk for instant Aadhaar-linked retrieval without paper queues.'}
                </p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>{isHindi ? 'पर्ची प्रिंट / डाउनलोड करें' : 'Print Routing Slip'}</span>
            </button>
          </div>

          {/* Timeline Milestones */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>{isHindi ? 'आवेदन गतिविधि टाइमलाइन' : 'Application Event History'}</span>
            </h4>
            <div className="space-y-3">
              {application.timeline.map((evt, i) => (
                <div key={i} className="flex items-start space-x-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    evt.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {isHindi && evt.hindiTitle ? evt.hindiTitle : evt.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 text-[11px]">{evt.description}</p>
                    {evt.officerRole && (
                      <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                        Verified by: {evt.officerRole}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onNavigateToChecklist();
            }}
            className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center space-x-1.5"
          >
            <span>{isHindi ? 'दस्तावेज़ चेकलिस्ट खोलें' : 'Audit Required Documents'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
