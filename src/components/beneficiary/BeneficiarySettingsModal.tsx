import React, { useState } from 'react';
import { 
  X, 
  User, 
  Globe2, 
  Volume2, 
  ShieldCheck, 
  Save, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  Sliders
} from 'lucide-react';
import { CitizenProfile } from '../../types/user';
import { AuthUser } from '../../types/auth';
import { Language, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../../services/i18nService';

interface BeneficiarySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CitizenProfile;
  onUpdateProfile: (updated: Partial<CitizenProfile>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  authUser: AuthUser | null;
  voiceFirstMode: boolean;
  setVoiceFirstMode: (active: boolean) => void;
  onLogout?: () => void;
}

export const BeneficiarySettingsModal: React.FC<BeneficiarySettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  language,
  setLanguage,
  authUser,
  voiceFirstMode,
  setVoiceFirstMode,
  onLogout
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'profile' | 'language' | 'accessibility' | 'privacy'>('profile');

  // Form State
  const [formData, setFormData] = useState({
    name: profile.name,
    age: profile.age,
    annualFamilyIncome: profile.annualFamilyIncome,
    district: profile.district,
    state: profile.state
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: formData.name,
      age: Number(formData.age),
      annualFamilyIncome: Number(formData.annualFamilyIncome),
      district: formData.district,
      state: formData.state
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportData = () => {
    const dataToExport = {
      exportTimestamp: new Date().toISOString(),
      statuteCompliance: 'Digital Personal Data Protection Act (DPDP), 2023',
      profile,
      authUser: authUser ? {
        id: authUser.id,
        name: authUser.name,
        role: authUser.role,
        dpdpConsentTimestamp: authUser.dpdpConsentTimestamp
      } : null
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAHAYAK_citizen_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePurgeData = () => {
    if (window.confirm(isHindi 
      ? 'क्या आप सुनिश्चित हैं? DPDP अधिनियम 2023 के तहत आपका स्थानीय डेटा व सहमति लॉग तुरंत हटा दिया जाएगा।' 
      : 'Are you sure? Under the DPDP Act 2023, your local data and consent record will be erased immediately.')) {
      try {
        localStorage.removeItem('sahayak_auth_user');
        localStorage.removeItem('mosje_auth_user');
        localStorage.removeItem('sahayak_applications');
      } catch (e) {}
      setPurgeSuccess(true);
      setTimeout(() => {
        setPurgeSuccess(false);
        onClose();
        if (onLogout) onLogout();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-orange-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {isHindi ? 'प्रोफ़ाइल एवं प्राथमिकता नियंत्रण' : 'Profile & Account Settings'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHindi ? 'व्यक्तिगत विवरण, भाषा व डीपी़डीपी 2023 डेटा नियंत्रण' : 'Personal info, regional language, and DPDP Act 2023 controls'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isHindi ? 'व्यक्तिगत जानकारी' : 'Personal Info'}</span>
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`pb-3 px-3 border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'language'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>{isHindi ? 'भाषा चयन (11)' : 'Language (11)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('accessibility')}
            className={`pb-3 px-3 border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'accessibility'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isHindi ? 'ध्वनि सहायता' : 'Audio Assist'}</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-3 border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isHindi ? 'डीपी़डीपी गोपनीयता' : 'DPDP Privacy'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHindi ? 'विवरण सफलतापूर्वक सहेजे गए!' : 'Profile changes updated successfully!'}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'पूरा नाम' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'आयु (वर्ष)' : 'Age (Years)'}
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-semibold"
                    min="18"
                    max="99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'वार्षिक पारिवारिक आय (₹)' : 'Annual Family Income (₹)'}
                  </label>
                  <input
                    type="number"
                    value={formData.annualFamilyIncome}
                    onChange={e => setFormData({ ...formData, annualFamilyIncome: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-semibold"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ₹{(formData.annualFamilyIncome / 100000).toFixed(2)} Lakh/year
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'लाभार्थी श्रेणी' : 'Community Category'}
                  </label>
                  <input
                    type="text"
                    value={profile.category}
                    disabled
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'राज्य' : 'State'}
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'जिला' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isHindi ? 'सहेजें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Language */}
          {activeTab === 'language' && (
            <div className="space-y-3">
              <p className="text-slate-600 text-xs">
                {isHindi 
                  ? 'अपनी क्षेत्रीय भाषा का चयन करें। संपूर्ण सहायक पोर्टल तुरंत चुनी गई भाषा में प्रदर्शित होगा।' 
                  : 'Select your preferred official Indian language. The entire portal will seamlessly adapt.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                      language === l.code
                        ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-sm block text-slate-900">
                        {l.nativeName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {l.name} · {l.region}
                      </span>
                    </div>

                    {language === l.code && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Accessibility */}
          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    {isHindi ? 'ध्वनि-प्रथम सहायता मोड' : 'Voice-First Accessibility Mode'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {isHindi 
                      ? 'कम साक्षरता वाले नागरिकों हेतु सभी महत्वपूर्ण चरणों व परिणामों का ऑडियो विवरण स्वतः सुनाएं' 
                      : 'Automatically read out scheme qualifications and next steps aloud in native tongue'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setVoiceFirstMode(!voiceFirstMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    voiceFirstMode ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    voiceFirstMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <span className="font-bold block mb-1">
                  🎙️ {isHindi ? 'ध्वनि सहायता मार्गदर्शन' : 'Web Speech Synthesis Active'}
                </span>
                <p className="text-[11px] text-amber-800">
                  {isHindi
                    ? 'सहायक पोर्टल पर किसी भी पृष्ठ पर "बोलकर बताएं" या माइक आइकन पर क्लिक करके सीधे बोलकर जानकारी प्राप्त कर सकते हैं।'
                    : 'Citizens can tap the microphone icon at any point to hear guidance or dictate responses in Hindi and English.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Privacy & DPDP Act 2023 */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-extrabold text-sm">
                    {isHindi ? 'DPDP अधिनियम, 2023 वैधानिक अनुपालन' : 'Digital Personal Data Protection Act, 2023'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {isHindi
                    ? 'आपके व्यक्तिगत विवरण केवल कल्याणकारी योजनाओं की पात्रता जांच और नामित चैनल पार्टनर रूटिंग हेतु उपयोग किए जाते हैं। कोई भी डेटा अनधिकृत तीसरे पक्ष को साझा नहीं किया जाता।'
                    : 'SAHAYAK operates under strict purpose limitation: data is processed solely for social welfare eligibility evaluation and channel partner routing.'}
                </p>
              </div>

              {purgeSuccess && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{isHindi ? 'डेटा सफलतापूर्वक हटा दिया गया।' : 'All local session data has been erased.'}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {isHindi ? 'मेरा डेटा निर्यात करें (JSON)' : 'Export Stored Data (JSON)'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isHindi ? 'अपने पंजीकृत प्रोफ़ाइल व सहमति लॉग की एक प्रति डाउनलोड करें' : 'Download a machine-readable copy of your profile and statutory consent log'}
                    </span>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center space-x-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'डाउनलोड' : 'Export'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-rose-200 bg-rose-50/30">
                  <div>
                    <span className="font-bold text-rose-900 block">
                      {isHindi ? 'डेटा मिटाने का अनुरोध (Right to Erasure)' : 'Purge All Data & Consent'}
                    </span>
                    <span className="text-[10px] text-rose-700">
                      {isHindi ? 'ब्राउज़र से अपनी प्रोफ़ाइल और सक्रिय सत्र तुरंत हटा दें' : 'Erase all locally stored demographic attributes and active session tokens'}
                    </span>
                  </div>
                  <button
                    onClick={handlePurgeData}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center space-x-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'डेटा हटाएं' : 'Purge'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
          >
            {isHindi ? 'बंद करें' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
