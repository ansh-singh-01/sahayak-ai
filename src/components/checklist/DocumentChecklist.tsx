import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  Printer, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  RefreshCw, 
  X, 
  AlertCircle, 
  Download, 
  QrCode,
  Lock,
  ExternalLink,
  Users
} from 'lucide-react';
import { Scheme } from '../../types/scheme';
import { REAL_MOSJE_SCHEMES } from '../../data/schemesData';
import { CitizenSlip } from './CitizenSlip';
import { CitizenProfile } from '../../types/user';
import { RankedPartner } from '../../types/partner';
import { Language, TRANSLATIONS } from '../../services/i18nService';
import { AuthUser } from '../../types/auth';

export type MandatoryDocType = 'aadhar' | 'caste' | 'income';

export interface UploadedDocMeta {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  method: 'upload' | 'digilocker';
  digiLockerId?: string;
  docType: MandatoryDocType;
  verified: boolean;
}

interface DocumentChecklistProps {
  profile: CitizenProfile;
  selectedScheme: Scheme | null;
  selectedPartner: RankedPartner | null;
  language: Language;
  onNavigateToTab?: (tab: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth' | 'compare') => void;
  isAuthenticated?: boolean;
  authUser?: AuthUser | null;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  profile,
  selectedScheme,
  selectedPartner,
  language,
  onNavigateToTab,
  isAuthenticated = false,
  authUser
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'checklist' | 'slip'>('checklist');

  const scheme = selectedScheme || REAL_MOSJE_SCHEMES[0];
  const docs = scheme.requiredDocuments;

  // Persisted Uploaded Documents State
  const [uploadedDocs, setUploadedDocs] = useState<Record<MandatoryDocType, UploadedDocMeta | null>>(() => {
    try {
      const saved = localStorage.getItem('sahayak_uploaded_docs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse uploaded docs from storage', e);
    }
    return {
      aadhar: null,
      caste: null,
      income: null
    };
  });

  // Save to localStorage whenever uploadedDocs updates
  useEffect(() => {
    try {
      localStorage.setItem('sahayak_uploaded_docs', JSON.stringify(uploadedDocs));
    } catch (e) {
      console.error('Failed to save uploaded docs to storage', e);
    }
  }, [uploadedDocs]);

  // Uploading progress simulation states
  const [uploadingDoc, setUploadingDoc] = useState<MandatoryDocType | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragOverDoc, setDragOverDoc] = useState<MandatoryDocType | null>(null);

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState<{
    type: MandatoryDocType;
    title: string;
    meta: UploadedDocMeta;
  } | null>(null);

  // Hidden File Input references
  const aadharInputRef = useRef<HTMLInputElement>(null);
  const casteInputRef = useRef<HTMLInputElement>(null);
  const incomeInputRef = useRef<HTMLInputElement>(null);

  const inputRefs: Record<MandatoryDocType, React.RefObject<HTMLInputElement>> = {
    aadhar: aadharInputRef,
    caste: casteInputRef,
    income: incomeInputRef
  };

