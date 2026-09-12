import React from 'react';
import { 
  Building2, 
  UserCheck, 
  Calculator, 
  MapPin, 
  FileCheck2, 
  ChevronDown,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Users,
  Scale,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../../services/i18nService';
import { LanguageSelector } from './LanguageSelector';
import { CitizenProfile } from '../../types/user';
import { AuthUser } from '../../types/auth';

interface NavbarProps {
  currentTab: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth' | 'compare';
  setCurrentTab: (tab: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth' | 'compare') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onSelectDemoProfile?: (profile: CitizenProfile) => void;
  onOpenConsentModal: () => void;
  onOpenVoiceModal: () => void;
  authUser: AuthUser | null;
  onLogout: () => void;
  onOpenChat?: () => void;
  onOpenWhatsAppModal?: () => void;
  onOpenRoutingSlip?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onSelectDemoProfile: _onSelectDemoProfile,
  onOpenConsentModal,
  onOpenVoiceModal: _onOpenVoiceModal,
  authUser,
  onLogout,
  onOpenChat,
  onOpenWhatsAppModal,
  onOpenRoutingSlip
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBrandClick = () => {
    if (authUser?.role === 'MINISTRY') {
      setCurrentTab('admin');
    } else if (authUser?.role === 'PARTNER') {
      setCurrentTab('partners');
    } else if (authUser?.role === 'FIELD_AGENT') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('landing');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Ministry Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t.ministryHeader}</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-orange-400 font-semibold hidden md:inline">{t.problemStatementBadge}</span>
        </div>
        
        <div className="flex items-center space-x-3 text-xs">
          {/* Multilingual Pan-India Language Selector (11 Languages) */}
          <LanguageSelector 
            currentLanguage={language} 
            onSelectLanguage={setLanguage} 
          />
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={handleBrandClick}
            title={authUser ? `Go to ${authUser.role} Portal` : 'Go to Home'}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <span className="text-xl font-black tracking-tighter">स</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  SAHAYAK <span className="text-orange-600">सहायक</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {authUser?.role === 'MINISTRY' 
                  ? (isHindi ? 'MoSJE केंद्रीय कमान पोर्टल' : 'MoSJE Central Command Portal')
                  : authUser?.role === 'PARTNER'
                  ? (isHindi ? 'बैंक एवं चैनल पार्टनर पोर्टल' : 'Sponsoring Bank & SCA Partner Portal')
                  : authUser?.role === 'FIELD_AGENT'
                  ? (isHindi ? 'सीएससी वीएलई फील्ड डेस्क' : 'CSC Field Agent Desk')
                  : t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Middle Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            
            {/* 1. MINISTRY EXECUTIVE PERSONA: strictly role-specific authority features */}
            {authUser?.role === 'MINISTRY' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentTab('admin')}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>{isHindi ? 'MoSJE केंद्रीय कमान' : 'MoSJE Central Command'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('partners')}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                    currentTab === 'partners'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>{isHindi ? 'बैंक एवं योजना कोटा' : 'Bank & Scheme Quotas'}</span>
                </button>
              </>
            )}

            {/* 2. BANK & CHANNEL PARTNER PERSONA: strictly role-specific authority features */}
            {authUser?.role === 'PARTNER' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentTab('partners')}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                    currentTab === 'partners'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-200" />
                  <span>{isHindi ? 'योजना एवं कोटा प्रबंधन' : 'Scheme & Quota Desk'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('admin')}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>{isHindi ? 'दस्तावेज़ सत्यापन कतार' : 'Document Verification'}</span>
                </button>
              </>
            )}

            {/* 3. CSC FIELD AGENT PERSONA: strictly assisted intake, records queue & branch locator */}
            {authUser?.role === 'FIELD_AGENT' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                    currentTab === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-200" />
                  <span>{isHindi ? 'सीएससी फील्ड डेस्क' : 'CSC Field Desk'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('wizard')}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                    currentTab === 'wizard' || currentTab === 'recommendations'
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-orange-200" />
                  <span>{isHindi ? 'सहायक नागरिक नामांकन' : 'Assisted Registration'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('partners')}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                    currentTab === 'partners'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-200" />
                  <span>{isHindi ? 'शाखा एवं SCA लोकेटर' : 'Branch Locator'}</span>
                </button>
              </>
            )}

            {/* 4. CITIZEN BENEFICIARY / GUEST PERSONA: full consumer features */}
            {(!authUser || authUser.role === 'CITIZEN') && (
              <>
                <button
                  onClick={() => setCurrentTab('landing')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                    currentTab === 'landing'
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>{t.homeNav}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                    currentTab === 'dashboard'
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t.dashboardNav}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('wizard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                    currentTab === 'wizard' || currentTab === 'recommendations'
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t.findMyScheme}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('compare')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                    currentTab === 'compare'
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{isHindi ? 'योजना तुलना' : 'Compare Schemes'}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('calculator')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                    currentTab === 'calculator'
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span>{t.calculatorNav}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('partners')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                    currentTab === 'partners'
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{isHindi ? 'शाखा लोकेटर' : 'Branch Locator'}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('checklist')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${
                    currentTab === 'checklist'
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{t.checklistNav}</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Citizen QR Routing Slip Quick Pass Button */}
            {authUser && authUser.role === 'CITIZEN' && onOpenRoutingSlip && (
              <button
                type="button"
                onClick={onOpenRoutingSlip}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
                title="View your official QR Routing Slip to show at Bank or SCA desk"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isHindi ? 'रूटिंग पर्ची' : 'QR Slip'}</span>
              </button>
            )}

            {/* Profile Toggle Button with Sign Out & Role Actions Popover */}
            {authUser ? (
              <div className="relative pl-1" ref={userMenuRef}>
                <button
                  type="button"
                  id="citizen-profile-toggle"
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs border transition cursor-pointer active:scale-95 select-none ${
                    userMenuOpen
                      ? 'bg-orange-50 border-orange-300 text-orange-950 ring-2 ring-orange-400/20 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                  }`}
                  aria-expanded={userMenuOpen}
                  aria-label="Toggle user account and sign out menu"
                  title="Profile & Authority Actions"
                >
                  <div className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs ${
                    authUser.role === 'MINISTRY'
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                      : authUser.role === 'PARTNER'
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                      : authUser.role === 'FIELD_AGENT'
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-600'
                      : 'bg-gradient-to-tr from-orange-600 to-amber-500'
                  }`}>
                    {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-bold text-slate-800 max-w-[85px] sm:max-w-[120px] truncate text-left">
                    {authUser.name}
                  </span>
                  <span className={`hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                    authUser.role === 'MINISTRY'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : authUser.role === 'PARTNER'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : authUser.role === 'FIELD_AGENT'
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      : 'bg-orange-200 text-orange-900'
                  }`}>
                    {authUser.role}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-orange-600' : ''}`} />
                </button>

                {/* Profile & Actions Popover Dropdown */}
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden"
                  >
                    {/* User Identity Header */}
                    <div className="px-4 py-3 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full text-white text-base font-black flex items-center justify-center shadow-sm shrink-0 ${
                          authUser.role === 'MINISTRY'
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                            : authUser.role === 'PARTNER'
                            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                            : authUser.role === 'FIELD_AGENT'
                            ? 'bg-gradient-to-tr from-indigo-600 to-violet-600'
                            : 'bg-gradient-to-tr from-orange-600 to-amber-500'
                        }`}>
                          {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {authUser.name}
                          </p>
                          <div className="flex items-center space-x-1.5 mt-0.5 flex-wrap gap-y-1">
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider border ${
                              authUser.role === 'MINISTRY'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : authUser.role === 'PARTNER'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : authUser.role === 'FIELD_AGENT'
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                                : 'bg-orange-100 text-orange-800 border-orange-200'
                            }`}>
                              {authUser.role === 'MINISTRY' 
                                ? 'MoSJE Executive'
                                : authUser.role === 'PARTNER'
                                ? 'Bank Partner'
                                : authUser.role === 'FIELD_AGENT'
                                ? 'CSC Field Agent'
                                : authUser.role}
                            </span>
                            {authUser.category && authUser.role === 'CITIZEN' && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[120px]">
                                {authUser.category.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          {authUser.phone && (
                            <p className="text-[11px] text-slate-500 mt-1 font-mono">
                              📱 {authUser.phone}
                            </p>
                          )}
                          {authUser.email && (
                            <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">
                              ✉️ {authUser.email}
                            </p>
                          )}
                          {authUser.agentId && (
                            <p className="text-[11px] text-indigo-700 font-bold mt-0.5 font-mono">
                              🆔 {authUser.agentId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Navigation Quick Links - STRICTLY ROLE-SPECIFIC */}
                    <div className="py-1">
                      {/* MINISTRY EXECUTIVE LINKS */}
                      {authUser.role === 'MINISTRY' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('admin');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-emerald-50 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'admin' ? 'font-bold text-emerald-800 bg-emerald-50/70' : 'text-slate-700'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="flex-1">{isHindi ? 'MoSJE केंद्रीय कमान' : 'MoSJE Central Command'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('partners');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-emerald-50 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'partners' ? 'font-bold text-emerald-800 bg-emerald-50/70' : 'text-slate-700'
                            }`}
                          >
                            <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="flex-1">{isHindi ? 'बैंक एवं योजना कोटा' : 'Bank & Scheme Quotas'}</span>
                          </button>
                        </>
                      )}

                      {/* BANK & CHANNEL PARTNER LINKS */}
                      {authUser.role === 'PARTNER' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('partners');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'partners' ? 'font-bold text-blue-800 bg-blue-50/70' : 'text-slate-700'
                            }`}
                          >
                            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="flex-1">{isHindi ? 'योजना एवं कोटा प्रबंधन' : 'Scheme & Quota Desk'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('admin');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'admin' ? 'font-bold text-blue-800 bg-blue-50/70' : 'text-slate-700'
                            }`}
                          >
                            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="flex-1">{isHindi ? 'दस्तावेज़ सत्यापन कतार' : 'Document Verification'}</span>
                          </button>
                        </>
                      )}

                      {/* CSC FIELD AGENT LINKS */}
                      {authUser.role === 'FIELD_AGENT' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('dashboard');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'dashboard' ? 'font-bold text-indigo-800 bg-indigo-50/70' : 'text-slate-700'
                            }`}
                          >
                            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="flex-1">{isHindi ? 'सीएससी फील्ड डेस्क' : 'CSC Field Desk'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('wizard');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'wizard' || currentTab === 'recommendations' ? 'font-bold text-indigo-800 bg-indigo-50/70' : 'text-slate-700'
                            }`}
                          >
                            <UserCheck className="w-4 h-4 text-orange-600 shrink-0" />
                            <span className="flex-1">{isHindi ? 'सहायक नागरिक नामांकन' : 'Assisted Registration'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('partners');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'partners' ? 'font-bold text-indigo-800 bg-indigo-50/70' : 'text-slate-700'
                            }`}
                          >
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="flex-1">{isHindi ? 'शाखा एवं SCA लोकेटर' : 'Branch Locator'}</span>
                          </button>
                        </>
                      )}

                      {/* CITIZEN BENEFICIARY LINKS */}
                      {authUser.role === 'CITIZEN' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('dashboard');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-orange-50/70 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'dashboard' ? 'font-bold text-orange-700 bg-orange-50/40' : 'text-slate-700'
                            }`}
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-orange-600 shrink-0" />
                            <span className="flex-1">{t.dashboardNav}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('wizard');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-orange-50/70 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'wizard' ? 'font-bold text-orange-700 bg-orange-50/40' : 'text-slate-700'
                            }`}
                          >
                            <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-orange-600 shrink-0" />
                            <span className="flex-1">{t.findMyScheme}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCurrentTab('checklist');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-orange-50/70 transition flex items-center space-x-2.5 text-xs group cursor-pointer ${
                              currentTab === 'checklist' ? 'font-bold text-orange-700 bg-orange-50/40' : 'text-slate-700'
                            }`}
                          >
                            <FileCheck2 className="w-4 h-4 text-slate-400 group-hover:text-orange-600 shrink-0" />
                            <span className="flex-1">{t.checklistNav}</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-1" />

                    {/* Sign Out Action Button */}
                    <div className="px-2 pt-1 pb-1">
                      <button
                        type="button"
                        id="citizen-signout-btn"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition group cursor-pointer shadow-2xs active:scale-98"
                        title={t.signOut}
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:translate-x-0.5 transition" />
                          <span className="font-bold">{t.signOut}</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 group-hover:text-rose-700">
                          Sign Out
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('auth')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  currentTab === 'auth'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.signInNav}</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
