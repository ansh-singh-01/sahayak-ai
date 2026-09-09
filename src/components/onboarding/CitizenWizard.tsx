import React, { useState } from 'react';
import { 
  UserCheck, 
  Briefcase, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Store, 
  Tractor, 
  Zap, 
  Truck, 
  Scissors, 
  GraduationCap, 
  Info,
  Mic
} from 'lucide-react';
import { CitizenProfile } from '../../types/user';
import { BeneficiaryCategory, ProjectPurpose } from '../../types/scheme';
import { Language, TRANSLATIONS } from '../../services/i18nService';
import { AuthUser } from '../../types/auth';

interface CitizenWizardProps {
  profile: CitizenProfile;
  setProfile: React.Dispatch<React.SetStateAction<CitizenProfile>>;
  authUser?: AuthUser | null;
  onEvaluate: () => void;
  language: Language;
  onOpenVoiceModal: () => void;
}

export const CitizenWizard: React.FC<CitizenWizardProps> = ({
  profile,
  setProfile,
  authUser,
  onEvaluate,
  language,
  onOpenVoiceModal
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  // Automatically pre-fill profile from previously provided registration / auth credentials
  React.useEffect(() => {
    if (authUser && authUser.role === 'CITIZEN') {
      setProfile(prev => {
        let changed = false;
        const next = { ...prev };
        if (authUser.name && prev.name !== authUser.name) {
          next.name = authUser.name;
          changed = true;
        }
        if (authUser.category && prev.category !== authUser.category) {
          next.category = authUser.category as BeneficiaryCategory;
          changed = true;
        }
        if (authUser.state && prev.state !== authUser.state) {
          next.state = authUser.state;
          changed = true;
        }
        if (authUser.district && prev.district !== authUser.district) {
          next.district = authUser.district;
          changed = true;
        }
        return changed ? next : prev;
      });
    }
  }, [authUser, setProfile]);

  const categoryOptions: { value: BeneficiaryCategory; label: string; desc: string; corporation: string }[] = [
    {
      value: 'SC',
      label: isHindi ? 'अनुसूचित जाति (SC)' : 'Scheduled Caste (SC)',
      desc: isHindi ? 'राष्ट्रीय अनुसूचित जाति वित्त निगम (NSFDC) द्वारा समर्थित' : 'Financed via NSFDC schemes',
      corporation: 'NSFDC'
    },
    {
      value: 'OBC',
      label: isHindi ? 'अन्य पिछड़ा वर्ग (OBC)' : 'Other Backward Classes (OBC)',
      desc: isHindi ? 'राष्ट्रीय पिछड़ा वर्ग वित्त निगम (NBCFDC) द्वारा समर्थित' : 'Financed via NBCFDC schemes',
      corporation: 'NBCFDC'
    },
    {
      value: 'SAFAI_KARAMCHARI',
      label: isHindi ? 'सफाई कर्मचारी / आश्रित' : 'Safai Karamchari & Dependents',
      desc: isHindi ? 'राष्ट्रीय सफाई कर्मचारी वित्त निगम (NSKFDC) द्वारा समर्थित' : 'Financed via NSKFDC schemes',
      corporation: 'NSKFDC'
    },
    {
      value: 'OPEN',
      label: isHindi ? 'सामान्य / अन्य वर्ग' : 'General / Open Category',
      desc: isHindi ? 'सामान्य योजनाएं एवं कौशल विकास कार्यक्रम' : 'Skill training & open schemes',
      corporation: 'OPEN'
    }
  ];

  const purposeOptions: { value: ProjectPurpose; label: string; icon: any; typicalRange: string }[] = [
    {
      value: 'SMALL_BUSINESS',
      label: isHindi ? 'किराना / रिटेल / लघु उद्यम' : 'Retail Shop / MSME / Services',
      icon: Store,
      typicalRange: '₹50,000 – ₹15,00,000'
    },
    {
      value: 'AGRICULTURE',
      label: isHindi ? 'कृषि / डेयरी / पशुपालन' : 'Agriculture & Dairy Farming',
      icon: Tractor,
      typicalRange: '₹50,000 – ₹5,00,000'
    },
    {
      value: 'GREEN_BUSINESS',
      label: isHindi ? 'ई-रिक्शा / सौर ऊर्जा / हरित व्यवसाय' : 'E-Rickshaw / Solar / Green Tech',
      icon: Zap,
      typicalRange: '₹1,50,000 – ₹27,00,000'
    },
    {
      value: 'WOMEN_MICROCREDIT',
      label: isHindi ? 'महिला सिलाई / स्वयं सहायता / बुटीक' : 'Women Micro-Credit / Tailoring',
      icon: Scissors,
      typicalRange: '₹20,000 – ₹2,00,000'
    },
    {
      value: 'SANITATION_REHAB',
      label: isHindi ? 'सफाई यंत्रीकरण / सुरक्षा वाहन' : 'Sanitation Mechanization & Safety',
      icon: Truck,
      typicalRange: '₹2,00,000 – ₹50,00,000'
    },
    {
      value: 'SKILL_TRAINING',
      label: isHindi ? 'निःशुल्क कौशल प्रशिक्षण एवं वजीफा' : 'Free Skill Training & Stipend',
      icon: GraduationCap,
      typicalRange: '100% Free (₹1500/mo stipend)'
    }
  ];

  const districtsByState: Record<string, string[]> = {
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Ujjain', 'Gwalior', 'Jabalpur'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj'],
    'Maharashtra': ['Nagpur', 'Mumbai', 'Pune', 'Nashik', 'Aurangabad'],
    'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'West Delhi'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur']
  };

  // Ensure any registered state is available in state dropdown
  const stateOptions = Array.from(new Set([
    ...Object.keys(districtsByState),
    ...(profile.state ? [profile.state] : []),
    ...(authUser?.state ? [authUser.state] : [])
  ]));

  // Ensure any registered district is available in district dropdown for current state
  const districtOptions = Array.from(new Set([
    ...(districtsByState[profile.state] || ['Indore']),
    ...(profile.district ? [profile.district] : []),
    ...(authUser?.district && (authUser.state === profile.state || !authUser.state) ? [authUser.district] : [])
  ]));

  const handleNext = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      onEvaluate();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Registration Sync Banner */}
      {authUser && authUser.role === 'CITIZEN' && (
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'स'}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900">{profile.name}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {isHindi ? 'पंजीकृत विवरण स्वतः भरे गए' : 'Registration Auto-Filled'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isHindi 
                  ? `आपकी श्रेणी (${profile.category}) और स्थान (${profile.district}, ${profile.state}) पूर्व-पंजीकरण से स्वतः भरे गए हैं।` 
                  : `Your category (${profile.category}), state (${profile.state}), and district (${profile.district}) have been pre-filled from registration.`}
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center space-x-1 text-xs text-emerald-800 font-semibold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? '3 विवरण स्वतः भरे' : '3 Fields Pre-filled'}</span>
          </div>
        </div>
      )}

      {/* Voice Prompt Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-orange-500/10 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {isHindi ? 'लिखने में असुविधा? बोलकर जानकारी दर्ज करें' : 'Prefer not to type? Use Voice-Guided Onboarding'}
            </h4>
            <p className="text-xs text-slate-600">
              {isHindi ? 'ध्वनि सहायक आपकी भाषा में प्रश्न पूछेगा और स्वतः फॉर्म भरेगा' : 'Voice assistant speaks questions in Hindi/English with large accessible cards'}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenVoiceModal}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition flex items-center space-x-1.5 shrink-0"
        >
          <Mic className="w-4 h-4" />
          <span>{isHindi ? 'ध्वनि मोड शुरू करें' : 'Launch Voice Mode'}</span>
        </button>
      </div>

      {/* Wizard Card Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Step Indicator Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                {isHindi ? `चरण ${activeStep} / 3` : `Step ${activeStep} of 3`}
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-sans">
            {activeStep === 1 && t.step1Title}
            {activeStep === 2 && t.step2Title}
            {activeStep === 3 && t.step3Title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {activeStep === 1 && t.step1Subtitle}
            {activeStep === 2 && t.step2Subtitle}
            {activeStep === 3 && t.step3Subtitle}
          </p>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
            {[
              { num: 1, label: isHindi ? 'सामाजिक वर्ग' : 'Demographics', icon: UserCheck },
              { num: 2, label: isHindi ? 'उद्देश्य एवं ऋण' : 'Project & Loan', icon: Briefcase },
              { num: 3, label: isHindi ? 'स्थान एवं सत्यापन' : 'Location', icon: MapPin }
            ].map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                    isActive
                      ? 'bg-orange-500/20 border-orange-500 text-white font-semibold'
                      : isPast
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-orange-500 text-white' : isPast ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isPast ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span className="text-xs truncate hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* STEP 1: DEMOGRAPHICS */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Category Cards with Auto-fill indicator */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t.categoryLabel} <span className="text-rose-500">*</span>
                  </label>
                  {authUser?.category && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{isHindi ? 'पंजीकरण से स्वतः चयनित' : 'Auto-selected from your registration'}</span>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryOptions.map((opt) => {
                    const isSelected = profile.category === opt.value;
                    const isAutofilled = authUser?.category === opt.value;

                    return (
                      <div
                        key={opt.value}
                        onClick={() => setProfile({ ...profile, category: opt.value })}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-200'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                            {isAutofilled && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ {isHindi ? 'पंजीकृत' : 'Registered'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {opt.corporation}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gender & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    {t.genderLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'FEMALE', label: isHindi ? 'महिला (Female)' : 'Female' },
                      { val: 'MALE', label: isHindi ? 'पुरुष (Male)' : 'Male' },
                      { val: 'OTHER', label: isHindi ? 'अन्य (Others)' : 'Others' }
                    ].map((g) => (
                      <button
                        key={g.val}
                        type="button"
                        onClick={() => setProfile({ ...profile, gender: g.val as any })}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                          profile.gender === g.val || (g.val === 'OTHER' && (profile.gender === 'TRANSGENDER' || profile.gender === 'OTHER'))
                            ? 'border-orange-500 bg-orange-50 text-orange-800'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    {t.ageLabel} ({profile.age} {isHindi ? 'वर्ष' : 'Years'})
                  </label>
                  <input
                    type="range"
                    min={18}
                    max={65}
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>18 {isHindi ? 'वर्ष' : 'Yrs'}</span>
                    <span className="font-bold text-orange-600">{profile.age} {isHindi ? 'वर्ष' : 'Yrs'}</span>
                    <span>65 {isHindi ? 'वर्ष' : 'Yrs'}</span>
                  </div>
                </div>
              </div>

              {/* Differently-abled toggle */}
              <div className="pt-2">
                <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={profile.isDifferentlyAbled}
                    onChange={(e) => setProfile({ ...profile, isDifferentlyAbled: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 accent-orange-600"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {isHindi 
                      ? 'दिव्यांगजन आवेदक (विशेष रियायती ब्याज दर एवं प्राथमिकता हेतु)' 
                      : 'Differently-Abled (Divyangjan) Applicant (eligible for priority quotas & concessions)'}
                  </span>
                </label>
              </div>

            </div>
          )}

          {/* STEP 2: PROJECT & LOAN */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Purpose Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  {t.purposeLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {purposeOptions.map((p) => {
                    const Icon = p.icon;
                    const isSelected = profile.purpose === p.value;
                    return (
                      <div
                        key={p.value}
                        onClick={() => {
                          setProfile({ 
                            ...profile, 
                            purpose: p.value,
                            gender: p.value === 'WOMEN_MICROCREDIT' ? 'FEMALE' : profile.gender 
                          });
                        }}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-200'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-2">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xs text-slate-900 mb-1">{p.label}</span>
                        <span className="text-[10px] text-slate-500">{p.typicalRange}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Annual Family Income Slider */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t.incomeLabel}
                  </label>
                  <span className="text-base font-extrabold text-orange-600 bg-white px-3 py-1 rounded-lg border border-orange-200 shadow-sm">
                    ₹{(profile.annualFamilyIncome / 100000).toFixed(2)} Lakh
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={600000}
                  step={10000}
                  value={profile.annualFamilyIncome}
                  onChange={(e) => setProfile({ ...profile, annualFamilyIncome: Number(e.target.value) })}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>₹0.50 L (BPL)</span>
                  <span className="font-bold text-amber-700">₹3.00 L (MoSJE Cap)</span>
                  <span>₹6.00 L</span>
                </div>
                {profile.annualFamilyIncome > 300000 && (
                  <div className="mt-2 text-[11px] text-amber-800 bg-amber-100/70 p-2 rounded-lg flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                    <span>
                      {isHindi 
                        ? 'सूचना: अधिकांश NSFDC/NBCFDC योजनाओं में ₹3 लाख की वार्षिक आय सीमा है। यह डेमो में गैप-टू-एलिजिबिलिटी विश्लेषण सक्रिय करेगा।' 
                        : 'Notice: Most MoSJE credit schemes have an income ceiling of ₹3.00 Lakh. This activates the Near Miss report to demonstrate the gap.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Project Cost & Loan Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {t.projectCostLabel}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={profile.projectCost}
                      onChange={(e) => {
                        const cost = Number(e.target.value);
                        setProfile({ 
                          ...profile, 
                          projectCost: cost,
                          loanAmountRequested: Math.min(profile.loanAmountRequested, cost)
                        });
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    = ₹{(profile.projectCost / 100000).toFixed(2)} Lakh
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {t.loanRequestedLabel}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={profile.loanAmountRequested}
                      onChange={(e) => setProfile({ ...profile, loanAmountRequested: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    = ₹{(profile.loanAmountRequested / 100000).toFixed(2)} Lakh (Max 90% of project cost)
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: LOCATION & VERIFICATION */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {isHindi ? 'गृह राज्य एवं जिला' : 'Location Details'}
                  </span>
                  {(authUser?.state || authUser?.district) && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>
                        {isHindi ? 'पंजीकरण से स्वतः भरा गया:' : 'Auto-filled from registration:'} <strong>{profile.district}, {profile.state}</strong>
                      </span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      {t.stateLabel} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={profile.state}
                      onChange={(e) => {
                        const newState = e.target.value;
                        const dists = districtsByState[newState] || ['Indore'];
                        setProfile({ ...profile, state: newState, district: dists[0] });
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white cursor-pointer"
                    >
                      {stateOptions.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      {t.districtLabel} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={profile.district}
                      onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white cursor-pointer"
                    >
                      {districtOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary Profile Preview */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  {isHindi ? 'सत्यापन सारांश' : 'Applicant Verification Summary'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t.categoryLabel}</span>
                    <span className="font-bold text-slate-800">{profile.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.incomeLabel}</span>
                    <span className="font-bold text-slate-800">₹{(profile.annualFamilyIncome / 100000).toFixed(2)} Lakh</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.purposeLabel}</span>
                    <span className="font-bold text-slate-800">{profile.purpose.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.loanRequestedLabel}</span>
                    <span className="font-bold text-orange-600">₹{(profile.loanAmountRequested / 100000).toFixed(2)} Lakh</span>
                  </div>
                </div>
              </div>

              {/* Consent check */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start space-x-2.5 text-xs text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? 'मैं प्रमाणित करता/करती हूँ कि दी गई जानकारी सत्य है। DPDP अधिनियम 2023 के तहत केवल योजना मिलान हेतु उपयोग की सहमति है।'
                    : 'I declare that the details provided are accurate. I grant statutory consent under DPDP Act 2023 strictly for eligibility evaluation.'}
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Footer Navigation */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-200 flex items-center justify-between">
          {activeStep > 1 ? (
            <button
              onClick={() => setActiveStep(activeStep - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition"
            >
              {isHindi ? '← पिछला चरण' : '← Back'}
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/30 transition flex items-center space-x-2"
          >
            <span>
              {activeStep === 3 ? t.checkEligibilityBtn : (isHindi ? 'अगला चरण →' : 'Next Step →')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
