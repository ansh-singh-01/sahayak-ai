import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Building2, 
  User, 
  Calendar, 
  FileText, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  ChevronRight, 
  HelpCircle,
  FileBadge,
  History,
  Lock,
  ArrowRight,
  Send
} from 'lucide-react';
import { 
  VerifiableDocument, 
  DocumentStatus, 
  DocumentType, 
  AutoFlagCode, 
  VerificationAuditEntry 
} from '../../types/documentVerification';
import { 
  MOCK_VERIFIABLE_DOCUMENTS, 
  INITIAL_VERIFICATION_TELEMETRY 
} from '../../data/documentVerificationData';
import { Language } from '../../services/i18nService';

interface DocumentVerificationPanelProps {
  language: Language;
}

export const DocumentVerificationPanel: React.FC<DocumentVerificationPanelProps> = ({ language }) => {
  const isHindi = language === 'hi';

  // Live in-memory documents and telemetry state
  const [documents, setDocuments] = useState<VerifiableDocument[]>(MOCK_VERIFIABLE_DOCUMENTS);
  const [telemetry, setTelemetry] = useState(INITIAL_VERIFICATION_TELEMETRY);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'ALL'>('ALL');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | 'ALL'>('ALL');
  const [selectedFlagFilter, setSelectedFlagFilter] = useState<AutoFlagCode | 'ALL'>('ALL');
  const [selectedCorporation, setSelectedCorporation] = useState<'ALL' | 'NSFDC' | 'NBCFDC' | 'NSKFDC'>('ALL');

  // Inspection Drawer / Modal State
  const [inspectedDoc, setInspectedDoc] = useState<VerifiableDocument | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [customRejectionReason, setCustomRejectionReason] = useState<string>('Document is stale (>12 months) and requires re-issuance.');
  const [officerNote, setOfficerNote] = useState<string>('');

  // Filter logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.beneficiaryName.toLowerCase().includes(q);
        const matchesAppId = doc.applicationId.toLowerCase().includes(q);
        const matchesDocId = doc.id.toLowerCase().includes(q);
        const matchesCertNum = doc.extractedFields?.certificateNumber?.toLowerCase().includes(q) || false;
        const matchesScheme = doc.schemeName.toLowerCase().includes(q);
        if (!matchesName && !matchesAppId && !matchesDocId && !matchesCertNum && !matchesScheme) {
          return false;
        }
      }
      // Status filter
      if (selectedStatus !== 'ALL' && doc.status !== selectedStatus) {
        return false;
      }
      // Doc type filter
      if (selectedDocType !== 'ALL' && doc.documentType !== selectedDocType) {
        return false;
      }
      // Flag filter
      if (selectedFlagFilter !== 'ALL' && !doc.flags.includes(selectedFlagFilter)) {
        return false;
      }
      // Corporation filter
      if (selectedCorporation !== 'ALL' && doc.corporation !== selectedCorporation) {
        return false;
      }
      return true;
    });
  }, [documents, searchQuery, selectedStatus, selectedDocType, selectedFlagFilter, selectedCorporation]);

  // Executive Actions
  const handleApproveDocument = (docId: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === docId) {
          const auditEntry: VerificationAuditEntry = {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            fromStatus: doc.status,
            toStatus: 'VERIFIED',
            action: 'Ministry Executive Approval & Digital Sign-off',
            reviewedBy: 'Joint Secretary (Credit), MoSJE Central Command',
            reviewerRole: 'MINISTRY_ADMIN',
            reason: officerNote || 'Executive sign-off confirmed after statutory review.'
          };
          const updated: VerifiableDocument = {
            ...doc,
            status: 'VERIFIED',
            flags: [],
            flagReasonDetails: [],
            reviewedBy: 'Joint Secretary (Credit), MoSJE',
            reviewedAt: new Date().toLocaleString(),
            auditTrail: [auditEntry, ...doc.auditTrail]
          };
          setInspectedDoc(updated);
          return updated;
        }
        return doc;
      })
    );
    setTelemetry((prev) => ({
      ...prev,
      verifiedCount: prev.verifiedCount + 1,
      pendingReviewCount: Math.max(0, prev.pendingReviewCount - 1),
      autoFlaggedTotalCount: Math.max(0, prev.autoFlaggedTotalCount - 1)
    }));
    setActionSuccessMsg('Document successfully approved and marked VERIFIED. Audit trail updated.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRejectDocument = (docId: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === docId) {
          const auditEntry: VerificationAuditEntry = {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            fromStatus: doc.status,
            toStatus: 'REJECTED',
            action: 'Ministry Executive Rejection with Statutory Notice',
            reviewedBy: 'Joint Secretary (Credit), MoSJE Central Command',
            reviewerRole: 'MINISTRY_ADMIN',
            reason: customRejectionReason
          };
          const updated: VerifiableDocument = {
            ...doc,
            status: 'REJECTED',
            rejectionReason: customRejectionReason,
            reviewedBy: 'Joint Secretary (Credit), MoSJE',
            reviewedAt: new Date().toLocaleString(),
            auditTrail: [auditEntry, ...doc.auditTrail]
          };
          setInspectedDoc(updated);
          return updated;
        }
        return doc;
      })
    );
    setTelemetry((prev) => ({
      ...prev,
      rejectedCount: prev.rejectedCount + 1,
      pendingReviewCount: Math.max(0, prev.pendingReviewCount - 1)
    }));
    setActionSuccessMsg('Document rejected. Beneficiary resubmission ticket issued with statutory reasoning.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleDispatchFieldVerification = (docId: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === docId) {
          const auditEntry: VerificationAuditEntry = {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            fromStatus: doc.status,
            toStatus: 'PENDING_PARTNER_REVIEW',
            action: 'Dispatched for Doorstep Physical Inspection to District SCA',
            reviewedBy: 'MoSJE Central Compliance Sentinel',
            reviewerRole: 'MINISTRY_ADMIN',
            reason: `Field audit dispatched to ${doc.beneficiaryDistrict} SCA Nodal Officer.`
          };
          const updated: VerifiableDocument = {
            ...doc,
            status: 'PENDING_PARTNER_REVIEW',
            auditTrail: [auditEntry, ...doc.auditTrail]
          };
          setInspectedDoc(updated);
          return updated;
        }
        return doc;
      })
    );
    setActionSuccessMsg(`Field verification order dispatched to ${inspectedDoc?.beneficiaryDistrict} District Nodal Officer.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. THREE-LAYER ARCHITECTURE EXECUTIVE BANNER (PRD §4)                      */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                PRD Add-On: Statutory Document Verification Pipeline
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sans mt-1 text-white">
              {isHindi ? 'दस्तावेज़ सत्यापन एवं धोखाधड़ी रोकथाम कमान' : 'Document Verification & Fraud Sentinel'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Three-layer auditable verification pipeline enforcing strict statutory guidelines across NSFDC, NBCFDC, and NSKFDC social welfare credit disbursements.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/80 p-2 px-3 rounded-2xl border border-slate-700 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>DPDP Act 2023 Enforced · 90-Day Ephemeral Retention</span>
          </div>
        </div>

        {/* The Three Layers Interactive Visual Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Layer 1 */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-emerald-500/30 relative overflow-hidden group hover:border-emerald-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Layer 1 · Source Verified
              </span>
              <span className="text-xs font-bold text-emerald-400">74.2% Share</span>
            </div>
            <h4 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DigiLocker Gateway</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Direct OAuth pull with digital signature from issuing authority. Zero OCR needed. Instant verification.
            </p>
          </div>

          {/* Layer 2 */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-amber-500/30 relative overflow-hidden group hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Layer 2 · Deterministic Sentinel
              </span>
              <span className="text-xs font-bold text-amber-400">9.8% Flagged</span>
            </div>
            <h4 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>OCR + 6 Statutory Rules</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Automatic cross-checks for name/DOB mismatch, certificate staleness, duplicate recycling & unauthorized issuers.
            </p>
          </div>

          {/* Layer 3 */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-blue-500/30 relative overflow-hidden group hover:border-blue-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Layer 3 · Authoritative Sign-Off
              </span>
              <span className="text-xs font-bold text-blue-400">1.8d Avg TAT</span>
            </div>
            <h4 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Partner & Ministry Review</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              District SCA nodal officers & Ministry Executive live queues for authoritative sign-off or statutory rejection.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TELEMETRY KPI METRICS (PRD §2, §10)                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {isHindi ? 'कुल संसाधित दस्तावेज़' : 'Total Ingested'}
          </span>
          <div className="text-2xl font-black text-slate-900 font-sans mt-1">
            {telemetry.totalDocumentsProcessed.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">
            ↑ +22.8% this quarter
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {isHindi ? 'डिजीलॉकर स्रोत सत्यापन' : 'DigiLocker Pass'}
          </span>
          <div className="text-2xl font-black text-emerald-600 font-sans mt-1">
            {telemetry.digiLockerPassRatePercent}%
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {telemetry.digiLockerTotalCount.toLocaleString('en-IN')} instant passes
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {isHindi ? 'स्वचालित फ़्लैग दर' : 'Auto-Flag Rate'}
          </span>
          <div className="text-2xl font-black text-amber-600 font-sans mt-1">
            {telemetry.autoFlaggedRatePercent}%
          </div>
          <span className="text-[10px] text-amber-700 font-bold block mt-1">
            {telemetry.autoFlaggedTotalCount.toLocaleString('en-IN')} anomalies caught
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {isHindi ? 'समीक्षा हेतु लंबित' : 'Pending Review'}
          </span>
          <div className="text-2xl font-black text-blue-600 font-sans mt-1">
            {telemetry.pendingReviewCount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Layer 3 Partner Queues</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {isHindi ? 'सत्यापित स्वीकृत' : 'Total Verified'}
          </span>
          <div className="text-2xl font-black text-emerald-700 font-sans mt-1">
            {telemetry.verifiedCount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Disbursement Eligible</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {isHindi ? 'सत्यापन समय (TAT)' : 'Verification TAT'}
          </span>
          <div className="text-2xl font-black text-purple-600 font-sans mt-1">
            {telemetry.averageTatDays} <span className="text-xs font-normal">Days</span>
          </div>
          <span className="text-[10px] text-purple-700 font-bold block mt-1">Mandate: &lt; 7 Days</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. DETERMINISTIC AUTO-FLAG SENTINEL CARDS (PRD §6)                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{isHindi ? 'नियम-आधारित स्वचालित फ़्लैग ट्रिगर्स' : 'Deterministic Fraud & Anomaly Sentinel (PRD §6)'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any flag trigger to filter the live queue below and inspect affected cases.
            </p>
          </div>
          {selectedFlagFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedFlagFilter('ALL')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
            >
              Clear Flag Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {telemetry.topFlagTriggers.map((trigger) => {
            const isSelected = selectedFlagFilter === trigger.flag;
            return (
              <button
                key={trigger.flag}
                onClick={() => setSelectedFlagFilter(isSelected ? 'ALL' : trigger.flag)}
                className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/70 text-orange-950 ring-2 ring-orange-400/30 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold font-mono text-slate-900">
                      {trigger.count}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  </div>
                  <h5 className="font-bold text-xs mt-1 text-slate-800 line-clamp-1">
                    {trigger.label}
                  </h5>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                  {trigger.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LIVE VERIFICATION QUEUE & FILTERS                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Header & Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileBadge className="w-4 h-4 text-orange-600" />
                <span>{isHindi ? 'लाइव दस्तावेज़ सत्यापन कतार' : 'Live Document Verification Queue'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredDocuments.length} of {documents.length} pipeline documents across partner banking desks.
              </p>
            </div>

            {/* Corporation filter pill */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
              {(['ALL', 'NSFDC', 'NBCFDC', 'NSKFDC'] as const).map((corp) => (
                <button
                  key={corp}
                  onClick={() => setSelectedCorporation(corp)}
                  className={`px-3 py-1 rounded-xl font-bold transition text-xs ${
                    selectedCorporation === corp
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {corp === 'ALL' ? 'All Corps' : corp}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar & Multi-Select Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search beneficiary, certificate #, or app ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="AUTO_FLAGGED">⚠️ Auto-Flagged by Rule Engine</option>
                <option value="PENDING_PARTNER_REVIEW">⏳ Pending Partner Review</option>
                <option value="VERIFIED">✓ Verified (DigiLocker / Partner)</option>
                <option value="REJECTED">✕ Rejected (Requires Resubmission)</option>
                <option value="UPLOADED">📥 Uploaded (Awaiting Processing)</option>
              </select>
            </div>

            {/* Document Type Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as any)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              >
                <option value="ALL">All Document Types</option>
                <option value="INCOME_CERTIFICATE">Income Certificate</option>
                <option value="CASTE_CERTIFICATE">Caste Certificate</option>
                <option value="AADHAAR_CARD">Aadhaar Card (UIDAI)</option>
                <option value="DISABILITY_CERTIFICATE">Disability Certificate</option>
              </select>
            </div>

          </div>
        </div>

        {/* Action success alert banner */}
        {actionSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-900 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Documents Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Beneficiary & App ID</th>
                <th className="py-3 px-4">Document Details</th>
                <th className="py-3 px-4">Source Layer</th>
                <th className="py-3 px-4">Status & Flags</th>
                <th className="py-3 px-4">Freshness / Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No documents match the active filter combination.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const isDigiLocker = doc.verificationSource === 'DIGILOCKER';

                  return (
                    <tr 
                      key={doc.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setInspectedDoc(doc)}
                    >
                      {/* Col 1: Beneficiary */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{doc.beneficiaryName}</span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {doc.beneficiaryCategory}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {doc.applicationId} · {doc.beneficiaryDistrict}
                        </p>
                      </td>

                      {/* Col 2: Document */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {doc.documentTitle}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          {doc.extractedFields?.certificateNumber || 'Pending OCR extract'}
                        </p>
                      </td>

                      {/* Col 3: Source Layer */}
                      <td className="py-3.5 px-4">
                        {isDigiLocker ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>DigiLocker (L1)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>OCR + Rules (L2)</span>
                          </span>
                        )}
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-bold">
                          {doc.corporation}
                        </span>
                      </td>

                      {/* Col 4: Status & Flags */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          {doc.status === 'VERIFIED' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}
                          {doc.status === 'AUTO_FLAGGED' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Auto-Flagged ({doc.flags.length})</span>
                            </span>
                          )}
                          {doc.status === 'PENDING_PARTNER_REVIEW' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>Pending Review</span>
                            </span>
                          )}
                          {doc.status === 'REJECTED' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </div>

                        {/* Display flag tags */}
                        {doc.flags.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1 flex-wrap gap-1">
                            {doc.flags.map((fl) => (
                              <span key={fl} className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                {fl.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Col 5: Freshness & Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <span>{doc.extractedFields?.issueDate || doc.submittedAt}</span>
                        <span className="block text-[10px] text-slate-400">
                          {doc.retentionExpiryDate.split('(')[0]}
                        </span>
                      </td>

                      {/* Col 6: Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedDoc(doc);
                          }}
                          className="px-3 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold border border-orange-200 transition inline-flex items-center space-x-1 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. SIDE-BY-SIDE EXECUTIVE INSPECTION MODAL (PRD §4, §6, §9)               */}
      {/* ========================================================================= */}
      {inspectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    {inspectedDoc.documentTitle} · Inspection Panel
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {inspectedDoc.id} · App: {inspectedDoc.applicationId} · {inspectedDoc.corporation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Side-by-Side View */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Simulated Government Certificate Preview (PRD §9) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Document Visual Artifact
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    High-Res Scan
                  </span>
                </div>

                {/* Authenticated Certificate Replica */}
                <div className="bg-amber-50/40 rounded-2xl p-5 border-2 border-dashed border-amber-300 space-y-4 relative shadow-inner">
                  {/* Watermark Emblem */}
                  <div className="text-center border-b border-amber-200 pb-3">
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm mb-1">
                      🏛️
                    </div>
                    <h5 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                      {inspectedDoc.beneficiaryState} Revenue Department
                    </h5>
                    <p className="text-[10px] text-slate-600 font-semibold">
                      Office of the Sub-Divisional Officer / Tehsildar
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-800">
                    <div className="p-2 bg-white/80 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Certificate Number</span>
                      <span className="font-mono font-bold text-slate-900">
                        {inspectedDoc.extractedFields?.certificateNumber || 'MP/REV/2026/099182'}
                      </span>
                    </div>

                    <div className="p-2 bg-white/80 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Issued To</span>
                      <span className="font-bold text-slate-900">
                        {inspectedDoc.extractedFields?.name || inspectedDoc.beneficiaryName}
                      </span>
                    </div>

                    {inspectedDoc.extractedFields?.annualIncome && (
                      <div className="p-2 bg-white/80 rounded-xl border border-amber-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Certified Annual Income</span>
                        <span className="font-bold text-emerald-700">
                          ₹{inspectedDoc.extractedFields.annualIncome.toLocaleString('en-IN')} / year
                        </span>
                      </div>
                    )}

                    {inspectedDoc.extractedFields?.casteCategory && (
                      <div className="p-2 bg-white/80 rounded-xl border border-amber-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Caste / Sub-Caste</span>
                        <span className="font-bold text-blue-800">
                          {inspectedDoc.extractedFields.casteCategory}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-slate-600 pt-1">
                      <span>Date: {inspectedDoc.extractedFields?.issueDate}</span>
                      <span>Auth: {inspectedDoc.extractedFields?.issuingAuthority?.split(',')[0]}</span>
                    </div>
                  </div>

                  {/* Stamp & Seal */}
                  <div className="pt-2 flex items-center justify-between border-t border-amber-200">
                    {inspectedDoc.verificationSource === 'DIGILOCKER' ? (
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>DigiLocker Cryptographic Seal</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-xl bg-slate-200 text-slate-800 text-[10px] font-bold">
                        <span>Official Stamp Verified</span>
                      </div>
                    )}

                    <span className="text-[10px] font-mono text-slate-400">
                      QR: VALIDATED
                    </span>
                  </div>
                </div>

                {/* DPDP Act retention notice */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>DPDP Compliance:</strong> Raw scan scheduled for auto-purge in 88 days post-terminal state.
                  </span>
                </div>
              </div>

              {/* Right Column: Deep Verification Analysis, Rule Trace & Controls */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Layer Badge & Source */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification Source</span>
                    <strong className="text-xs text-slate-900 flex items-center space-x-1.5 mt-0.5">
                      {inspectedDoc.verificationSource === 'DIGILOCKER' ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Layer 1: DigiLocker Direct Issuance (Highest Trust)</span>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-4 h-4 text-blue-600" />
                          <span>Layer 2: OCR Extracted (Confidence: {inspectedDoc.extractedFields?.ocrConfidencePercent}%)</span>
                        </>
                      )}
                    </strong>
                    {inspectedDoc.digitalSignatureRef && (
                      <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                        Ref: {inspectedDoc.digitalSignatureRef}
                      </span>
                    )}
                  </div>

                  <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-xl border ${
                    inspectedDoc.status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : inspectedDoc.status === 'AUTO_FLAGGED'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : inspectedDoc.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-blue-100 text-blue-900 border-blue-300'
                  }`}>
                    {inspectedDoc.status}
                  </span>
                </div>

                {/* Field-by-Field Cross Check Table (Profile vs Document) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Field-by-Field Cross Check (Profile vs Document)
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100/80 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Field</th>
                          <th className="py-2 px-3">Citizen Profile</th>
                          <th className="py-2 px-3">Extracted Scan</th>
                          <th className="py-2 px-3 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        <tr>
                          <td className="py-2 px-3 font-semibold text-slate-600">Full Name</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{inspectedDoc.beneficiaryName}</td>
                          <td className="py-2 px-3 font-mono">{inspectedDoc.extractedFields?.name || '—'}</td>
                          <td className="py-2 px-3 text-right">
                            {inspectedDoc.flags.includes('NAME_MISMATCH') ? (
                              <span className="text-rose-600 font-bold">⚠️ Mismatch</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">✓ Matched</span>
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2 px-3 font-semibold text-slate-600">Date of Birth</td>
                          <td className="py-2 px-3 font-bold text-slate-900">12-05-1988</td>
                          <td className="py-2 px-3 font-mono">{inspectedDoc.extractedFields?.dob || '—'}</td>
                          <td className="py-2 px-3 text-right">
                            {inspectedDoc.flags.includes('DOB_MISMATCH') ? (
                              <span className="text-rose-600 font-bold">⚠️ Mismatch</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">✓ Matched</span>
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2 px-3 font-semibold text-slate-600">Issuing Authority</td>
                          <td className="py-2 px-3 font-bold text-slate-900">Authorized State Desk</td>
                          <td className="py-2 px-3 font-mono truncate max-w-[140px]" title={inspectedDoc.extractedFields?.issuingAuthority}>
                            {inspectedDoc.extractedFields?.issuingAuthority || '—'}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {inspectedDoc.flags.includes('UNRECOGNIZED_ISSUER') ? (
                              <span className="text-rose-600 font-bold">⚠️ Inadmissible</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">✓ Authorized</span>
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2 px-3 font-semibold text-slate-600">Freshness (12 Mo)</td>
                          <td className="py-2 px-3 font-bold text-slate-900">Current Cohort</td>
                          <td className="py-2 px-3 font-mono">{inspectedDoc.extractedFields?.issueDate || '—'}</td>
                          <td className="py-2 px-3 text-right">
                            {inspectedDoc.flags.includes('DOCUMENT_STALE') ? (
                              <span className="text-rose-600 font-bold">⚠️ Expired</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">✓ Fresh</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rule Engine Anomaly Flags Breakdown */}
                {inspectedDoc.flagReasonDetails && inspectedDoc.flagReasonDetails.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Rule Engine Flags Raised ({inspectedDoc.flagReasonDetails.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {inspectedDoc.flagReasonDetails.map((reason, idx) => (
                        <div key={idx} className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium">
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection notice if already rejected */}
                {inspectedDoc.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                    <strong>Rejection Reason on Record:</strong> {inspectedDoc.rejectionReason}
                  </div>
                )}

                {/* Audit Trail Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Statutory Audit Trail ({inspectedDoc.auditTrail.length} events)</span>
                  </h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {inspectedDoc.auditTrail.map((at) => (
                      <div key={at.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{at.action}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{at.timestamp.split('T')[0]}</span>
                        </div>
                        <p className="text-slate-500 text-[10px]">
                          By: {at.reviewedBy} ({at.reviewerRole}) {at.reason && `· ${at.reason}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Executive Action Controls */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Ministry Executive Decision & Sign-off
                  </span>

                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    {/* Approve Button */}
                    <button
                      type="button"
                      onClick={() => handleApproveDocument(inspectedDoc.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Mark Verified</span>
                    </button>

                    {/* Reject Button */}
                    <button
                      type="button"
                      onClick={() => handleRejectDocument(inspectedDoc.id)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject with Statutory Notice</span>
                    </button>

                    {/* Dispatch Field Inspection */}
                    <button
                      type="button"
                      onClick={() => handleDispatchFieldVerification(inspectedDoc.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dispatch Field Audit</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
