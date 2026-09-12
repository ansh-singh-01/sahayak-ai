import React, { useState, useEffect } from 'react';
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
  Mic,
  Volume2,
  VolumeX,
  CheckCircle2,
  Users,
  RotateCcw,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { CitizenProfile } from '../../types/user';
import { BeneficiaryCategory, ProjectPurpose } from '../../types/scheme';
import { Language, TRANSLATIONS, isIndicLanguage } from '../../services/i18nService';
import { AuthUser } from '../../types/auth';
import { speakQuestion, stopSpeaking } from '../../lib/accessibility/speak';
import { RangeIconPicker } from './RangeIconPicker';

interface CitizenWizardProps {
  profile: CitizenProfile;
  setProfile: React.Dispatch<React.SetStateAction<CitizenProfile>>;
  authUser?: AuthUser | null;
  onEvaluate: () => void;
  language: Language;
  onOpenVoiceModal: () => void;
  initialProxyMode?: boolean;
  submittedByAgentId?: string;
}

export const CitizenWizard: React.FC<CitizenWizardProps> = ({
  profile,
  setProfile,
  authUser,
  onEvaluate,
  language,
  onOpenVoiceModal,
  initialProxyMode = false,
  submittedByAgentId
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isProxyMode, setIsProxyMode] = useState<boolean>(initialProxyMode);
  const [proxyRelation, setProxyRelation] = useState<string>('Family Member');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [confirmData, setConfirmData] = useState<{ summary: string; audioPrompt: string; nextAction: () => void } | null>(null);
  const [isVoiceTypingName, setIsVoiceTypingName] = useState<boolean>(false);

  // Audio Guidance Auto-Play Toggle (Persistent across wizard steps)
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sahayak_wizard_audio');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleAudio = () => {
    setIsAudioEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sahayak_wizard_audio', String(next));
      } catch {}
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  };
  const t = TRANSLATIONS[language];
  const isEnglish = language === 'en';
  const isMarathi = language === 'mr';
  const isIndic = isIndicLanguage(language);
  const isHindi = !isEnglish;


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
      label: isEnglish 
        ? 'Scheduled Caste / Scheduled Tribe (SC/ST)' 
        : (isMarathi ? 'अनुसूचित जाती / जमाती (SC/ST)' : 'अनुसूचित जाति / जनजाति (SC/ST)'),
      desc: isEnglish 
        ? 'Financed via NSFDC schemes' 
        : (isMarathi ? 'राष्ट्रीय अनुसूचित जाती वित्त महामंडळ (NSFDC) द्वारे समर्थित' : 'राष्ट्रीय अनुसूचित जाति वित्त निगम (NSFDC) द्वारा समर्थित'),
      corporation: 'NSFDC'
    },
    {
      value: 'OBC',
      label: isEnglish 
        ? 'Other Backward Classes (OBC)' 
        : (isMarathi ? 'इतर मागासवर्ग (OBC)' : 'अन्य पिछड़ा वर्ग (OBC)'),
      desc: isEnglish 
        ? 'Financed via NBCFDC schemes' 
        : (isMarathi ? 'राष्ट्रीय इतर मागासवर्ग वित्त महामंडळ (NBCFDC) द्वारे समर्थित' : 'राष्ट्रीय पिछड़ा वर्ग वित्त निगम (NBCFDC) द्वारा समर्थित'),
      corporation: 'NBCFDC'
    },
    {
      value: 'SAFAI_KARAMCHARI',
      label: isEnglish 
        ? 'Safai Karamchari & Dependents' 
        : (isMarathi ? 'सफाई कर्मचारी व आश्रित' : 'सफाई कर्मचारी / आश्रित'),
      desc: isEnglish 
        ? 'Financed via NSKFDC schemes' 
        : (isMarathi ? 'राष्ट्रीय सफाई कर्मचारी वित्त महामंडळ (NSKFDC) द्वारे समर्थित' : 'राष्ट्रीय सफाई कर्मचारी वित्त निगम (NSKFDC) द्वारा समर्थित'),
      corporation: 'NSKFDC'
    },
    {
      value: 'OPEN',
      label: isEnglish 
        ? 'General / Open Category' 
        : (isMarathi ? 'सामान्य / खुला प्रवर्ग' : 'सामान्य / अन्य वर्ग'),
      desc: isEnglish 
        ? 'Skill training & open schemes' 
        : (isMarathi ? 'कौशल्य प्रशिक्षण व खुल्या योजना' : 'सामान्य योजनाएं एवं कौशल विकास कार्यक्रम'),
      corporation: 'OPEN'
    }
  ];

  const purposeOptions: { value: ProjectPurpose; label: string; icon: any; typicalRange: string }[] = [
    {
      value: 'SMALL_BUSINESS',
      label: isEnglish 
        ? 'Retail Shop / MSME / Services' 
        : (isMarathi ? 'किराणा / किरकोळ दुकान / लघु व्यवसाय' : 'किराना / रिटेल / लघु उद्यम'),
      icon: Store,
      typicalRange: '₹50,000 – ₹15,00,000'
    },
    {
      value: 'AGRICULTURE',
      label: isEnglish 
        ? 'Agriculture & Dairy Farming' 
        : (isMarathi ? 'शेती / दुग्धव्यवसाय / पशुपालन' : 'कृषि / डेयरी / पशुपालन'),
      icon: Tractor,
      typicalRange: '₹50,000 – ₹5,00,000'
    },
    {
      value: 'GREEN_BUSINESS',
      label: isEnglish 
        ? 'E-Rickshaw / Solar / Green Tech' 
        : (isMarathi ? 'ई-रिक्षा / सौर ऊर्जा / हरित व्यवसाय' : 'ई-रिक्शा / सौर ऊर्जा / हरित व्यवसाय'),
      icon: Zap,
      typicalRange: '₹1,50,000 – ₹27,00,000'
    },
    {
      value: 'WOMEN_MICROCREDIT',
      label: isEnglish 
        ? 'Women Micro-Credit / Tailoring' 
        : (isMarathi ? 'महिला शिवणकाम / बचत गट / बुटीक' : 'महिला सिलाई / स्वयं सहायता / बुटीक'),
      icon: Scissors,
      typicalRange: '₹20,000 – ₹2,00,000'
    },
    {
      value: 'SANITATION_REHAB',
      label: isEnglish 
        ? 'Sanitation Mechanization & Safety' 
        : (isMarathi ? 'स्वच्छता यांत्रिकीकरण व सुरक्षा वाहने' : 'सफाई यंत्रीकरण / सुरक्षा वाहन'),
      icon: Truck,
      typicalRange: '₹2,00,000 – ₹50,00,000'
    },
    {
      value: 'SKILL_TRAINING',
      label: isEnglish 
        ? 'Free Skill Training & Stipend' 
        : (isMarathi ? 'विनामूल्य कौशल्य प्रशिक्षण व विद्यावेतन' : 'निःशुल्क कौशल प्रशिक्षण एवं वजीफा'),
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

  const getQuestionTextForStep = (step: number, lang: Language, proxy: boolean): string => {
    if (lang === 'en') {
      if (step === 1) {
        return proxy
          ? 'Who are you filling this for? Please select their beneficiary category and age.'
          : 'Please select your beneficiary category and age.';
      }
      if (step === 2) {
        return proxy
          ? 'What is the purpose of the loan for the applicant? Select income and loan amount.'
          : 'What is the purpose of your loan? Select your annual family income and requested amount.';
      }
      return 'Please select your home state and district, and confirm your details.';
    }

    if (lang === 'mr') {
      if (step === 1) {
        return proxy
          ? 'आपण कोणासाठी अर्ज भरत आहात? लाभार्थ्याचा सामाजिक प्रवर्ग आणि वय निवडा.'
          : 'कृपया आपला सामाजिक प्रवर्ग आणि वय निवडा.';
      }
      if (step === 2) {
        return proxy
          ? 'लाभार्थी कोणत्या उद्देशासाठी कर्ज इच्छितात? अपेक्षित उत्पन्न आणि कर्ज रक्कम निवडा.'
          : 'आपण कोणत्या उद्देशासाठी कर्ज इच्छिता? आपले वार्षिक कौटुंबिक उत्पन्न आणि अपेक्षित कर्ज रक्कम निवडा.';
      }
      return 'कृपया आपले राज्य आणि जिल्हा निवडा आणि तपशीलांची पुष्टी करा.';
    }

    // Default to Hindi for 'hi' and all other Indic languages
    if (step === 1) {
      return proxy
        ? 'आप किसके लिए आवेदन भर रहे हैं? लाभार्थी का सामाजिक वर्ग और आयु चुनें।'
        : 'कृपया अपना सामाजिक वर्ग और आयु चुनें।';
    }
    if (step === 2) {
      return proxy
        ? 'लाभार्थी किस उद्देश्य के लिए ऋण चाहते हैं? अपेक्षित आय और ऋण राशि चुनें।'
        : 'आप किस उद्देश्य के लिए ऋण चाहते हैं? अपनी वार्षिक पारिवारिक आय और ऋण राशि चुनें।';
    }
    return 'कृपया अपना गृह राज्य और जिला चुनें और सारांश की पुष्टि करें।';
  };

  const handleNextWithConfirm = () => {
    // Generate confirm summary and audio prompt for current step
    let summary = '';
    let audioPrompt = '';

    if (activeStep === 1) {
      const catLabel = categoryOptions.find(c => c.value === profile.category)?.label || profile.category;
      if (isEnglish) {
        summary = isProxyMode 
          ? `Beneficiary: ${catLabel}, Age: ${profile.age} yrs, Gender: ${profile.gender}`
          : `Category: ${catLabel}, Age: ${profile.age} yrs, Gender: ${profile.gender}`;
        audioPrompt = `You selected: ${catLabel}, age ${profile.age} years. Is this correct?`;
      } else if (isMarathi) {
        summary = isProxyMode 
          ? `लाभार्थी प्रवर्ग: ${catLabel}, वय: ${profile.age} वर्षे, लिंग: ${profile.gender}`
          : `प्रवर्ग: ${catLabel}, वय: ${profile.age} वर्षे, लिंग: ${profile.gender}`;
        audioPrompt = `तुम्ही निवडले आहे: ${catLabel}, वय ${profile.age} वर्षे. हे बरोबर आहे का?`;
      } else {
        summary = isProxyMode 
          ? `लाभार्थी वर्ग: ${catLabel}, आयु: ${profile.age} वर्ष, लिंग: ${profile.gender}`
          : `वर्ग: ${catLabel}, आयु: ${profile.age} वर्ष, लिंग: ${profile.gender}`;
        audioPrompt = `आपने चुना है: ${catLabel}, आयु ${profile.age} वर्ष। क्या यह सही है?`;
      }
    } else if (activeStep === 2) {
      const pLabel = purposeOptions.find(p => p.value === profile.purpose)?.label || profile.purpose;
      const incomeLakh = (profile.annualFamilyIncome / 100000).toFixed(2);
      const loanLakh = (profile.loanAmountRequested / 100000).toFixed(2);
      if (isEnglish) {
        summary = `Purpose: ${pLabel}, Income: ₹${incomeLakh}L, Loan: ₹${loanLakh}L`;
        audioPrompt = `You selected: ${pLabel}, annual income ${incomeLakh} Lakh, loan requested ${loanLakh} Lakh. Is this correct?`;
      } else if (isMarathi) {
        summary = `उद्देश: ${pLabel}, वार्षिक उत्पन्न: ₹${incomeLakh} लाख, कर्ज: ₹${loanLakh} लाख`;
        audioPrompt = `तुम्ही निवडले आहे: उद्देश ${pLabel}, वार्षिक उत्पन्न ${incomeLakh} लाख, आणि कर्ज ${loanLakh} लाख. हे बरोबर आहे का?`;
      } else {
        summary = `उद्देश्य: ${pLabel}, वार्षिक आय: ₹${incomeLakh}L, ऋण: ₹${loanLakh}L`;
        audioPrompt = `आपने चुना है: उद्देश्य ${pLabel}, वार्षिक आय ${incomeLakh} लाख, और ऋण ${loanLakh} लाख। क्या यह सही है?`;
      }
    } else {
      if (isEnglish) {
        summary = `Location: ${profile.district}, ${profile.state}`;
        audioPrompt = `Location: ${profile.district}, ${profile.state}. Proceed to evaluate eligibility?`;
      } else if (isMarathi) {
        summary = `स्थान: ${profile.district}, ${profile.state}`;
        audioPrompt = `स्थान ${profile.district}, ${profile.state}. पात्रता तपासणी सुरू करायची का?`;
      } else {
        summary = `स्थान: ${profile.district}, ${profile.state}`;
        audioPrompt = `स्थान ${profile.district}, ${profile.state}। पात्रता जांच शुरू करें?`;
      }
    }

    setConfirmData({
      summary,
      audioPrompt,
      nextAction: () => {
        setIsConfirming(false);
        if (activeStep < 3) {
          setActiveStep(activeStep + 1);
        } else {
          onEvaluate();
        }
      }
    });
    setIsConfirming(true);
    speakQuestion(audioPrompt, language);
  };

  // Autoplay question on step change (if audio is enabled)
  useEffect(() => {
    if (!isAudioEnabled) {
      stopSpeaking();
      return;
    }

    const questionText = getQuestionTextForStep(activeStep, language, isProxyMode);
    
    // Slight timeout so DOM mounts smoothly
    const timer = setTimeout(() => {
      speakQuestion(questionText, language);
    }, 350);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [activeStep, isProxyMode, language, isAudioEnabled]);

  const handleReplayQuestion = () => {
    const questionText = getQuestionTextForStep(activeStep, language, isProxyMode);
    speakQuestion(questionText, language);
  };

  const handleVoiceTypingName = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isEnglish ? 'Voice typing is not supported in this browser.' : (isMarathi ? 'तुमच्या ब्राउझरमध्ये व्हॉइस टायपिंग समर्थित नाही.' : 'आपके ब्राउज़र में वॉइस टाइपिंग समर्थित नहीं है।'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isEnglish ? 'en-IN' : (isMarathi ? 'mr-IN' : 'hi-IN');
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsVoiceTypingName(true);

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setProfile(prev => ({ ...prev, name: spokenText }));
        setIsVoiceTypingName(false);
      };

      recognition.onerror = () => {
        setIsVoiceTypingName(false);
      };

      recognition.onend = () => {
        setIsVoiceTypingName(false);
      };

      recognition.start();
    } catch {
      setIsVoiceTypingName(false);
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
              {isEnglish 
                ? 'Prefer not to type? Use Voice-Guided Onboarding' 
                : (isMarathi ? 'टाइप करणे कठीण वाटते? बोलून माहिती भरा' : 'लिखने में असुविधा? बोलकर जानकारी दर्ज करें')}
            </h4>
            <p className="text-xs text-slate-600">
              {isEnglish 
                ? 'Voice assistant speaks questions in Hindi/English with large accessible cards' 
                : (isMarathi ? 'आवाज सहाय्यक तुमच्या भाषेत प्रश्न विचारेल आणि कार्ड्स दाखवेल' : 'ध्वनि सहायक आपकी भाषा में प्रश्न पूछेगा और स्वतः फॉर्म भरेगा')}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenVoiceModal}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition flex items-center space-x-1.5 shrink-0"
        >
          <Mic className="w-4 h-4" />
          <span>{isEnglish ? 'Launch Voice Mode' : (isMarathi ? 'आवाज मोड सुरू करा' : 'ध्वनि मोड शुरू करें')}</span>
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
                {isEnglish ? `Step ${activeStep} of 3` : (isMarathi ? `पायरी ${activeStep} / 3` : `चरण ${activeStep} / 3`)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {/* Audio Guidance Mute/Unmute Toggle Button */}
              <button
                onClick={toggleAudio}
                type="button"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  isAudioEnabled
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-700/80'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                }`}
                title={isAudioEnabled 
                  ? (isEnglish ? 'Disable Voice Auto-Play' : (isMarathi ? 'आवाज ऑटो-प्ले बंद करा' : 'ऑडियो ऑटो-प्ले बंद करें')) 
                  : (isEnglish ? 'Enable Voice Auto-Play' : (isMarathi ? 'आवाज ऑटो-प्ले चालू करा' : 'ऑडियो ऑटो-प्ले चालू करें'))}
              >
                {isAudioEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isEnglish ? 'Audio ON' : (isMarathi ? 'ध्वनी चालू' : 'ध्वनि चालू')}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEnglish ? 'Mute' : (isMarathi ? 'ध्वनी बंद' : 'ध्वनि बंद')}</span>
                  </>
                )}
              </button>

              {/* Replay Question Button */}
              <button
                onClick={handleReplayQuestion}
                type="button"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                title={isEnglish ? 'Listen to question again' : (isMarathi ? 'प्रश्न पुन्हा ऐका' : 'प्रश्न दोबारा सुनें')}
              >
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                <span>{isEnglish ? 'Listen' : (isMarathi ? 'ऐका' : 'प्रश्न सुनें')}</span>
              </button>
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
              { num: 1, label: isEnglish ? 'Demographics' : (isMarathi ? 'सामाजिक प्रवर्ग' : 'सामाजिक वर्ग'), icon: UserCheck },
              { num: 2, label: isEnglish ? 'Project & Loan' : (isMarathi ? 'प्रकल्प व कर्ज' : 'उद्देश्य एवं ऋण'), icon: Briefcase },
              { num: 3, label: isEnglish ? 'Location' : (isMarathi ? 'स्थान व पडताळणी' : 'स्थान एवं सत्यापन'), icon: MapPin }
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
              
              {/* Assisted / Proxy Fill Mode Toggle */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      {isHindi ? 'क्या आप किसी अन्य व्यक्ति के लिए आवेदन कर रहे हैं? (सहायक मोड)' : 'Filling this in for someone else? (Assisted / Proxy Mode)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isProxyMode 
                        ? (isHindi ? 'तृतीय-पक्ष मोड सक्रिय: प्रश्न लाभार्थी के संदर्भ में पूछे जा रहे हैं' : 'Proxy mode active: phrasing adapted for beneficiary representation') 
                        : (isHindi ? 'परिवार के सदस्य, फील्ड कार्यकर्ता या CSC ऑपरेटर हेतु' : 'For family members, field workers, or CSC VLE operators')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  {submittedByAgentId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Operator: {submittedByAgentId}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsProxyMode(!isProxyMode)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                      isProxyMode
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {isProxyMode ? (isHindi ? '✓ सहायक मोड सक्रिय' : '✓ Assisted Mode Active') : (isHindi ? '+ सहायक मोड सक्षम करें' : '+ Enable Assisted Mode')}
                  </button>
                </div>
              </div>

              {/* Beneficiary Name & Proxy Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {isProxyMode ? (isHindi ? 'लाभार्थी का नाम' : 'Beneficiary Name') : (isHindi ? 'आवेदक का नाम' : 'Applicant Full Name')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder={isHindi ? 'पूरा नाम दर्ज करें...' : 'Enter full name...'}
                      className="w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceTypingName}
                      className={`absolute right-2 top-2 p-1.5 rounded-lg transition ${
                        isVoiceTypingName ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                      title={isHindi ? 'बोलकर नाम लिखें' : 'Speak to enter name'}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isProxyMode && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {isHindi ? 'लाभार्थी से संबंध' : 'Relationship to Beneficiary'}
                    </label>
                    <select
                      value={proxyRelation}
                      onChange={(e) => setProxyRelation(e.target.value)}
                      className="w-full py-2.5 px-3 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                      <option value="Family Member">{isHindi ? 'परिवार का सदस्य (माता/पिता/संतान/जीवनसाथी)' : 'Family Member (Parent/Spouse/Child)'}</option>
                      <option value="CSC Field Operator">{isHindi ? 'सीएससी / वीएलई ऑपरेटर (CSC / VLE)' : 'CSC / VLE Field Operator'}</option>
                      <option value="SHG / NGO Worker">{isHindi ? 'स्वयं सहायता समूह / एनजीओ कार्यकर्ता' : 'SHG / NGO Worker'}</option>
                      <option value="Neighbor / Community Volunteer">{isHindi ? 'पड़ोसी / समुदाय स्वयंसेवक' : 'Neighbor / Community Volunteer'}</option>
                    </select>
                  </div>
                )}
              </div>

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

              {/* Annual Family Income Stepped Range & Fine-Tuning */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <RangeIconPicker
                  mode="INCOME"
                  value={profile.annualFamilyIncome}
                  onChange={(val) => setProfile({ ...profile, annualFamilyIncome: val })}
                  language={language}
                />
                {profile.annualFamilyIncome > 300000 && (
                  <div className="mt-3 text-[11px] text-amber-800 bg-amber-100/70 p-2.5 rounded-xl flex items-center space-x-2">
                    <Info className="w-4 h-4 shrink-0 text-amber-700" />
                    <span>
                      {isHindi 
                        ? 'सूचना: अधिकांश NSFDC/NBCFDC योजनाओं में ₹3 लाख की वार्षिक आय सीमा है। यह डेमो में गैप-टू-एलिजिबिलिटी विश्लेषण सक्रिय करेगा।' 
                        : 'Notice: Most MoSJE credit schemes have an income ceiling of ₹3.00 Lakh. This activates the Near Miss report to demonstrate the gap.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Project Cost & Loan Amount with Stepped Range Picker */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <RangeIconPicker
                    mode="LOAN"
                    value={profile.loanAmountRequested}
                    onChange={(val) => {
                      setProfile({
                        ...profile,
                        loanAmountRequested: val,
                        projectCost: Math.max(profile.projectCost, Math.round(val / 0.9))
                      });
                    }}
                    language={language}
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t.projectCostLabel} (Estimated Total)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {isHindi ? 'परियोजना की कुल अनुमानित लागत (ऋण अनुरोध का 100%)' : 'Estimated total cost (Self-contribution + Scheme loan)'}
                    </span>
                  </div>
                  <div className="relative w-full sm:w-48">
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

              {/* Consent check & Agent Audit info */}
              <div className="space-y-2">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start space-x-2.5 text-xs text-emerald-900">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {isHindi
                      ? 'मैं प्रमाणित करता/करती हूँ कि दी गई जानकारी सत्य है। DPDP अधिनियम 2023 के तहत केवल योजना मिलान हेतु उपयोग की सहमति है।'
                      : 'I declare that the details provided are accurate. I grant statutory consent under DPDP Act 2023 strictly for eligibility evaluation.'}
                  </span>
                </div>

                {(submittedByAgentId || isProxyMode) && (
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        <strong>Assisted Audit Tag:</strong> Submitted on behalf of beneficiary via {submittedByAgentId || 'CSC-VLE-8842'} (Rel: {proxyRelation})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      DPDP S-7(g) Proxy Verified
                    </span>
                  </div>
                )}
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
              {isEnglish ? '← Back' : (isMarathi ? '← मागील पायरी' : '← पिछला चरण')}
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNextWithConfirm}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/30 transition flex items-center space-x-2"
          >
            <span>
              {activeStep === 3 ? t.checkEligibilityBtn : (isEnglish ? 'Next Step →' : (isMarathi ? 'पुढील पायरी →' : 'अगला चरण →'))}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Confirm Your Answer Back Modal (Audible & Visual) */}
      {isConfirming && confirmData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Volume2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  {isEnglish ? 'Audible Confirmation' : (isMarathi ? 'पुष्टीकरण चक्र (Confirm-Back)' : 'पुष्टिकरण चक्र (Confirm-Back)')}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {isEnglish ? 'Please Confirm Your Selection' : (isMarathi ? 'आपण नोंदवलेली माहिती बरोबर आहे का?' : 'क्या आपकी यह जानकारी सही है?')}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold leading-relaxed">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                {isEnglish ? 'Summary of Selection:' : (isMarathi ? 'नोंदवलेली माहिती:' : 'दर्ज की गई जानकारी:')}
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-900 shadow-2xs font-bold text-xs">
                {confirmData.summary}
              </div>
              <p className="text-xs text-slate-500 mt-2 italic flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>"{confirmData.audioPrompt}"</span>
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsConfirming(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
              >
                {isEnglish ? '✗ No, Change' : (isMarathi ? '✗ नाही, बदला' : '✗ नहीं, बदलें')}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  confirmData.nextAction();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEnglish ? '✓ Yes, That\'s Correct' : (isMarathi ? '✓ होय, अगदी बरोबर' : '✓ हाँ, बिल्कुल सही')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
