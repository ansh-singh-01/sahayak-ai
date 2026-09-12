import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Building2, 
  FileCheck2, 
  Calculator, 
  Sparkles, 
  MessageSquare, 
  PlusCircle, 
  Phone, 
  MapPin, 
  Navigation,
  ExternalLink,
  MessageCircle, 
  Bell, 
  Sliders, 
  AlertCircle, 
  ShieldCheck, 
  Coins, 
  Scale, 
  FileText, 
  HelpCircle,
  TrendingUp,
  Award,
  ChevronRight,
  Printer,
  Volume2,
  LogOut,
  Flame
} from 'lucide-react';
import { Scheme } from '../../types/scheme';
import { RankedPartner } from '../../types/partner';
import { CitizenProfile } from '../../types/user';
import { AuthUser } from '../../types/auth';
import { EvaluationOutcome } from '../../types/recommendation';
import { 
  BeneficiaryApplicationItem, 
  ApplicationStage, 
  BeneficiaryNotification 
} from '../../types/beneficiary';
import { Language, TRANSLATIONS, getSpeechCode } from '../../services/i18nService';
import { VoiceService } from '../../services/voiceService';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { BeneficiarySettingsModal } from './BeneficiarySettingsModal';
import { ExplainMyRejectionCard } from './ExplainMyRejectionCard';
import { GrievanceEscalationBanner } from './GrievanceEscalationBanner';
import { REAL_MOSJE_SCHEMES } from '../../data/schemesData';

interface BeneficiaryDashboardProps {
  profile: CitizenProfile;
  setProfile: React.Dispatch<React.SetStateAction<CitizenProfile>>;
  authUser: AuthUser | null;
  evaluation: EvaluationOutcome;
  selectedScheme: Scheme | null;
  selectedPartner: RankedPartner | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  onNavigateToTab: (tab: 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'compare') => void;
  onOpenVoiceModal: () => void;
  onOpenConsentModal: () => void;
  onOpenChat?: () => void;
  onLogout?: () => void;
  hasSubmittedNeeds?: boolean;
  onSelectScheme?: (scheme: Scheme) => void;
  onOpenRoutingSlip?: () => void;
}

const STAGES: { stage: ApplicationStage; label: string; hindiLabel: string }[] = [
  { stage: 'RECOMMENDED', label: 'Recommended', hindiLabel: 'अनुशंसित' },
  { stage: 'DOCUMENTS_PENDING', label: 'Documents Pending', hindiLabel: 'दस्तावेज़ अपेक्षित' },
  { stage: 'SUBMITTED', label: 'Submitted', hindiLabel: 'प्रस्तुत' },
  { stage: 'UNDER_REVIEW', label: 'Under Review', hindiLabel: 'समीक्षाधीन' },
  { stage: 'APPROVED', label: 'Approved', hindiLabel: 'स्वीकृत' },
  { stage: 'REJECTED', label: 'Not Approved', hindiLabel: 'अस्वीकृत' }
];


