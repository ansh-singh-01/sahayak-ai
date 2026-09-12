import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Scale, 
  Calculator, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Filter, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Percent, 
  Clock, 
  Landmark, 
  Search,
  ArrowUpRight,
  FileCheck2,
  ScanLine
} from 'lucide-react';
import { Scheme, MinistryAgency } from '../../types/scheme';
import { RankedPartner, ChannelPartner } from '../../types/partner';
import { AuthUser } from '../../types/auth';
import { Language, TRANSLATIONS } from '../../services/i18nService';
import { SchemeRegistryService } from '../../services/schemeRegistry';
import { CHANNEL_PARTNERS_DATABASE } from '../../data/partnersData';
import { PartnerLocator } from './PartnerLocator';
import { AddSchemeModal } from './AddSchemeModal';

interface ChannelProviderPortalProps {
  userDistrict: string;
  selectedScheme: Scheme | null;
  selectedPartner: RankedPartner | null;
  onSelectPartner: (partner: RankedPartner) => void;
  onSelectScheme: (scheme: Scheme) => void;
  onNavigateToTab: (tab: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth' | 'compare') => void;
  language: Language;
  authUser?: AuthUser | null;
  initialSubTab?: 'schemes' | 'locator';
  onLoginSuccess?: (user: AuthUser, demoProfile?: any, targetTab?: any) => void;
  onOpenDeskScanner?: (refId?: string) => void;
}

export const ChannelProviderPortal: React.FC<ChannelProviderPortalProps> = ({
  userDistrict,
  selectedScheme,
  selectedPartner,
  onSelectPartner,
  onSelectScheme,
  onNavigateToTab,
  language,
  authUser,
  initialSubTab,
  onLoginSuccess,
  onOpenDeskScanner
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  // Role Gate: Only authenticated Bank & Channel Partners (or Ministry Admins) can manage and deploy schemes
  const isBankPartner = Boolean(
    authUser && (authUser.role === 'PARTNER' || authUser.role === 'MINISTRY')
  );

  // Sub-tab: default to schemes management ONLY if user is authorized Bank Partner, else 'locator' for citizens
  const [activeSubTab, setActiveSubTab] = useState<'schemes' | 'locator'>(
    isBankPartner ? (initialSubTab || 'schemes') : 'locator'
  );

  // Synchronize when auth state changes (e.g. user signs in or out)
  useEffect(() => {
    if (!isBankPartner) {
      setActiveSubTab('locator');
    } else if (isBankPartner && !initialSubTab) {
      setActiveSubTab('schemes');
    }
  }, [isBankPartner, initialSubTab]);

  const [schemes, setSchemes] = useState<Scheme[]>(SchemeRegistryService.getAllSchemes());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [agencyFilter, setAgencyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [partnerFilter, setPartnerFilter] = useState<string>('ALL');

  // Active Partner Profile Context
  const defaultPartner = useMemo(() => {
    if (authUser?.role === 'PARTNER') {
      if (authUser.partnerType === 'PSU_BANK' || authUser.email?.includes('sbi') || authUser.name?.includes('State Bank')) {
        return CHANNEL_PARTNERS_DATABASE.find(p => p.type === 'PSU_BANK') || CHANNEL_PARTNERS_DATABASE[2];
      }
      return CHANNEL_PARTNERS_DATABASE[0];
    }
    return CHANNEL_PARTNERS_DATABASE[0];
  }, [authUser]);

  const [selectedChannelPartner, setSelectedChannelPartner] = useState<ChannelPartner>(defaultPartner);

  // Update selectedChannelPartner if defaultPartner changes with auth
  useEffect(() => {
    setSelectedChannelPartner(defaultPartner);
  }, [defaultPartner]);

  // Subscribe to SchemeRegistry updates
  useEffect(() => {
    const unsubscribe = SchemeRegistryService.subscribe(() => {
      setSchemes(SchemeRegistryService.getAllSchemes());
    });
    return unsubscribe;
  }, []);

  const handleSchemeAdded = (newScheme: Scheme) => {
    setSchemes(SchemeRegistryService.getAllSchemes());
    setIsAddModalOpen(false);
  };

  const handleDeleteScheme = (schemeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(isHindi ? 'क्या आप इस चैनल योजना को हटाना चाहते हैं?' : 'Are you sure you want to remove this custom channel scheme?')) {
      SchemeRegistryService.deleteScheme(schemeId);
    }
  };

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.hindiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.channelProviderName && s.channelProviderName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAgency = agencyFilter === 'ALL' || s.agency === agencyFilter;
      const matchesCategory = categoryFilter === 'ALL' || s.targetCommunity.includes(categoryFilter as any);
      const matchesPartner = 
        partnerFilter === 'ALL' || 
        (partnerFilter === 'CUSTOM' && s.isCustomChannelScheme) ||
        (partnerFilter === 'SCA' && (s.channelProviderType === 'SCA' || s.code.includes('SCA'))) ||
        (partnerFilter === 'BANK' && (s.channelProviderType === 'PSU_BANK' || s.channelProviderType === 'RRB'));

      return matchesSearch && matchesAgency && matchesCategory && matchesPartner;
    });
  }, [schemes, searchQuery, agencyFilter, categoryFilter, partnerFilter]);

  const customCount = useMemo(() => schemes.filter(s => s.isCustomChannelScheme).length, [schemes]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Top Header & Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30 flex items-center space-x-1">
                <Landmark className="w-3 h-3" />
                <span>
                  {isBankPartner
                    ? (isHindi ? 'अधिकृत बैंक पार्टनर एवं SCA नोडल डेस्क' : 'Authorized Sponsoring Bank & SCA Nodal Desk')
                    : (isHindi ? 'नागरिक सहायता एवं शाखा लोकेटर' : 'Citizen Assistance & Branch Directory')}
                </span>
              </span>
              {isBankPartner ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{customCount} {isHindi ? 'चैनल योजनाएं सक्रिय' : 'Partner Schemes Active'}</span>
                </span>
              ) : (
                <span className="text-xs text-blue-300 font-bold flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isHindi ? 'निकटतम बैंक व SCA शाखाएं' : 'Branch Locator Active'}</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isBankPartner
                ? (isHindi ? 'चैनल पार्टनर एवं बैंक योजना प्रबंधन' : 'Channel Partners & Sponsoring Banks Portal')
                : (isHindi ? 'नागरिक शाखा लोकेटर एवं दिशाएं' : 'Citizen Branch Locator & Directions')}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              {isBankPartner
                ? (isHindi 
                    ? `लॉगिन सत्र: ${authUser?.organizationName || authUser?.agency || 'भारतीय स्टेट बैंक (SBI)'} | अधिकृत बैंक पार्टनर्स एवं SCA सामाजिक ऋण योजनाएं पंजीकृत कर सकते हैं, ब्याज व अनुदान दरें तय कर सकते हैं, तथा सीधे नागरिकों तक पहुंचा सकते हैं।` 
                    : `Active Session: ${authUser?.organizationName || authUser?.agency || 'State Bank of India (PSU Bank Partner)'} | Authorized Sponsoring Banks and SCAs can deploy new concessional loan schemes, set interest subsidies, and allocate district quotas.`)
                : (isHindi
                    ? 'नागरिक लाभार्थी इस पोर्टल से अपने जिले की अधिकृत बैंक शाखाओं एवं राज्य चैनललाइजिंग एजेंसियों (SCA) के पते, नोडल अधिकारी, कोटा उपलब्धता एवं दिशाएं देख सकते हैं।'
                    : 'Locate authorized sponsoring bank branches and State Channelizing Agency (SCA) offices in your district, check quota availability, contact nodal officers, and get navigation directions.')}
            </p>
          </div>

          {/* Action CTA Area */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {isBankPartner ? (
              <>
                {/* Beneficiary QR Slip Scanner Button - ONLY for authorized Bank Partners & SCAs */}
                {onOpenDeskScanner && (
                  <button
                    type="button"
                    onClick={() => onOpenDeskScanner()}
                    className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.02]"
                    title="Scan Citizen QR Slip for Instant Intake"
                  >
                    <ScanLine className="w-4 h-4 text-white" />
                    <span>{isHindi ? '📷 नागरिक QR पर्ची स्कैन करें' : '📷 Scan Beneficiary QR Slip'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-600 to-indigo-700 hover:from-blue-600 hover:to-indigo-800 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>{isHindi ? '+ नई योजना जोड़ें (SCA / बैंक)' : '+ Add New Scheme (SCA / Bank)'}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-white text-xs font-bold">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{userDistrict ? `${userDistrict} District` : (isHindi ? 'सभी जिले' : 'Indore / All Districts')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Tab Navigation Bar - Rendered ONLY for authorized Bank Partners */}
        {isBankPartner && (
          <div className="mt-6 pt-4 border-t border-indigo-900/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2 bg-slate-950/60 p-1 rounded-2xl border border-indigo-800/40">
              <button
                type="button"
                onClick={() => setActiveSubTab('schemes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  activeSubTab === 'schemes'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isHindi ? '1. चैनल योजना प्रबंधन (Deploy & Manage)' : '1. SCA & Bank Schemes Management'}</span>
                {customCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px] font-black">
                    {customCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('locator')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  activeSubTab === 'locator'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isHindi ? '2. नागरिक शाखा लोकेटर एवं दिशाएं (Locator)' : '2. Citizen Branch Locator & Directions'}</span>
              </button>
            </div>

            <div className="text-[11px] text-indigo-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isHindi ? 'प्रमाणित बैंक पार्टनर नोडल सत्र' : 'Authorized Bank Partner Active Session'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SUB-VIEW 1: SCA & BANK SCHEMES MANAGEMENT (EXCLUSIVE TO AUTHORIZED BANK PARTNERS) */}
      {isBankPartner && activeSubTab === 'schemes' && (
        <div className="space-y-6">


          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  {isHindi ? 'कुल सक्रिय योजनाएं' : 'Total Schemes'}
                </span>
                <span className="text-xl font-black text-slate-900">{schemes.length}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  {isHindi ? 'चैनल द्वारा जोड़ी गई' : 'SCA/Bank Deployed'}
                </span>
                <span className="text-xl font-black text-emerald-700">{customCount}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  {isHindi ? 'औसत रियायती दर' : 'Avg Concession Rate'}
                </span>
                <span className="text-xl font-black text-indigo-700">3.5% – 6.0%</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">
                  {isHindi ? 'अधिकतम परियोजना सीमा' : 'Max Project Finance'}
                </span>
                <span className="text-xl font-black text-amber-700">₹50 Lakh</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHindi ? 'योजना का नाम, कोड या बैंक/SCA खोजें...' : 'Search by scheme name, code, or channel provider...'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={partnerFilter}
                  onChange={(e) => setPartnerFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none"
                >
                  <option value="ALL">{isHindi ? 'सभी प्रदाता (All Providers)' : 'All Providers'}</option>
                  <option value="CUSTOM">{isHindi ? 'केवल जोड़ी गई योजनाएं (Custom Only)' : 'SCA/Bank Deployed'}</option>
                  <option value="SCA">{isHindi ? 'SCA योजनाएं' : 'State SCAs'}</option>
                  <option value="BANK">{isHindi ? 'बैंक ऋण' : 'PSU / RRB Banks'}</option>
                </select>

                <select
                  value={agencyFilter}
                  onChange={(e) => setAgencyFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none"
                >
                  <option value="ALL">{isHindi ? 'सभी शीर्ष निगम (All Apex)' : 'All Apex Corps'}</option>
                  <option value="NSFDC">NSFDC (Scheduled Castes)</option>
                  <option value="NBCFDC">NBCFDC (Backward Classes)</option>
                  <option value="NSKFDC">NSKFDC (Safai Karamcharis)</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none"
                >
                  <option value="ALL">{isHindi ? 'सभी समुदाय (All Communities)' : 'All Target Groups'}</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="OBC">OBC (Backward Class)</option>
                  <option value="SAFAI_KARAMCHARI">Safai Karamchari</option>
                  <option value="OPEN">Open / Any</option>
                </select>
              </div>

            </div>
          </div>

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchemes.map((scheme) => {
              const isCustom = scheme.isCustomChannelScheme;
              const rate = scheme.interestSlabs[0]?.ratePercent || 5.0;

              return (
                <div
                  key={scheme.id}
                  className={`bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-lg ${
                    isCustom 
                      ? 'border-blue-300 ring-2 ring-blue-500/10 bg-gradient-to-b from-blue-50/20 to-white' 
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Badge & Code */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          scheme.agency === 'NSFDC'
                            ? 'bg-blue-100 text-blue-800'
                            : scheme.agency === 'NBCFDC'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {scheme.agency}
                        </span>

                        {isCustom ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center space-x-1">
                            <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                            <span>{isHindi ? 'चैनल द्वारा जारी' : 'SCA/Bank Added'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            MoSJE Apex
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-[11px] font-bold text-slate-500">
                          {scheme.code}
                        </span>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteScheme(scheme.id, e)}
                            title="Remove custom scheme"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sponsoring Channel Partner Name */}
                    {scheme.channelProviderName && (
                      <div className="text-[11px] font-bold text-indigo-700 flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{scheme.channelProviderName}</span>
                      </div>
                    )}

                    {/* Scheme Name */}
                    <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                      {isHindi ? scheme.hindiName : scheme.name}
                    </h4>

                    {/* Tagline / Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {isHindi ? scheme.hindiDescription : (scheme.tagline || scheme.description)}
                    </p>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {isHindi ? 'ब्याज दर' : 'Interest'}
                      </span>
                      <span className="text-sm font-black text-emerald-700">
                        {rate}% p.a.
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {isHindi ? 'अधिकतम ऋण' : 'Max Loan'}
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        ₹{(scheme.maxLoanAmount / 100000).toFixed(1)}L
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {isHindi ? 'अनुदान' : 'Subsidy'}
                      </span>
                      <span className="text-xs font-black text-indigo-700">
                        {scheme.subsidyPercentage ? `${scheme.subsidyPercentage}%` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Target Communities Badges */}
                  <div className="flex flex-wrap gap-1">
                    {scheme.targetCommunity.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold"
                      >
                        {cat}
                      </span>
                    ))}
                    {scheme.genderRestriction === 'FEMALE_ONLY' && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold">
                        {isHindi ? 'केवल महिलाएं' : 'Women Only'}
                      </span>
                    )}
                  </div>

                  {/* Bank / SCA Channel Management Status & Verification Desk Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isHindi ? 'सक्रिय क्रेडिट लाइन' : 'Active Credit Line'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => onNavigateToTab('admin')}
                      className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
                      title="Open Document Verification & Applicant Queue"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'सत्यापन कतार' : 'Verify Applicants'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                {isHindi ? 'कोई योजना नहीं मिली' : 'No matching schemes found'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isHindi ? 'फ़िल्टर बदलें या नई चैनल योजना जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें।' : 'Try adjusting your filters or click the button above to add a new scheme.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                + Add New Scheme
              </button>
            </div>
          )}

        </div>
      )}

      {/* SUB-VIEW 2: CITIZEN BRANCH LOCATOR & DIRECTIONS */}
      {(!isBankPartner || activeSubTab === 'locator') && (
        <PartnerLocator
          userDistrict={userDistrict}
          selectedScheme={selectedScheme}
          selectedPartner={selectedPartner}
          onSelectPartner={onSelectPartner}
          language={language}
        />
      )}

      {/* ADD SCHEME MODAL - Restricted to Authorized Bank Partners */}
      {isBankPartner && (
        <AddSchemeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSchemeAdded={handleSchemeAdded}
          language={language}
          defaultChannelPartnerName={authUser?.organizationName || authUser?.agency || selectedChannelPartner.name}
          defaultChannelPartnerType={(authUser?.partnerType as any) || (selectedChannelPartner.type as any) || 'PSU_BANK'}
          defaultState={authUser?.state || selectedChannelPartner.state}
          defaultDistrict={authUser?.district || selectedChannelPartner.district}
        />
      )}

    </div>
  );
};