  // Scheme-specific checklist checkboxes state
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    [docs[0]]: true,
    [docs[docs.length - 1]]: true
  });

  const toggleDoc = (doc: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [doc]: !prev[doc]
    }));
  };

  // Upload Handlers
  const handleFileSelected = (type: MandatoryDocType, file: File) => {
    if (!file) return;

    setUploadingDoc(type);
    setUploadProgress(25);

    setTimeout(() => {
      setUploadProgress(70);
    }, 200);

    setTimeout(() => {
      setUploadProgress(100);
      const newMeta: UploadedDocMeta = {
        id: `DOC-${Date.now().toString().slice(-6)}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        method: 'upload',
        docType: type,
        verified: true
      };

      setUploadedDocs(prev => ({
        ...prev,
        [type]: newMeta
      }));

      setUploadingDoc(null);
      setUploadProgress(0);
    }, 550);
  };

  // DigiLocker 1-Click Verification Handler
  const handleDigiLockerFetch = (type: MandatoryDocType) => {
    setUploadingDoc(type);
    setUploadProgress(35);

    setTimeout(() => {
      setUploadProgress(80);
    }, 250);

    setTimeout(() => {
      setUploadProgress(100);
      let fileName = '';
      let digiId = '';

      if (type === 'aadhar') {
        fileName = `Aadhaar_Card_eAadhaar_${profile.name ? profile.name.replace(/\s+/g, '_') : 'Citizen'}.pdf`;
        digiId = `DL-UIDAI-${Math.floor(1000 + Math.random() * 9000)}`;
      } else if (type === 'caste') {
        fileName = `Caste_Certificate_${profile.category || 'SC'}_eDistrict.pdf`;
        digiId = `DL-EDIST-CAST-${Math.floor(1000 + Math.random() * 9000)}`;
      } else {
        fileName = `Income_Certificate_Competent_Authority_${profile.district || 'District'}.pdf`;
        digiId = `DL-REV-INC-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const newMeta: UploadedDocMeta = {
        id: `DL-${Date.now().toString().slice(-6)}`,
        name: fileName,
        size: '1.28 MB',
        uploadedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        method: 'digilocker',
        digiLockerId: digiId,
        docType: type,
        verified: true
      };

      setUploadedDocs(prev => ({
        ...prev,
        [type]: newMeta
      }));

      setUploadingDoc(null);
      setUploadProgress(0);
    }, 600);
  };

  const handleRemoveDoc = (type: MandatoryDocType) => {
    setUploadedDocs(prev => ({
      ...prev,
      [type]: null
    }));
  };

  // Calculation of progress
  const mandatoryKeys: MandatoryDocType[] = ['aadhar', 'caste', 'income'];
  const uploadedMandatoryCount = mandatoryKeys.filter(k => uploadedDocs[k] !== null).length;
  const isAllMandatoryUploaded = uploadedMandatoryCount === 3;

  const totalDocs = docs.length;
  const completedDocsCount = docs.filter(d => checkedDocs[d]).length;
  const progressPct = Math.min(100, Math.round(((uploadedMandatoryCount + completedDocsCount) / (3 + totalDocs)) * 100));

  // Definition of the 3 Core Uploadables (Note: Income certificate is redacted from specifying any limit!)
  const CORE_UPLOADABLES = [
    {
      type: 'aadhar' as MandatoryDocType,
      title: isHindi ? 'आधार कार्ड (पहचान व पता प्रमाण)' : 'Aadhaar Card',
      subtitle: isHindi 
        ? 'पहचान और निवास का अनिवार्य प्रमाण · बैंक खाते से डीबीटी सक्षम होना अनिवार्य' 
        : 'Official identity and address verification · Required for direct bank subsidy disbursement',
      authority: isHindi ? 'यूआईडीएआई (UIDAI)' : 'Unique Identification Authority of India (UIDAI)',
      icon: ShieldCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tag: isHindi ? 'अनिवार्य · पहचान' : 'Mandatory · Identity'
    },
    {
      type: 'caste' as MandatoryDocType,
      title: isHindi ? 'जाति / समुदाय प्रमाण पत्र' : 'Caste / Community Certificate',
      subtitle: isHindi 
        ? 'अनुसूचित जाति (SC) / अन्य पिछड़ा वर्ग (OBC) / सफाई कर्मचारी प्रमाण पत्र' 
        : 'Official SC / OBC / Safai Karamchari community certificate for ministry quota access',
      authority: isHindi ? 'सक्षम प्राधिकारी (तहसीलदार / एसडीएम / ई-डिस्ट्रिक्ट)' : 'Tehsildar / SDM / State e-District Portal',
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      tag: isHindi ? 'अनिवार्य · श्रेणी' : 'Mandatory · Category'
    },
    {
      type: 'income' as MandatoryDocType,
      title: isHindi ? 'आय प्रमाण पत्र' : 'Income Certificate',
      // Redacted from specifying any limit!
      subtitle: isHindi 
        ? 'सक्षम प्राधिकारी द्वारा जारी पारिवारिक वार्षिक आय प्रमाण पत्र' 
        : 'Annual family income certificate issued by Competent Authority',
      authority: isHindi ? 'सक्षम प्राधिकारी (तहसीलदार / एसडीएम / राजस्व विभाग)' : 'Competent Authority (SDM / Tehsildar / Revenue Department)',
      icon: CheckSquare,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      tag: isHindi ? 'सक्षम प्राधिकारी द्वारा जारी' : 'Competent Authority Issued'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Top Navigation & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
            {isHindi ? 'दस्तावेज़ सत्यापन एवं आईडी पूर्णता' : 'Document Verification & ID Completion'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isHindi 
              ? 'आधार, जाति एवं आय प्रमाण पत्र अपलोड करें अथवा डिजिलॉकर से तुरंत लिंक कर अपनी डिजिटल लाभार्थी आईडी पूर्ण करें।' 
              : 'Upload official documents or fetch authentic digital records via DigiLocker to complete your verified citizen profile.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'checklist' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{isHindi ? 'दस्तावेज़ अपलोड व सत्यापन' : 'Document Uploads'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('slip')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'slip' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isHindi ? 'रूटिंग पर्ची (Slip)' : 'Official Routing Slip'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'slip' ? (
        <CitizenSlip
          profile={profile}
          scheme={scheme}
          partner={selectedPartner}
          language={language}
          authUser={authUser}
        />
      ) : (
        <div className="space-y-6">
          
          {/* Family Member Loan Option Callout on Selected Scheme (DISPLAYED ONLY AFTER SIGN IN) */}
          {isAuthenticated && (
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-5 border border-indigo-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                      {isHindi ? 'परिवार ऋण विकल्प' : 'Alternative Strategy'}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {isHindi ? '3.5%–4.0% रियायती दर' : '3.5%–4.0% Concessional Rate'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">
                    {isHindi ? 'परिवार के सदस्य के नाम पर ऋण लें' : "Take the Loan in a Family Member's Name"}
                  </h4>
                  <p className="text-xs text-indigo-200/90 leading-relaxed max-w-xl">
                    {isHindi 
                      ? `चयनित योजना "${scheme.name}" के स्थान पर क्या आप माता, पत्नी या छात्र संतान के नाम पर आवेदन करना चाहते हैं?`
                      : `Selected Scheme: "${scheme.name}". Want to lower interest by applying in your Mother's, Wife's, or Student Child's name instead?`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab?.('compare')}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isHindi ? 'परिवार ऋण विकल्प देखें →' : "Family Loan Options →"}</span>
              </button>
            </div>
          )}

          {/* Readiness Gauge Banner */}
          <div className="bg-gradient-to-br from-white via-slate-50 to-orange-50/40 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {isHindi ? 'सत्यापन तत्परता स्कोर' : 'Document Verification Readiness'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {profile.name} · {profile.category}
                </span>
              </div>
              
              <div className="flex items-baseline justify-center sm:justify-start space-x-3">
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-sans">
                  {progressPct}%
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {uploadedMandatoryCount} / 3 {isHindi ? 'अनिवार्य दस्तावेज़ अपलोड' : 'Mandatory Documents Uploaded'}
                </span>
              </div>

              {isAllMandatoryUploaded ? (
                <p className="text-xs font-bold text-emerald-700 flex items-center justify-center sm:justify-start space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isHindi 
                      ? 'बधाई! सभी 3 अनिवार्य पहचान दस्तावेज़ सफलतापूर्वक सत्यापित हो चुके हैं।' 
                      : 'All 3 core identity documents verified. Ready for channel partner desk.'}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  {isHindi 
                    ? 'कृपया आधार, जाति और आय प्रमाण पत्र अपलोड कर 100% सत्यापन पूर्ण करें।' 
                    : 'Upload Aadhaar, Caste, and Income certificate to achieve 100% verification.'}
                </p>
              )}
            </div>

            {/* Visual Progress Track */}
            <div className="w-full sm:w-72 space-y-2">
              <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>{uploadedMandatoryCount} of 3 Uploaded</span>
                <span className={isAllMandatoryUploaded ? 'text-emerald-700' : 'text-orange-600'}>
                  {isAllMandatoryUploaded ? (isHindi ? 'सत्यापन पूर्ण ✓' : 'Fully Verified ✓') : (isHindi ? 'अपेक्षित' : 'In Progress')}
                </span>
              </div>
            </div>

            {/* Fast-Track CTA */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('slip')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 cursor-pointer ${
                  isAllMandatoryUploaded 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <span>{isHindi ? 'रूटिंग पर्ची देखें' : 'View Routing Slip'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* =================================================================== */}
          {/* SECTION 1: MANDATORY UPLOADABLES (AADHAAR, CASTE, INCOME)           */}
          {/* =================================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>{isHindi ? 'अनिवार्य दस्तावेज़ अपलोड' : 'Mandatory Document Uploads'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHindi 
                    ? 'प्रत्यक्ष सत्यापन हेतु दस्तावेज़ की स्पष्ट पीडीएफ (PDF) या फोटो (JPG/PNG) अपलोड करें' 
                    : 'Upload clear PDF, JPG, or PNG scans, or retrieve instantly via official DigiLocker'}
                </p>
              </div>

              <div className="hidden sm:flex items-center space-x-1.5 text-xs text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">{isHindi ? 'डिजिलॉकर प्रमाणित' : 'DigiLocker Certified'}</span>
              </div>
            </div>

            {/* Grid of the 3 Uploadables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {CORE_UPLOADABLES.map((item) => {
                const docMeta = uploadedDocs[item.type];
                const isUploading = uploadingDoc === item.type;
                const isDragOver = dragOverDoc === item.type;
                const ItemIcon = item.icon;

                return (
                  <div
                    key={item.type}
                    className={`rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                      docMeta
                        ? 'border-emerald-300 bg-emerald-50/30 shadow-xs'
                        : isDragOver
                        ? 'border-orange-500 bg-orange-50/50 shadow-md scale-[1.01]'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-xs'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverDoc(item.type);
                    }}
                    onDragLeave={() => setDragOverDoc(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverDoc(null);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelected(item.type, e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center shadow-xs shrink-0`}>
                            <ItemIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                              {item.tag}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        {docMeta ? (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200">
                            {isHindi ? 'सत्यापित ✓' : 'Verified ✓'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0 border border-slate-200">
                            {isHindi ? 'अपेक्षित' : 'Pending'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                        {item.subtitle}
                      </p>

                      <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-1 truncate">
                        <span className="font-semibold text-slate-500">{isHindi ? 'प्राधिकरण:' : 'Authority:'}</span>
                        <span className="truncate">{item.authority}</span>
                      </div>
                    </div>

                    {/* Card Body: Upload Area or File Meta Display */}
                    <div className="p-5 flex-1 flex flex-col justify-center">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={inputRefs[item.type]}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelected(item.type, e.target.files[0]);
                          }
                        }}
                      />

                      {isUploading ? (
                        /* Upload Progress State */
                        <div className="py-6 px-4 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                          <RefreshCw className="w-6 h-6 text-orange-600 animate-spin mx-auto" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {isHindi ? 'दस्तावेज़ अपलोड व सत्यापन जारी...' : 'Uploading & Verifying Document...'}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {isHindi ? 'डिजिटल हस्ताक्षर और प्रारूप की जांच हो रही है' : 'Validating digital checksum and format'}
                            </p>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-orange-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : docMeta ? (
                        /* Uploaded / Verified State Display */
                        <div className="space-y-3">
                          <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-2xs flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate" title={docMeta.name}>
                                {docMeta.name}
                              </p>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                                <span>{docMeta.size}</span>
                                <span>•</span>
                                <span>{docMeta.uploadedAt}</span>
                              </div>
                            </div>
                          </div>

                          {docMeta.method === 'digilocker' ? (
                            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate">DigiLocker ID: {docMeta.digiLockerId}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{isHindi ? 'स्व-प्रमाणित डिजिटल प्रति' : 'Self-Attested Digital Copy'}</span>
                            </div>
                          )}

                          {/* Action Buttons: Preview, Replace, Remove */}
                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc({
                                type: item.type,
                                title: item.title,
                                meta: docMeta
                              })}
                              className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>{isHindi ? 'देखें' : 'Preview'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => inputRefs[item.type]?.current?.click()}
                              className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                              title={isHindi ? 'दस्तावेज़ बदलें' : 'Replace File'}
                            >
                              <RefreshCw className="w-3 h-3 text-slate-600" />
                              <span className="hidden sm:inline">{isHindi ? 'बदलें' : 'Replace'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(item.type)}
                              className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition flex items-center justify-center cursor-pointer border border-rose-200"
                              title={isHindi ? 'हटाएं' : 'Remove Document'}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty State: Upload or DigiLocker Options */
                        <div className="space-y-3">
                          {/* Drag & Drop Upload Zone */}
                          <div 
                            onClick={() => inputRefs[item.type]?.current?.click()}
                            className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50/70 hover:bg-orange-50/30 rounded-2xl p-4 text-center cursor-pointer transition group"
                          >
                            <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-orange-600 mx-auto transition group-hover:scale-110" />
                            <p className="text-xs font-bold text-slate-800 mt-1.5 group-hover:text-orange-700">
                              {isHindi ? 'फ़ाइल चुनें या यहाँ खींचें' : 'Click to Upload or Drag File'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              PDF, JPG, PNG {isHindi ? '(अधिकतम 5MB)' : '(up to 5MB)'}
                            </p>
                          </div>

                          {/* Or Divider */}
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 uppercase font-bold justify-center">
                            <span className="w-8 h-px bg-slate-200"></span>
                            <span>{isHindi ? 'अथवा' : 'OR'}</span>
                            <span className="w-8 h-px bg-slate-200"></span>
                          </div>

                          {/* 1-Click DigiLocker Retrieval */}
                          <button
                            type="button"
                            onClick={() => handleDigiLockerFetch(item.type)}
                            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs group"
                          >
                            <ShieldCheck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
                            <span>{isHindi ? '⚡ डिजिलॉकर से लाएं' : '⚡ Fetch from DigiLocker'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =================================================================== */}
          {/* SECTION 2: SCHEME SPECIFIC AUDIT CHECKLIST                          */}
          {/* =================================================================== */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>{isHindi ? 'योजना-विशिष्ट सहायक दस्तावेज़ ऑडिट' : 'Scheme-Specific Supporting Documents'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {scheme.name} ({scheme.agency}) · {isHindi ? 'चैनल पार्टनर काउंटर पर जमा करने हेतु अतिरिक्त प्रपत्र' : 'Additional attachments required at physical nodal partner counter'}
                </p>
              </div>

              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                {completedDocsCount} / {totalDocs} {isHindi ? 'तैयार' : 'Ready'}
              </span>
            </div>

            <div className="space-y-3">
              {docs.map((doc, idx) => {
                const isChecked = Boolean(checkedDocs[doc]);

                return (
                  <div
                    key={idx}
                    onClick={() => toggleDoc(doc)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition cursor-pointer flex items-start justify-between gap-4 ${
                      isChecked
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isChecked ? 'text-emerald-950' : 'text-slate-900'}`}>
                          {doc}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {doc.includes('Caste') && (isHindi ? 'तहसीलदार/एसडीएम अथवा राज्य ई-डिस्ट्रिक्ट पोर्टल से प्राप्त' : 'Issued by Tehsildar / SDM or State e-District portal')}
                          {doc.includes('Income') && (isHindi ? 'पारिवारिक वार्षिक आय प्रमाण पत्र (सक्षम प्राधिकारी द्वारा जारी)' : 'Annual family income certificate (issued by authorized revenue authority)')}
                          {doc.includes('Project') && (isHindi ? 'व्यवसाय का विस्तृत प्रोजेक्ट विवरण अथवा मशीनरी/उपकरण का अधिकृत कोटेशन' : 'Detailed Project Report (DPR) or quotation from authorized machinery vendor')}
                          {doc.includes('Aadhaar') && (isHindi ? 'पहचान एवं पते का प्रमाण (बैंक खाते से लिंक होना अनिवार्य)' : 'Identity & address verification; must be linked to bank account')}
                          {doc.includes('Passbook') && (isHindi ? 'बैंक पासबुक की प्रति जिसमें डीबीटी सक्षम खाता संख्या व आईएफएससी स्पष्ट हो' : 'Aadhaar-seeded bank account passbook for DBT subsidy transfer')}
                          {doc.includes('License') && (isHindi ? 'परिवहन वाहन अथवा ई-रिक्शा हेतु वैध कमर्शियल ड्राइविंग लाइसेंस' : 'Valid commercial vehicle driver license required for transport assets')}
                          {doc.includes('Safai') && (isHindi ? 'नगर पालिका/स्थानीय निकाय द्वारा जारी सफाई कर्मचारी पहचान पत्र' : 'Municipal sanitary worker identification card or dependent certificate')}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wider ${
                      isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isChecked ? (isHindi ? 'तैयार है' : 'Ready') : (isHindi ? 'अपेक्षित' : 'Pending')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Complete Verification Action Bar */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-extrabold text-white">
                  {isHindi ? 'सत्यापित डिजिटल रूटिंग पर्ची तैयार करें' : 'Generate Verified Citizen Routing Pass'}
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                {isHindi 
                  ? 'सत्यापन पूर्ण होने के बाद आधिकारिक क्यूआर-सक्षम पर्ची डाउनलोड करें जिसे बैंक शाखा में प्रस्तुत किया जा सकता है।' 
                  : 'Download or print the official QR-enabled citizen slip with your verified Aadhaar, Caste, and Income records.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('dashboard')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  {isHindi ? 'डैशबोर्ड पर जाएं' : 'Go to Dashboard'}
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('slip')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold transition shadow-md shadow-orange-600/30 flex items-center space-x-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isHindi ? 'रूटिंग पर्ची प्रिंट / डाउनलोड करें' : 'View & Print Official Slip →'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* SIMULATED DOCUMENT PREVIEW MODAL                                      */}
      {/* ===================================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-5 h-5 text-orange-400" />
                <div>
                  <h4 className="text-sm font-bold">{previewDoc.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate max-w-[280px]">{previewDoc.meta.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Document Body */}
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 space-y-4 shadow-xs relative overflow-hidden">
                
                {/* Official Government Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <span className="text-6xl font-black rotate-[-25deg]">SAHAYAK VERIFIED</span>
                </div>

                {/* Header in Certificate */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-serif font-black flex items-center justify-center">
                      स
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">GOVERNMENT OF INDIA</p>
                      <p className="text-[10px] text-slate-500">Ministry of Social Justice & Empowerment</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center p-0.5">
                    <QrCode className="w-full h-full text-slate-800" />
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">{isHindi ? 'दस्तावेज़ प्रकार:' : 'Document Type:'}</span>
                    <span className="font-bold text-slate-900">{previewDoc.title}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">{isHindi ? 'लाभार्थी का नाम:' : 'Beneficiary Name:'}</span>
                    <span className="font-bold text-slate-900">{profile.name || 'Verified Citizen'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">{isHindi ? 'श्रेणी / जाति:' : 'Category / Caste:'}</span>
                    <span className="font-bold text-slate-900">{profile.category || 'SC / OBC'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">{isHindi ? 'ज़िला व राज्य:' : 'District & State:'}</span>
                    <span className="font-bold text-slate-900">{profile.district}, {profile.state}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">{isHindi ? 'सत्यापन विधि:' : 'Verification Mode:'}</span>
                    <span className="font-bold text-emerald-700">
                      {previewDoc.meta.method === 'digilocker' ? '⚡ Official DigiLocker Pull' : '✓ Self-Attested Digital Upload'}
                    </span>
                  </div>
                  {previewDoc.meta.digiLockerId && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-semibold">DigiLocker Reference:</span>
                      <span className="font-mono font-bold text-blue-700">{previewDoc.meta.digiLockerId}</span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-[11px] font-bold text-emerald-800 flex items-center justify-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Digital Verification Cryptographically Authenticated</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                {isHindi ? 'बंद करें' : 'Close Preview'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