export const BeneficiaryDashboard: React.FC<BeneficiaryDashboardProps> = ({
  profile,
  setProfile,
  authUser,
  evaluation,
  selectedScheme,
  selectedPartner,
  language,
  setLanguage,
  onNavigateToTab,
  onOpenVoiceModal,
  onOpenConsentModal,
  onOpenChat,
  onLogout,
  hasSubmittedNeeds = false,
  onSelectScheme,
  onOpenRoutingSlip
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  // Modals State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [voiceFirstMode, setVoiceFirstMode] = useState(false);
  const [isSpeakingHeader, setIsSpeakingHeader] = useState(false);

  // Active Applications State
  const [applications, setApplications] = useState<BeneficiaryApplicationItem[]>(() => {
    if (!hasSubmittedNeeds) return [];
    try {
      const saved = localStorage.getItem('sahayak_citizen_applications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Default seed application reflecting active user profile
    const topRec = evaluation.eligibleSchemes[0] || evaluation.nearMissSchemes[0];
    const targetScheme = selectedScheme || topRec?.scheme;

    if (!targetScheme) return [];

    const defaultDocs = (targetScheme.requiredDocuments || [
      'Aadhaar Card',
      'Community Caste Certificate',
      'Income Certificate (SDM/Tehsildar)',
      'Detailed Project Report (DPR) / Machinery Quotation',
      'Bank Passbook (Aadhaar linked)'
    ]).map((doc, idx) => ({
      name: doc,
      isReady: idx === 0 || idx === 1 || idx === 4, // 3 ready by default
      requiredForScheme: true,
      issuingAuthority: 'Competent Authority'
    }));

    const readyCount = defaultDocs.filter(d => d.isReady).length;

    return [{
      id: 'app-seed-001',
      referenceNumber: 'SHK-849201',
      schemeId: targetScheme.id,
      schemeName: targetScheme.name,
      schemeCode: targetScheme.code,
      agency: targetScheme.agency,
      category: profile.category,
      requestedAmount: profile.loanAmountRequested || 250000,
      projectCost: profile.projectCost || 300000,
      stage: 'DOCUMENTS_PENDING',
      appliedDate: '02 Sep 2026',
      lastUpdated: '2 days ago',
      partner: selectedPartner,
      partnerId: selectedPartner?.id,
      partnerName: selectedPartner?.name,
      partnerAddress: selectedPartner?.address,
      partnerPhone: selectedPartner?.phone,
      partnerDistanceKm: selectedPartner?.distanceKm,
      documentsTotal: defaultDocs.length,
      documentsReady: readyCount,
      documentsList: defaultDocs,
      timeline: [
        {
          stage: 'RECOMMENDED',
          title: 'Algorithmic Scheme Eligibility Match',
          hindiTitle: 'एल्गोरिद्मिक योजना पात्रता मिलान',
          description: '100% deterministic rule criteria met for community category and income ceiling.',
          timestamp: '02 Sep 2026, 11:20 AM',
          completed: true,
          officerRole: 'SAHAYAK Deterministic Rule Engine'
        },
        {
          stage: 'DOCUMENTS_PENDING',
          title: 'Document Verification in Progress',
          hindiTitle: 'दस्तावेज़ सत्यापन प्रक्रियाधीन',
          description: `${readyCount} of ${defaultDocs.length} mandatory scheme documents compiled.`,
          timestamp: '04 Sep 2026, 04:15 PM',
          completed: true,
          officerRole: 'Citizen Self-Audit'
        },
        {
          stage: 'SUBMITTED',
          title: 'Citizen Routing Pass Dispatched to Desk',
          hindiTitle: 'नागरिक रूटिंग पास कार्यालय को प्रेषित',
          description: 'Awaiting in-person desk walk-in or digital DigiLocker pull.',
          timestamp: 'Pending Walk-in',
          completed: false
        },
        {
          stage: 'UNDER_REVIEW',
          title: 'SCA Credit Appraisal & Sanction',
          hindiTitle: 'निगम क्रेडिट मूल्यांकन एवं संस्वीकृति',
          description: 'Concessional interest rate and moratorium schedule endorsement.',
          timestamp: 'Expected within 4 days of walk-in',
          completed: false
        },
        {
          stage: 'APPROVED',
          title: 'Direct Benefit Transfer (DBT) Disbursement',
          hindiTitle: 'डीबीटी द्वारा बैंक खाते में ऋण संवितरण',
          description: 'Principal disbursed to Aadhaar-seeded bank account.',
          timestamp: 'Final Stage',
          completed: false
        }
      ]
    }];
  });

  // Notifications State
  const [notifications, setNotifications] = useState<BeneficiaryNotification[]>([
    {
      id: 'notif-1',
      title: 'Partner Desk Responded to Routing Pass',
      hindiTitle: 'पार्टनर कार्यालय ने आपकी पर्ची पर प्रतिक्रिया दी',
      description: 'Madhya Pradesh Backward Classes Dev Corp desk confirmed application quota is available.',
      timestamp: '2 days ago',
      read: false,
      type: 'PARTNER_RESPONSE',
      actionLabel: 'View Partner',
      targetTab: 'partners'
    },
    {
      id: 'notif-2',
      title: 'Document Verified: Caste & Identity',
      hindiTitle: 'दस्तावेज़ सत्यापित: जाति एवं पहचान प्रमाण',
      description: 'Your community category certificate has been validated against state repository standards.',
      timestamp: '4 days ago',
      read: false,
      type: 'DOC_VERIFIED',
      actionLabel: 'Checklist',
      targetTab: 'checklist'
    },
    {
      id: 'notif-3',
      title: 'New Scheme Eligibility Unlocked',
      hindiTitle: 'नई योजना पात्रता उपलब्ध',
      description: 'Based on your profile, you also qualify for NBCFDC Micro-Finance at 5.0% interest.',
      timestamp: '1 week ago',
      read: true,
      type: 'ELIGIBILITY_UPDATE',
      actionLabel: 'Compare',
      targetTab: 'recommendations'
    }
  ]);

  // Keep applications in sync with local storage
  useEffect(() => {
    try {
      localStorage.setItem('sahayak_citizen_applications', JSON.stringify(applications));
    } catch (e) {}
  }, [applications]);

  const activeApp = applications.length > 0 ? applications[0] : null;
  const topRecommendation = evaluation.eligibleSchemes[0] || null;

  // Most Popular & Effective Schemes curated for citizen's category
  const popularSchemesList = React.useMemo(() => {
    const userCategory = profile.category;
    const categorySchemes = REAL_MOSJE_SCHEMES.filter(s => 
      s.targetCommunity.includes(userCategory) || s.targetCommunity.includes('OPEN')
    );

    const candidates = [
      categorySchemes.find(s => s.code.includes('MSY')) || REAL_MOSJE_SCHEMES.find(s => s.code.includes('MSY')),
      categorySchemes.find(s => s.code.includes('TL-01') || s.id.includes('term') || s.id.includes('gls')) || REAL_MOSJE_SCHEMES.find(s => s.code.includes('TL-01')),
      categorySchemes.find(s => s.id.includes('education') || s.code.includes('EDU') || s.code.includes('EL')) || REAL_MOSJE_SCHEMES.find(s => s.id.includes('education') || s.code.includes('EDU') || s.code.includes('EL')),
      categorySchemes.find(s => s.code.includes('DAKSH') || s.id.includes('skill') || s.code.includes('GBS') || s.code.includes('SUY')) || REAL_MOSJE_SCHEMES.find(s => s.code.includes('DAKSH') || s.id.includes('skill'))
    ].filter(Boolean) as Scheme[];

    return candidates.length > 0 ? candidates : REAL_MOSJE_SCHEMES.slice(0, 4);
  }, [profile.category]);

  const [selectedPopularSchemeId, setSelectedPopularSchemeId] = useState<string>('');
  const activePopularScheme = popularSchemesList.find(s => s.id === selectedPopularSchemeId) || popularSchemesList[0];

  // Handle stage update from modal or simulator
  const handleUpdateStage = (newStage: ApplicationStage) => {
    setApplications(prev => {
      return prev.map(app => {
        if (app.id === activeApp?.id) {
          const newIdx = STAGES.findIndex(s => s.stage === newStage);
          const updatedTimeline = app.timeline.map((evt, idx) => ({
            ...evt,
            completed: idx <= newIdx
          }));
          return {
            ...app,
            stage: newStage,
            lastUpdated: 'Just now',
            timeline: updatedTimeline
          };
        }
        return app;
      });
    });
  };

  // Low-literacy voice readout of the dashboard header
  const handleSpeakStatus = () => {
    if (isSpeakingHeader) {
      VoiceService.stopSpeaking();
      setIsSpeakingHeader(false);
      return;
    }

    const speechLang = getSpeechCode(language);
    const displayName = authUser?.name || (profile.name && profile.name.trim() !== '' && profile.name !== 'Ramesh Kumar Patel' ? profile.name : '');
    const greeting = isHindi
      ? (displayName ? `नमस्ते ${displayName}।` : `नमस्ते।`) + ` आपके पास एक सक्रिय आवेदन है ${activeApp?.schemeName || ''} के लिए। आपकी वर्तमान स्थिति है: ${activeApp?.stage || 'प्रगति पर'}। आगे की सहायता के लिए माइक दबाएं।`
      : (displayName ? `Namaste, ${displayName}.` : `Namaste.`) + ` You have one active application for ${activeApp?.schemeName || 'MoSJE Welfare Scheme'}. Your current stage is ${activeApp?.stage || 'In Progress'}. Tap any action to proceed.`;

    setIsSpeakingHeader(true);
    VoiceService.speak(
      greeting,
      speechLang,
      () => setIsSpeakingHeader(false)
    );
  };

  // Mark all notifications read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* ========================================================================= */}
      {/* SECTION 2.1: HEADER                                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
              {authUser?.name 
                ? `${t.namaste}, ${authUser.name} 👋` 
                : profile.name && profile.name.trim() !== '' && profile.name !== 'Ramesh Kumar Patel'
                ? `${t.namaste}, ${profile.name} 👋`
                : `${t.namaste} 👋`}
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-600 mt-1.5 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {activeApp
                ? t.activeAppSingle
                : hasSubmittedNeeds
                ? t.noActiveApps
                : (isHindi ? 'कृपया सहायता योजना खोजने हेतु अपनी आवश्यकताएं दर्ज करें' : 'Please submit your enterprise needs to find eligible schemes')}
            </span>
            {activeApp && (
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                Ref: {activeApp.referenceNumber}
              </span>
            )}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Low-Literacy Audio Guidance (PRD §6) */}
          <button
            onClick={handleSpeakStatus}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-sm ${
              isSpeakingHeader
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
            title="Listen to status aloud in regional language"
          >
            <Volume2 className="w-4 h-4 text-emerald-700" />
            <span>{isSpeakingHeader ? (isHindi ? 'ध्वनि चल रही है...' : 'Playing Audio...') : (isHindi ? 'स्थिति सुनें' : 'Listen Status')}</span>
          </button>

          {/* Voice Assistant Modal */}
          <button
            onClick={onOpenVoiceModal}
            className="px-3.5 py-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
          >
            <span>🎙️</span>
            <span>{t.preferToSpeak}</span>
          </button>

          {/* Profile & Privacy Settings */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
            title={t.profileAndSettings}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Quick Sign Out Action */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer active:scale-95"
              title={t.signOut}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{t.signOut}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2.2: APPLICATION STATUS TRACKER (PRIMARY BLOCK)                  */}
      {/* ========================================================================= */}
      {activeApp ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 uppercase tracking-wider">
                  {activeApp.agency} Mandate
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {activeApp.schemeCode}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-sans">
                {activeApp.schemeName}
              </h3>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {isHindi ? 'अंतिम अद्यतन' : 'Last Updated'}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {activeApp.lastUpdated}
              </span>
            </div>
          </div>

          {/* 5-Stage Stepper */}
          <div className="py-2">
            <div className="relative">
              {/* Connector Bar */}
              <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 -z-0">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ 
                    width: `${Math.max(0, (STAGES.findIndex(s => s.stage === activeApp.stage) / (STAGES.length - 1)) * 100)}%` 
                  }}
                />
              </div>

              {/* Stepper Nodes */}
              <div className="relative z-10 flex items-center justify-between">
                {STAGES.map((s, idx) => {
                  const currentIdx = STAGES.findIndex(st => st.stage === activeApp.stage);
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

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
                      <span className={`text-[10px] sm:text-xs font-semibold mt-2 text-center max-w-[75px] sm:max-w-[100px] leading-tight ${
                        isCurrent ? 'text-orange-700 font-extrabold' : isCompleted ? 'text-emerald-800 font-bold' : 'text-slate-400'
                      }`}>
                        {isHindi ? s.hindiLabel : s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row & Live Demo Stage Switcher */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <span className="font-bold text-slate-800">
                {isHindi ? 'स्वीकृत ऋण बैंड:' : 'Requested Loan:'} ₹{(activeApp.requestedAmount / 100000).toFixed(2)} Lakh
              </span>
              <span>·</span>
              <span className="text-emerald-700 font-semibold">
                {activeApp.documentsReady} of {activeApp.documentsTotal} {isHindi ? 'दस्तावेज़ तैयार' : 'Docs Verified'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>{t.viewDetails}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Jury Demo: Stage Simulator Strip */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50/60 p-3 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? '⚡ लाइव जूरी डेमो स्थिति:' : '⚡ Live Jury Stage Tester:'}</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleUpdateStage('DOCUMENTS_PENDING')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  activeApp.stage === 'DOCUMENTS_PENDING'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                Documents Pending
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStage('UNDER_REVIEW')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  activeApp.stage === 'UNDER_REVIEW'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-amber-800 border border-amber-300'
                }`}
              >
                Under Review (Stalled)
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStage('APPROVED')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  activeApp.stage === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
                }`}
              >
                Approved (DBT)
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStage('REJECTED')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  activeApp.stage === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white hover:bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                Not Approved (Explain)
              </button>
            </div>
          </div>

          {/* USP 2: Explain My Rejection (Actionable Transparency) */}
          {activeApp.stage === 'REJECTED' && (
            <ExplainMyRejectionCard
              rejectionDetails={activeApp.rejectionDetails}
              language={language}
              onResubmitFixable={() => {
                handleUpdateStage('UNDER_REVIEW');
                alert(isHindi 
                  ? 'सत्यापन नोटिस: अद्यतन दस्तावेज़ सफलतापूर्वक अपलोड कर समीक्षा कतार में पुनः जोड़ दिया गया है।' 
                  : 'Document Resubmission Successful: Updated certificate uploaded and returned to priority review queue.');
              }}
              onSelectAlternativeScheme={(schName) => {
                onNavigateToTab('recommendations');
              }}
            />
          )}

          {/* USP 3: Grievance Escalation on Stalled Applications */}
          {activeApp.stage === 'UNDER_REVIEW' && (
            <GrievanceEscalationBanner
              applicationRef={activeApp.referenceNumber}
              schemeName={activeApp.schemeName}
              language={language}
              existingEscalation={activeApp.escalation}
              onEscalateSuccess={(ticket) => {
                setApplications(prev => prev.map(a => a.id === activeApp.id ? { ...a, escalation: ticket } : a));
              }}
            />
          )}

        </div>
      ) : (

        /* Empty State Card with CTA */
        <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {isHindi ? 'कोई सक्रिय आवेदन नहीं है' : 'No Active Applications Yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isHindi 
                ? 'अपनी श्रेणी और आय के आधार पर 100% सटीक सरकारी कल्याणकारी ऋण खोजें और 5 मिनट में आवेदन करें।' 
                : 'Discover eligible central credit schemes tailored to your community and enterprise purpose.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('wizard')}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition inline-flex items-center space-x-2"
          >
            <span>{t.findMySchemeCta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2-COLUMN DESKTOP GRID (SECTIONS 2.3, 2.4, 2.5, 2.7)                       */}
      {/* ========================================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT COLUMN */}
        <div className="space-y-8">
          
          {/* ===================================================================== */}
          {/* SECTION 2.3: MOST POPULAR & EFFECTIVE SCHEMES (REPLACES RECOMMENDED)   */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {isHindi ? 'सर्वाधिक लोकप्रिय एवं प्रभावी योजनाएं' : 'Most Popular & Effective Schemes'}
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      Top Uptake
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isHindi 
                      ? 'उच्चतम स्वीकृति दर व न्यूनतम ब्याज दर वाली प्रमुख केंद्रीय योजनाएं:' 
                      : 'Highest national uptake, lowest interest rates, and top capital subsidies:'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>98.6% Sanction Rate</span>
              </div>
            </div>

            {/* Quick Switcher Tabs for Popular Schemes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {popularSchemesList.map((scheme, idx) => {
                const isActive = scheme.id === activePopularScheme?.id;
                const rankLabels = ['#1 Most Popular', '#2 High Capital', '#3 Low Interest', '#4 Free Skill'];
                const rankLabelsHi = ['#1 सर्वाधिक लोकप्रिय', '#2 उच्च ऋण सीमा', '#3 न्यूनतम ब्याज', '#4 निःशुल्क कौशल'];

                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => {
                      setSelectedPopularSchemeId(scheme.id);
                      if (onSelectScheme) onSelectScheme(scheme);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                      isActive
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${
                        isActive ? 'text-amber-800 font-bold' : 'text-slate-400'
                      }`}>
                        {isHindi ? rankLabelsHi[idx] : rankLabels[idx]}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 line-clamp-1 block leading-tight">
                      {scheme.name.split('(')[0]}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      {scheme.interestSlabs[0]?.ratePercent ? `${scheme.interestSlabs[0].ratePercent}% Rate` : '4.0% - 6.0%'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Hero Card for Active Popular Scheme */}
            {activePopularScheme && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 border-2 border-amber-200/80 space-y-4 shadow-sm">
                
                {/* Title & Tagline */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono">
                      {activePopularScheme.agency} · {activePopularScheme.code}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                      {isHindi ? '100% केंद्रीय सामाजिक न्याय निगम' : '100% Central MoSJE Mandate'}
                    </span>
                  </div>

                  <h5 className="text-base sm:text-lg font-black text-slate-900 pt-0.5">
                    {isHindi && activePopularScheme.hindiName ? activePopularScheme.hindiName : activePopularScheme.name}
                  </h5>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    {isHindi && activePopularScheme.hindiDescription ? activePopularScheme.hindiDescription : activePopularScheme.tagline}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-200/80 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">
                      {isHindi ? 'अधिकतम परियोजना लागत' : 'Max Project Finance'}
                    </span>
                    <strong className="text-slate-900 font-sans text-sm block mt-0.5">
                      ₹{(activePopularScheme.maxLoanAmount / 100000).toFixed(1)} Lakh
                    </strong>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">
                      {isHindi ? 'रियायती ब्याज दर' : 'Concessional Interest'}
                    </span>
                    <strong className="text-emerald-700 font-sans text-sm font-black block mt-0.5">
                      {activePopularScheme.interestSlabs[0]?.ratePercent ? `${activePopularScheme.interestSlabs[0].ratePercent}% p.a.` : '4.0% - 6.0%'}
                    </strong>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">
                      {isHindi ? 'मोराटोरियम (छूट)' : 'Setup Moratorium'}
                    </span>
                    <strong className="text-indigo-950 font-sans text-sm block mt-0.5">
                      {activePopularScheme.moratoriumMonths || 6} {isHindi ? 'महीने' : 'Months'}
                    </strong>
                  </div>
                </div>

                {/* Why this scheme is effective callout */}
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-700 flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">
                      {isHindi ? 'यह योजना सबसे प्रभावी क्यों है?' : 'Why is this scheme considered most effective?'}:
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {activePopularScheme.keyBenefits?.[0] || 'Direct concessional credit with low interest rates and extended repayment tenure without third-party commission.'}
                    </p>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectScheme) onSelectScheme(activePopularScheme);
                        onNavigateToTab('calculator');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHindi ? 'ईएमआई जांचें' : 'Calculate EMI'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectScheme) onSelectScheme(activePopularScheme);
                        onNavigateToTab('checklist');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs transition border border-slate-300 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isHindi ? 'दस्तावेज़ सूची' : 'Documents'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectScheme) onSelectScheme(activePopularScheme);
                      onNavigateToTab('partners');
                    }}
                    className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center space-x-1 transition cursor-pointer"
                  >
                    <span>{isHindi ? 'नजदीकी बैंक / SCA देखें' : 'Locate Partner Bank'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Link to Wizard */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
              <span>
                {isHindi ? 'अपनी आय व व्यवसाय के आधार पर व्यक्तिगत जांच चाहते हैं?' : 'Want a 100% personalized rule-check based on your income?'}
              </span>
              <button
                type="button"
                onClick={() => onNavigateToTab('wizard')}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>{isHindi ? 'मेरी योजना खोजें (Wizard) →' : 'Run Find My Scheme →'}</span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SECTION 2.4: DOCUMENT CHECKLIST PROGRESS                              */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {isHindi ? 'दस्तावेज़ तैयारी प्रगति' : 'Document Checklist Progress'}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isHindi ? 'शून्य अस्वीकृति लक्ष्य' : 'Zero-Rejection Verification'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-emerald-700 font-sans">
                  {activeApp ? `${activeApp.documentsReady} / ${activeApp.documentsTotal}` : '4 / 7'}
                </span>
                <span className="text-[10px] text-slate-400 block font-bold">
                  {t.documentsReadyRatio}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${activeApp ? Math.round((activeApp.documentsReady / activeApp.documentsTotal) * 100) : 57}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>{activeApp ? Math.round((activeApp.documentsReady / activeApp.documentsTotal) * 100) : 57}% Complete</span>
                <span>DigiLocker Sync Enabled</span>
              </div>
            </div>

            {/* Checklist Chips Preview */}
            <div className="space-y-2 pt-1">
              {(activeApp?.documentsList || [
                { name: 'Aadhaar Card (Identity & Address)', isReady: true },
                { name: 'Community Caste Certificate', isReady: true },
                { name: 'Income Certificate (SDM/Tehsildar)', isReady: false },
                { name: 'Project Report / Vendor Quotation', isReady: false },
                { name: 'Bank Passbook (Aadhaar linked)', isReady: true }
              ]).slice(0, 4).map((doc, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[240px]">
                    {doc.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doc.isReady ? (isHindi ? 'तैयार' : 'Ready') : (isHindi ? 'अपेक्षित' : 'Pending')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateToTab('checklist')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <span>{t.continueChecklist}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* ===================================================================== */}
          {/* SECTION 2.5: YOUR CHANNEL PARTNER                                     */}
          {/* ===================================================================== */}
          {!hasSubmittedNeeds ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {t.designatedPartnerHeading}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isHindi ? 'योजना मिलान उपरांत आवंटन' : 'Assigned Post-Scheme Match'}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <h5 className="text-sm font-bold text-slate-900">
                    {isHindi ? 'चैनल पार्टनर आवंटन प्रतीक्षित' : 'Channel Partner Allocation Pending'}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    {isHindi
                      ? 'आपके जिले की राज्य चैनलाइजिंग एजेंसी (SCA) या नोडल बैंक शाखा आपकी योजना आवश्यकताएं जमा होने के बाद स्वतः नामित की जाएगी।'
                      : 'Your nearest district State Channelizing Agency (SCA) or bank branch with available quota will be routed automatically once your scheme needs are submitted.'}
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('wizard')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition inline-flex items-center space-x-2 cursor-pointer"
                >
                  <span>{isHindi ? 'पहले योजना खोजें →' : 'Find My Scheme First →'}</span>
                </button>
              </div>
            </div>
          ) : selectedPartner ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {t.designatedPartnerHeading}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {isHindi ? 'उपलब्ध कोटा एवं तीव्र गति' : 'Rank #1 Active Quota SCA'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {selectedPartner.distanceKm} km away
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                <div>
                  <h5 className="text-base font-bold text-slate-900">
                    {selectedPartner.name}
                  </h5>
                  <p className="text-xs text-slate-600 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedPartner.address}, PIN {selectedPartner.pinCode}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.nodalOfficer}</span>
                    <strong className="text-slate-800">{selectedPartner.contactPerson}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Working Hours</span>
                    <strong className="text-slate-800">{selectedPartner.workingHours}</strong>
                  </div>
                </div>

                {/* Partner Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPartner.lat},${selectedPartner.lng}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
                    title={isHindi ? "गूगल मैप्स में दिशा-निर्देश व नेविगेशन खोलें" : "Open Google Maps turn-by-turn directions"}
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.getDirections}</span>
                    <ExternalLink className="w-3 h-3 text-blue-400" />
                  </a>

                  <a
                    href={`tel:${selectedPartner.phone}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.contactPartner}</span>
                  </a>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `🏛️ MoSJE SAHAYAK - Channel Partner Details\n🏢 ${selectedPartner.name}\n📌 ${selectedPartner.address}, PIN: ${selectedPartner.pinCode}\n👤 Nodal Officer: ${selectedPartner.contactPerson} (${selectedPartner.phone})\n🗺️ Directions: https://www.google.com/maps/dir/?api=1&destination=${selectedPartner.lat},${selectedPartner.lng}&travelmode=driving`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
                    title={isHindi ? "व्हाट्सएप पर पार्टनर विवरण शेयर करें" : "Share partner details to WhatsApp"}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm text-center space-y-3">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">
                {isHindi ? 'कोई पार्टनर अभी चुना नहीं गया है' : 'No Channel Partner Routed Yet'}
              </h4>
              <p className="text-xs text-slate-500">
                {isHindi 
                  ? 'अपने जिले के सक्रिय राज्य चैनलाइजिंग एजेंसी (SCA) या बैंक का चयन करें।' 
                  : 'Find the nearest nodal branch with available quota in your district.'}
              </p>
              <button
                onClick={() => onNavigateToTab('partners')}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs"
              >
                {isHindi ? 'पार्टनर खोजें' : 'Locate Partners'}
              </button>
            </div>
          )}

          {/* ===================================================================== */}
          {/* SECTION 2.7: NOTIFICATIONS / UPDATES                                  */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {t.recentUpdatesTitle}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {notifications.filter(n => !n.read).length} {isHindi ? 'नई सूचनाएं' : 'Unread Alerts'}
                  </span>
                </div>
              </div>

              {notifications.some(n => !n.read) && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-orange-700 hover:text-orange-800"
                >
                  {isHindi ? 'सभी पढ़ें' : 'Mark all read'}
                </button>
              )}
            </div>

            {/* Notification items */}
            <div className="space-y-2.5">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.targetTab) onNavigateToTab(notif.targetTab);
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start space-x-3 ${
                    notif.read
                      ? 'bg-slate-50/60 border-slate-200'
                      : 'bg-orange-50/50 border-orange-200 shadow-xs'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    notif.read ? 'bg-slate-300' : 'bg-orange-600'
                  }`} />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {isHindi && notif.hindiTitle ? notif.hindiTitle : notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 2.6: QUICK ACTIONS (ROW OF ICON BUTTONS / CARDS)                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h4 className="text-base font-extrabold text-slate-900">
            {t.quickActionsTitle}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {isHindi ? 'तुरंत आवश्यक कार्यों पर जाएं' : 'Action-oriented shortcuts for your ongoing application journey'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Quick Action 1: Recalculate Loan */}
          <button
            onClick={() => onNavigateToTab('calculator')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-orange-700">
                {t.recalculateLoan}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {isHindi ? 'मोराटोरियम ईएमआई सिमुलेटर' : 'Pre-filled with saved loan'}
              </span>
            </div>
          </button>

          {/* Quick Action 2: Compare Other Schemes */}
          <button
            onClick={() => onNavigateToTab('recommendations')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-orange-700">
                {t.compareOtherSchemes}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {isHindi ? 'पात्रता अंतर एवं अन्य विकल्प' : 'View Near-Miss gap analysis'}
              </span>
            </div>
          </button>

          {/* Quick Action 3: Ask Sahayak AI */}
          <button
            onClick={() => onOpenChat ? onOpenChat() : onOpenVoiceModal()}
            className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-800">
                {t.askSahayak}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {isHindi ? 'ध्वनि व चैट सहायता' : 'Speak or text in 11 languages'}
              </span>
            </div>
          </button>

          {/* Quick Action 4: Start New Application */}
          <button
            onClick={() => onNavigateToTab('wizard')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left flex flex-col justify-between group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-blue-800">
                {t.startNewApp}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {isHindi ? 'भिन्न व्यवसाय अथवा शिक्षा हेतु' : 'Education vs Business credit'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2.9: HELP / SUPPORT (FOOTER-LEVEL)                                */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            <strong className="text-slate-800">{t.helpSupportTitle}:</strong> {t.tollFreeHelpline}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenConsentModal}
            className="text-slate-600 hover:text-emerald-700 transition flex items-center space-x-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Consent</span>
          </button>

          <button
            onClick={() => onOpenChat ? onOpenChat() : onOpenVoiceModal()}
            className="text-orange-700 hover:underline font-bold"
          >
            {isHindi ? 'सहायक से बात करें' : 'Talk to Sahayak AI'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APPLICATION DETAILS & QR PASS MODAL                                       */}
      {/* ========================================================================= */}
      <ApplicationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        application={activeApp}
        onUpdateStage={handleUpdateStage}
        onNavigateToChecklist={() => onNavigateToTab('checklist')}
        language={language}
      />

      {/* ========================================================================= */}
      {/* PROFILE & PRIVACY SETTINGS MODAL                                          */}
      {/* ========================================================================= */}
      <BeneficiarySettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile(prev => ({ ...prev, ...updated }))}
        language={language}
        setLanguage={setLanguage}
        authUser={authUser}
        voiceFirstMode={voiceFirstMode}
        setVoiceFirstMode={setVoiceFirstMode}
        onLogout={onLogout}
      />

    </div>
  );
};
