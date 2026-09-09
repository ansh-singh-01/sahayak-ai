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
  LogOut
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../../services/i18nService';
import { LanguageSelector } from './LanguageSelector';
import { CitizenProfile } from '../../types/user';
import { AuthUser } from '../../types/auth';

interface NavbarProps {
  currentTab: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth';
  setCurrentTab: (tab: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onSelectDemoProfile?: (profile: CitizenProfile) => void;
  onOpenConsentModal: () => void;
  onOpenVoiceModal: () => void;
  authUser: AuthUser | null;
  onLogout: () => void;
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onSelectDemoProfile: _onSelectDemoProfile,
  onOpenConsentModal,
  onOpenVoiceModal,
  authUser,
  onLogout,
  onOpenChat
}) => {
  const t = TRANSLATIONS[language];
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
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('landing')}>
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
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Middle Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
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
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
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
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                currentTab === 'wizard' || currentTab === 'recommendations'
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{t.findMyScheme}</span>
            </button>

            <button
              onClick={() => setCurrentTab('calculator')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
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
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                currentTab === 'partners'
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t.partnersNav}</span>
            </button>

            <button
              onClick={() => setCurrentTab('checklist')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                currentTab === 'checklist'
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t.checklistNav}</span>
            </button>

            {/* Ministry Admin Dashboard - Restricted strictly to authenticated Ministry officials */}
            {authUser?.role === 'MINISTRY' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{t.adminMode}</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* "Prefer to Speak?" Button (PRD §9) */}
            <button
              onClick={onOpenVoiceModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-medium text-xs transition shadow-sm animate-bounce duration-1000"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>🎙️ {t.preferToSpeak}</span>
            </button>

            {/* Citizen Profile Toggle Button with Sign Out & Actions Popover */}
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
                  aria-label="Toggle citizen account and sign out menu"
                  title="Citizen Profile & Actions"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                    {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-bold text-slate-800 max-w-[85px] sm:max-w-[120px] truncate text-left">
                    {authUser.name}
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-200 text-orange-900 tracking-wider">
                    {authUser.role}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-orange-600' : ''}`} />
                </button>

                {/* Citizen Profile & Sign Out Popover Dropdown */}
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden"
                  >
                    {/* User Identity Header */}
                    <div className="px-4 py-3 bg-gradient-to-br from-orange-50/70 via-slate-50 to-white border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white text-base font-black flex items-center justify-center shadow-sm shrink-0">
                          {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {authUser.name}
                          </p>
                          <div className="flex items-center space-x-1.5 mt-0.5 flex-wrap gap-y-1">
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 tracking-wider">
                              {authUser.role}
                            </span>
                            {authUser.category && (
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
                        </div>
                      </div>
                    </div>

                    {/* Navigation Quick Links */}
                    <div className="py-1">
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
