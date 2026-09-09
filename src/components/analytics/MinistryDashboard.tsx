import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  PieChart, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowDownRight,
  Sparkles,
  Filter,
  FileCheck2,
  FileBadge,
  Lock,
  Scale
} from 'lucide-react';
import { CHANNEL_PARTNERS_DATABASE } from '../../data/partnersData';
import { Language, TRANSLATIONS } from '../../services/i18nService';
import { DocumentVerificationPanel } from './DocumentVerificationPanel';

interface MinistryDashboardProps {
  language: Language;
}

export const MinistryDashboard: React.FC<MinistryDashboardProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  const [activeSubTab, setActiveSubTab] = useState<'verification' | 'analytics' | 'dpdp'>('verification');
  const [selectedState, setSelectedState] = useState<string>('Madhya Pradesh');

  // Realistic Equity & Inclusion Data for MoSJE (PRD §33)
  const demographicStats = {
    totalRouted: 14280,
    scShare: 58.4, // 58.4% SC
    obcShare: 31.2, // 31.2% OBC
    safaiShare: 10.4, // 10.4% Safai Karamchari & Dependents
    womenEntrepreneurs: 46.8, // 46.8% Women
    divyangjan: 7.2, // 7.2% Differently Abled
    avgProcessingTat: 4.6 // Days
  };

  // Funnel Data
  const funnelSteps = [
    { label: isHindi ? 'नागरिक आगमन (Intake)' : 'Onboarding Started', count: 18450, dropoff: '100%' },
    { label: isHindi ? 'योजना मिलान (Matched)' : 'Recommendations Viewed', count: 16200, dropoff: '87.8%' },
    { label: isHindi ? 'ईएमआई मॉडलिंग (Calculator)' : 'Loan Modeler Run', count: 14890, dropoff: '80.7%' },
    { label: isHindi ? 'चैनल पार्टनर चयन (SCA)' : 'Partner Located', count: 13910, dropoff: '75.4%' },
    { label: isHindi ? 'रूटिंग पर्ची जनरेट (Slip)' : 'Routing Slip Downloaded', count: 12480, dropoff: '67.6%' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              MoSJE Central Command · Ministry Executive Persona
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-sans mt-1">
            {t.ministryTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {t.ministrySubtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-800 p-2 rounded-2xl border border-slate-700">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-2">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-900 text-white text-xs font-bold p-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Madhya Pradesh">Madhya Pradesh (Active Cohort)</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi NCT</option>
          </select>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('verification')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeSubTab === 'verification'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>{isHindi ? 'दस्तावेज़ सत्यापन पाइपलाइन (PRD §4-8)' : 'Document Verification Pipeline (PRD)'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            activeSubTab === 'verification' ? 'bg-orange-700 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            24,180
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeSubTab === 'analytics'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isHindi ? 'समानता एवं वितरण एनालिटिक्स' : 'Equity & Disbursement Analytics'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('dpdp')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeSubTab === 'dpdp'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isHindi ? 'DPDP अधिनियम 2023 अनुपालन' : 'DPDP Act 2023 Statutory Compliance'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DOCUMENT VERIFICATION PIPELINE (PRD §4, §5, §6, §7, §8)             */}
      {/* ========================================================================= */}
      {activeSubTab === 'verification' && (
        <DocumentVerificationPanel language={language} />
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EQUITY & DISBURSEMENT ANALYTICS (PRD §33)                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'कुल नागरिक रूट' : 'Total Routed'}
              </span>
              <div className="text-2xl font-black text-slate-900 font-sans mt-1">
                {demographicStats.totalRouted.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">
                ↑ +18.4% this mo.
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'अनुसूचित जाति (SC)' : 'SC Beneficiaries'}
              </span>
              <div className="text-2xl font-black text-orange-600 font-sans mt-1">
                {demographicStats.scShare}%
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">NSFDC Mandate</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'अन्य पिछड़ा वर्ग (OBC)' : 'OBC Share'}
              </span>
              <div className="text-2xl font-black text-blue-600 font-sans mt-1">
                {demographicStats.obcShare}%
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">NBCFDC Mandate</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'सफाई कर्मचारी' : 'Safai Karamchari'}
              </span>
              <div className="text-2xl font-black text-purple-600 font-sans mt-1">
                {demographicStats.safaiShare}%
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">NSKFDC Mandate</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'महिला उद्यमी' : 'Women Share'}
              </span>
              <div className="text-2xl font-black text-pink-600 font-sans mt-1">
                {demographicStats.womenEntrepreneurs}%
              </div>
              <span className="text-[10px] text-pink-700 font-bold block mt-1">Mahila Samriddhi</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isHindi ? 'औसत स्वीकृति समय' : 'Average TAT'}
              </span>
              <div className="text-2xl font-black text-emerald-600 font-sans mt-1">
                {demographicStats.avgProcessingTat} <span className="text-xs font-normal">Days</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">Target: &lt; 7 Days</span>
            </div>

          </div>

          {/* Conversion Funnel & Equity Visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Funnel Tracker */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>{isHindi ? 'नागरिक यात्रा फनल विश्लेषण' : 'Beneficiary Conversion Funnel'}</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  67.6% Completion
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                {funnelSteps.map((step, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-slate-700 font-semibold">
                      <span>{step.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{step.count.toLocaleString('en-IN')}</span>
                        <span className="text-slate-400 text-[10px]">({step.dropoff})</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-700"
                        style={{ width: step.dropoff }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600">
                💡 <strong>Insight:</strong> Zero-dropoff between Calculator and Channel Partner Locator due to instant routing pass issuance.
              </div>
            </div>

            {/* Right: State Channelizing Agency Leaderboard */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>{isHindi ? 'चैनल पार्टनर कार्यक्षमता मैट्रिक्स' : 'SCA Load & Capacity Matrix'}</span>
                </h3>
                <span className="text-xs text-slate-400">Live Quotas</span>
              </div>

              <div className="space-y-3 text-xs">
                {CHANNEL_PARTNERS_DATABASE.slice(0, 4).map((cp) => (
                  <div key={cp.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                    <div className="space-y-0.5 max-w-[60%]">
                      <span className="font-bold text-slate-900 block truncate">{cp.name}</span>
                      <span className="text-[10px] text-slate-500">{cp.district} · {cp.typeLabel}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-800">
                        {cp.reliability.allocatedFundUtilizationPercent}% {isHindi ? 'कोटा उपयोग' : 'Fund Used'}
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        cp.acceptingNewApplications 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {cp.acceptingNewApplications ? `${cp.reliability.averageResponseTimeDays}d Avg TAT` : 'PAUSED (Full)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DPDP ACT 2023 STATUTORY COMPLIANCE & AUDIT TRAIL                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'dpdp' && (
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {t.dpdpLogTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Statutory verification certifying that beneficiary caste categories, annual incomes, and personal identifiers comply with <strong>Sections 4, 6 & 8 of India's Digital Personal Data Protection (DPDP) Act, 2023</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Purpose Limitation (§4)</span>
              <strong className="text-emerald-700 text-sm">100% Compliant (Enforced)</strong>
              <p className="text-[11px] text-slate-500">Collected exclusively for credit scheme eligibility and channel partner routing.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Data Retention & Scrubbing (§8)</span>
              <strong className="text-emerald-700 text-sm">Structured Metadata Only</strong>
              <p className="text-[11px] text-slate-500">Raw document scans purged post-terminal state. Structured verification records retained.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Cryptographic Consent Token</span>
              <strong className="text-slate-900 text-sm">Immutable Audit Trail</strong>
              <p className="text-[11px] text-slate-500">Every state transition logged with timestamp, reviewer ID, and rule citation.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

