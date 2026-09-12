import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  User, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  KeyRound, 
  Smartphone,
  CheckSquare,
  Square,
  Scale,
  Volume2,
  VolumeX,
  Landmark,
  Award,
  FileText,
  BadgeCheck,
  HelpCircle,
  ChevronRight,
  Check,
  RefreshCw,
  Fingerprint,
  FileCheck2,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthUser, UserRole } from '../../types/auth';
import { BeneficiaryCategory } from '../../types/scheme';
import { CitizenProfile } from '../../types/user';
import { ApiClient } from '../../services/apiClient';
import { VoiceService } from '../../services/voiceService';
import { Language, TRANSLATIONS, getSpeechCode } from '../../services/i18nService';
import { InputOtp } from './InputOtp';

interface AuthPageProps {
  language: Language;
  authUser?: AuthUser | null;
  onLogout?: () => void;
  onLoginSuccess: (
    user: AuthUser, 
    demoProfile?: CitizenProfile,
    targetTab?: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth' | 'compare'
  ) => void;
  onNavigateHome: () => void;
  onOpenConsentModal: () => void;
  onSelectDemoProfile?: (profile: CitizenProfile) => void;
}

// Low-literacy spoken guidance across all 11 Indian languages (PRD §0, §9)
const AUDIO_INSTRUCTIONS: Record<Language, string> = {
  en: "Welcome to SAHAYAK, the official portal of the Ministry of Social Justice and Empowerment. Beneficiaries can enter their 10-digit mobile number to log in via OTP, or tap any of the one-click demo personas below. Channel partners and Ministry officials can sign in using their official credentials.",
  hi: "सहायक पोर्टल में आपका स्वागत है। सामाजिक न्याय एवं अधिकारिता मंत्रालय के इस पोर्टल पर नागरिक लाभार्थी अपना 10 अंकों का मोबाइल नंबर दर्ज कर ओटीपी से लॉगिन कर सकते हैं, या नीचे दिए गए 1-क्लिक डेमो लाभार्थी का चयन कर सकते हैं। चैनल पार्टनर और मंत्रालय अधिकारी अपने आधिकारिक क्रेडेंशियल से प्रवेश करें।",
  mr: "सामाजिक न्याय मंत्रालयाच्या सहाय्यक पोर्टलवर आपले स्वागत आहे. नागरिक लाभार्थी त्यांच्या 10-अंकी मोबाईल नंबरने ओटीपी द्वारे लॉगिन करू शकतात किंवा खालील 1-क्लिक डेमो प्रोफाईल निवडू शकतात.",
  gu: "સામાજિક ન્યાય મંત્રાલયના સહાયક પોર્ટલ પર આપનું સ્વાગત છે. નાગરિક લાભાર્થીઓ તેમના 10 અંકના મોબાઇલ નંબર પર ઓટીપી દ્વારા લૉગિન કરી શકે છે અથવા નીચે આપેલ 1-ક્લિક ડેમો પ્રોફાઇલ પસંદ કરી શકે છે.",
  ta: "சமூக நீதி அமைச்சகத்தின் சஹாயக் தளத்திற்கு வரவேற்கிறோம். பயனாளிகள் தங்கள் 10 இலக்க மொபைல் எண் மூலம் OTP பெற்று உள்நுழையலாம் அல்லது கீழே உள்ள மாதிரி சுயவிவரங்களை தேர்ந்தெடுக்கலாம்.",
  te: "సామాజిక న్యాయ మంత్రిత్వ శాఖ సహాయక్ పోర్టల్‌కు స్వాగతం. లబ్ధిదారులు తమ 10 అంకెల మొబైల్ నంబర్ ద్వారా OTP తో లాగిన్ కావచ్చు లేదా కింద ఉన్న 1-క్లిక్ డెమో ప్రొఫైల్‌ను ఎంచుకోవచ్చు.",
  bn: "সামাজিক ন্যায় ও ক্ষমতায়ন মন্ত্রকের সহায়ক পোর্টালে স্বাগতম। নাগরিকরা তাদের ১০ অঙ্কের মোবাইল নম্বর দিয়ে ওটিপির মাধ্যমে লগইন করতে পারেন অথবা নিচের ১-ক্লিক ডেমো প্রোফাইল বেছে নিতে পারেন।",
  kn: "ಸಾಮಾಜಿಕ ನ್ಯಾಯ ಸಚಿವಾಲಯದ ಸಹಾಯಕ್ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ. ಫಲಾನುಭವಿಗಳು ತಮ್ಮ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮೂಲಕ OTP ಯೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಬಹುದು ಅಥವಾ ಕೆಳಗಿನ 1-ಕ್ಲಿಕ್ ಡೆಮೊ ಪ್ರೊಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಬಹುದು.",
  pa: "ਸਮਾਜਿਕ ਨਿਆਂ ਮੰਤਰਾਲੇ ਦੇ ਸਹਾਇਕ ਪੋਰਟਲ 'ਤੇ ਜੀ ਆਇਆਂ ਨੂੰ। ਨਾਗਰਿਕ ਆਪਣੇ 10 ਅੰਕਾਂ ਦੇ ਮੋਬਾਈਲ ਨੰਬਰ ਰਾਹੀਂ ਓਟੀਪੀ ਨਾਲ ਲੌਗਇਨ ਕਰ ਸਕਦੇ ਹਨ ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੇ 1-ਕਲਿੱਕ ਡੈਮੋ ਪ੍ਰੋਫਾਈਲ ਦੀ ਚੋਣ ਕਰ ਸਕਦੇ ਹਨ।",
  ml: "സാമൂഹിക നീതി മന്ത്രാലയത്തിന്റെ സഹായക് പോർട്ടലിലേക്ക് സ്വാഗതം. ഗുണഭോക്താക്കൾക്ക് 10 അക്ക മൊബൈൽ നമ്പർ നൽകി ഒടിപി വഴി ലോഗിൻ ചെയ്യാം, അല്ലെങ്കിൽ താഴെയുള്ള 1-ക്ലിക്ക് ഡെമോ പ്രൊഫൈലുകൾ തിരഞ്ഞെടുക്കാം.",
  or: "ସାମାଜିକ ନ୍ୟାୟ ମନ୍ତ୍ରଣାଳୟର ସହାୟକ ପୋର୍ଟାଲକୁ ସ୍ଵାଗତ। ନାଗରିକମାନେ ନିଜର 10 ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର ସାହାଯ୍ୟରେ OTP ମାଧ୍ୟମରେ ଲଗଇନ୍ କରିପାରିବେ କିମ୍ବା ତଳେ ଥିବା 1-କ୍ଲିକ୍ ଡେମୋ ପ୍ରୋଫାଇଲ୍ ଚୟନ କରିପାରିବେ।"
};

export const AuthPage: React.FC<AuthPageProps> = ({
  language,
  authUser,
  onLogout,
  onLoginSuccess,
  onNavigateHome,
  onOpenConsentModal,
  onSelectDemoProfile
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  // State: Tab & Role
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('CITIZEN');

  // Sign In Form States
  const [phone, setPhone] = useState<string>('9876543210');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [simulatedOtp, setSimulatedOtp] = useState<string>('123456');
  const [citizenLoginName, setCitizenLoginName] = useState<string>('');

  // Sign Up Form States
  const [signupName, setSignupName] = useState<string>('');
  const [signupPhone, setSignupPhone] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupCategory, setSignupCategory] = useState<BeneficiaryCategory>('OBC');
  const [signupState, setSignupState] = useState<string>('Madhya Pradesh');
  const [signupDistrict, setSignupDistrict] = useState<string>('Indore');
  const [signupOtpSent, setSignupOtpSent] = useState<boolean>(false);
  const [signupEnteredOtp, setSignupEnteredOtp] = useState<string>('');
  const [signupSimulatedOtp, setSignupSimulatedOtp] = useState<string>('123456');
  const [dpdpConsent, setDpdpConsent] = useState<boolean>(true);

  // Post-Sign-In Onboarding Gateway State (PRD §4 & User Directive)
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(authUser || null);
  const [showPostLoginOptions, setShowPostLoginOptions] = useState<boolean>(false);

  // Sync state if user is logged out externally
  useEffect(() => {
    if (!authUser) {
      setShowPostLoginOptions(false);
      setAuthenticatedUser(null);
      setEnteredOtp('');
      setOtpSent(false);
      setSignupOtpSent(false);
      setSignupEnteredOtp('');
    } else if (authUser && !authenticatedUser) {
      setAuthenticatedUser(authUser);
    }
  }, [authUser]);

  // Status & Audio
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Stop voice speech on unmount
  useEffect(() => {
    return () => {
      VoiceService.stopSpeaking();
    };
  }, []);

  // Audio Guidance Handler (PRD §0, §9)
  const toggleAudioGuidance = () => {
    if (isPlayingAudio) {
      VoiceService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak = AUDIO_INSTRUCTIONS[language] || AUDIO_INSTRUCTIONS.en;
      VoiceService.speak(
        textToSpeak,
        getSpeechCode(language),
        () => setIsPlayingAudio(false)
      );
    }
  };

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg(isHindi ? 'कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    const res = await ApiClient.sendOtp(phone);
    setIsLoading(false);
    setOtpSent(true);
    if (res?.data?.simulatedOtp) {
      setSimulatedOtp(res.data.simulatedOtp);
    }
    setSuccessMsg(isHindi ? `ओटीपी +91 ${phone} पर भेजा गया।` : `OTP sent to +91 ${phone}.`);
  };

  // Verify OTP handler
  const handleVerifyOtp = async (overrideOtp?: string) => {
    const codeToVerify = overrideOtp || enteredOtp;
    if (!codeToVerify || codeToVerify.length < 6) {
      setErrorMsg(isHindi ? 'कृपया 6-अंकीय ओटीपी कोड दर्ज करें।' : 'Please enter the 6-digit OTP code.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    const res = await ApiClient.verifyOtp(phone, codeToVerify);
    setIsLoading(false);
    if (res.status === 'SUCCESS' && res.data?.user) {
      const u = { ...res.data.user };
      if (citizenLoginName.trim()) {
        u.name = citizenLoginName.trim();
      }
      handleSuccessfulAuth(u);
    } else {
      setErrorMsg(res.message || (isHindi ? 'अमान्य ओटीपी कोड' : 'Invalid OTP code'));
    }
  };

  // Centralized authentication routing
  const handleSuccessfulAuth = (user: AuthUser) => {
    if (user.role === 'CITIZEN') {
      if (citizenLoginName.trim()) {
        user.name = citizenLoginName.trim();
      }
      try {
        if (user.phone && user.name) {
          const stored = JSON.parse(localStorage.getItem('sahayak_registered_users') || '{}');
          stored[user.phone] = { ...user };
          localStorage.setItem('sahayak_registered_users', JSON.stringify(stored));
        }
      } catch (e) {}
      setAuthenticatedUser(user);
      setShowPostLoginOptions(true);
      // Immediately register active session with App state so Navbar displays user
      onLoginSuccess(user, undefined, 'auth');
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else {
      onLoginSuccess(user);
    }
  };

  // Password / ID Login handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginId = role === 'CITIZEN' ? (phone || identifier) : identifier;
    if (!loginId) {
      setErrorMsg(isHindi ? 'कृपया पहचानकर्ता दर्ज करें।' : 'Please enter your mobile or official ID.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    const res = await ApiClient.login({
      identifier: loginId,
      password,
      role
    });
    setIsLoading(false);
    if (res.status === 'SUCCESS' && res.data?.user) {
      handleSuccessfulAuth(res.data.user);
    } else {
      setErrorMsg(res.message || 'Login failed');
    }
  };

  // Sign Up: Send Verification OTP
  const handleSendSignupOtp = async () => {
    if (!signupName.trim()) {
      setErrorMsg(isHindi ? 'कृपया पूरा नाम (आधार अनुसार) दर्ज करें।' : 'Please enter your full name as per Aadhaar.');
      return;
    }
    if (!signupPhone || signupPhone.length < 10) {
      setErrorMsg(isHindi ? 'कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!dpdpConsent) {
      setErrorMsg(isHindi ? 'DPDP अधिनियम 2023 के तहत सहमति देना अनिवार्य है।' : 'Statutory DPDP Act 2023 consent is required.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    const res = await ApiClient.sendOtp(signupPhone);
    setIsLoading(false);
    setSignupOtpSent(true);
    if (res?.data?.simulatedOtp) {
      setSignupSimulatedOtp(res.data.simulatedOtp);
    }
    setSuccessMsg(isHindi ? `ओटीपी +91 ${signupPhone} पर भेजा गया।` : `OTP sent to +91 ${signupPhone}.`);
  };

  // Sign Up: Verify OTP & Complete Registration
  const handleVerifySignupOtpAndRegister = async (overrideOtp?: string) => {
    const codeToVerify = overrideOtp || signupEnteredOtp;
    if (!codeToVerify || codeToVerify.length < 6) {
      setErrorMsg(isHindi ? 'कृपया 6-अंकीय ओटीपी कोड दर्ज करें।' : 'Please enter the 6-digit OTP code.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    const otpRes = await ApiClient.verifyOtp(signupPhone, codeToVerify);
    if (otpRes.status !== 'SUCCESS') {
      setIsLoading(false);
      setErrorMsg(otpRes.message || (isHindi ? 'अमान्य ओटीपी कोड' : 'Invalid OTP code'));
      return;
    }

    const regRes = await ApiClient.signup({
      name: signupName,
      phone: signupPhone,
      email: signupEmail || undefined,
      role: 'CITIZEN',
      category: signupCategory,
      state: signupState,
      district: signupDistrict,
      consentGiven: dpdpConsent
    });
    setIsLoading(false);

    if (regRes.status === 'SUCCESS' && regRes.data?.user) {
      handleSuccessfulAuth(regRes.data.user);
    } else {
      setErrorMsg(regRes.message || 'Registration failed');
    }
  };

  // =========================================================================
  // POST-SIGN-IN ONBOARDING GATEWAY (TWO OPTIONS: COMPLETE ID vs FIND SCHEME)
  // =========================================================================
  if (showPostLoginOptions && authenticatedUser) {
    const userName = authenticatedUser.name || citizenLoginName.trim() || '';
    const userPhone = authenticatedUser.phone || phone;

    return (
      <div className="max-w-6xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Welcome & Authentication Confirmation Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isHindi ? 'प्रमाणीकरण सफल · मोबाइल नंबर सत्यापित' : 'Authentication Successful · Phone Verified'}</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
            {userName 
              ? (isHindi ? `नमस्ते, ${userName}!` : `Welcome to SAHAYAK, ${userName}!`)
              : (isHindi ? `नमस्ते!` : `Welcome to SAHAYAK!`)}
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isHindi 
              ? `आपका मोबाइल नंबर (+91 ${userPhone}) सफलतापूर्वक सत्यापित हो गया है। अपनी कल्याणकारी सहायता यात्रा को आगे बढ़ाने के लिए निम्न में से एक विकल्प चुनें:`
              : `Your mobile session (+91 ${userPhone}) is authenticated. To get started with your welfare application, please choose how you would like to proceed:`}
          </p>
        </div>

        {/* The Two Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* =============================================================== */}
          {/* OPTION 1: COMPLETE ID BY SUBMITTING DOCUMENTS                   */}
          {/* =============================================================== */}
          <div 
            onClick={() => onLoginSuccess(authenticatedUser, undefined, 'checklist')}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {isHindi ? 'विकल्प 1 · अनुशंसित' : 'Option 1 · Recommended'}
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DigiLocker</span>
                </span>
              </div>

              <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-md">
                <FileCheck2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {isHindi ? 'दस्तावेज़ जमा कर पहचान पूर्ण करें' : 'Complete ID by Submitting Documents'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {isHindi
                    ? 'आधार, जाति एवं आय प्रमाणपत्र जमा अथवा डिजिलॉकर से लिंक करके अपनी डिजिटल लाभार्थी आईडी पूर्ण करें।'
                    : 'Submit or link your Aadhaar, Caste, and Income certificates directly or via DigiLocker to complete your verified Beneficiary ID.'}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHindi ? 'डिजिलॉकर से 100% डिजिटल सत्यापन' : 'Instant digital verification via DigiLocker'}</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHindi ? 'आधिकारिक डिजिटल लाभार्थी पहचान पत्र' : 'Generate verified digital Beneficiary Card'}</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isHindi ? 'बैंक शाखा में आरक्षित कोटा प्राथमिकता' : 'Reserved district partner branch quota'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-100">
              <button 
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <span>{isHindi ? 'दस्तावेज़ जमा कर आईडी पूर्ण करें →' : 'Complete ID by Submitting Docs →'}</span>
              </button>
            </div>
          </div>

          {/* =============================================================== */}
          {/* OPTION 2: GO TO FIND MY SCHEME FIRST                            */}
          {/* =============================================================== */}
          <div 
            onClick={() => onLoginSuccess(authenticatedUser, undefined, 'wizard')}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-orange-200 hover:border-orange-500 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-orange-50 text-orange-800 border border-orange-200">
                  {isHindi ? 'विकल्प 2 · त्वरित पात्रता' : 'Option 2 · Quick Match'}
                </span>
                <span className="text-xs font-semibold text-orange-700 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>2 Mins Match</span>
                </span>
              </div>

              <div className="w-13 h-13 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-700 transition-colors">
                  {isHindi ? 'पहले मेरी योजना खोजें' : 'Go to Find My Scheme First'}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {isHindi
                    ? 'अपने व्यापार, दुकान अथवा शिक्षा हेतु 4 सरल प्रश्नों के उत्तर देकर तुरंत पता लगाएं कि आप किन केंद्रीय योजनाओं के पात्र हैं।'
                    : 'Discover which central MoSJE schemes offer the highest capital subsidy and lowest interest rates for your enterprise.'}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{isHindi ? 'सटीक पात्रता जांच (शून्य भ्रम)' : 'Deterministic matching (zero hallucination)'}</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{isHindi ? '₹5 लाख तक सरकारी पूंजीगत सब्सिडी' : 'Calculate capital subsidies up to ₹5 Lakh'}</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{isHindi ? '6-माह मोराटोरियम ईएमआई सिमुलेटर' : 'Moratorium-aware repayment schedules'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-orange-100">
              <button 
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-orange-600 group-hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-orange-600/20 cursor-pointer"
              >
                <span>{isHindi ? 'पहले मेरी योजना खोजें →' : 'Find My Scheme First →'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Secondary Action: Direct Dashboard Skip & Sign Out */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => onLoginSuccess(authenticatedUser, undefined, 'dashboard')}
            className="text-xs sm:text-sm text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-4 cursor-pointer transition"
          >
            {isHindi ? 'या सीधे लाभार्थी डैशबोर्ड पर जाएं →' : 'Or skip directly to Beneficiary Dashboard →'}
          </button>
          
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center space-x-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl border border-rose-200 transition shadow-2xs cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>{isHindi ? 'लॉग आउट करें / दूसरा खाता' : 'Sign Out / Switch Account'}</span>
            </button>
          )}
        </div>

      </div>
    );
  }



  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. OFFICIAL EMBLEM & MINISTRY HEADER (PRD §0, §3) */}
      {/* ========================================================================= */}
      <div className="text-center space-y-4">
        
        {/* National Emblem & Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-900">
            <Landmark className="w-3.5 h-3.5 text-amber-700" />
            <span>भारत सरकार · Govt. of India</span>
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t.problemStatementBadge}</span>
          </div>
        </div>

        {/* Ministry Branding */}
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500">
            {t.ministryHeader}
          </h2>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight mt-1">
            {t.authTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed">
            Unified Single Sign-On Gateway for Citizen Beneficiaries, Channel Partners & Ministry Executives.
          </p>
        </div>

        {/* Low-Literacy Audio Assistant Banner (PRD §0, §9) */}
        <div className="inline-flex items-center space-x-3 p-1.5 pl-3 pr-2 bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 rounded-full border border-orange-200 shadow-xs">
          <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Fingerprint className="w-4 h-4 text-orange-600" />
            <span>{isHindi ? 'पढ़ने में असुविधा? निर्देश सुनें:' : 'Need voice guidance?'}</span>
          </span>
          <button
            type="button"
            onClick={toggleAudioGuidance}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center space-x-1.5 ${
              isPlayingAudio
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>{isHindi ? 'आवाज रोकें' : 'Stop Audio'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isHindi ? 'बोलकर निर्देश सुनें' : 'Listen Instructions'}</span>
              </>
            )}
          </button>
        </div>

      </div>



      {/* ========================================================================= */}
      {/* 3. MAIN AUTHENTICATION CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
        
        {/* Tab Header: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/80">
          <button
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-4 text-sm font-bold transition flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'signin'
                ? 'border-orange-600 bg-white text-orange-600 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{t.signInTab}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('signup');
              setRole('CITIZEN');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-4 text-sm font-bold transition flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'signup'
                ? 'border-orange-600 bg-white text-orange-600 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.signUpTab}</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-10 space-y-6">
          
          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SIGN IN TAB */}
          {/* ========================================================================= */}
          {activeTab === 'signin' && (
            <div className="space-y-6">
              
              {/* Role Selection Tabs with Grounded Descriptions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  {isHindi ? 'प्रवेश पोर्टल भूमिका चुनें:' : 'Select Portal Access Role:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Role 1: Citizen Beneficiary */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('CITIZEN');
                      setErrorMsg(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      role === 'CITIZEN'
                        ? 'border-orange-500 bg-orange-50/60 text-orange-950 ring-2 ring-orange-200 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${role === 'CITIZEN' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">{t.roleCitizen}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      SC, OBC & Safai Karamchari credit applicants
                    </p>
                  </button>

                  {/* Role 2: Bank & Channel Partner */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('PARTNER');
                      setIdentifier('sme.indore@sbi.co.in');
                      setErrorMsg(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      role === 'PARTNER'
                        ? 'border-blue-500 bg-blue-50/60 text-blue-950 ring-2 ring-blue-200 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${role === 'PARTNER' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">{isHindi ? 'बैंक एवं चैनल पार्टनर' : 'Bank & Channel Partner'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Sponsoring Banks (SBI, RRBs) & State SCAs
                    </p>
                  </button>

                  {/* Role 3: Ministry Executive */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('MINISTRY');
                      setIdentifier('jointsec.credit@mosje.gov.in');
                      setErrorMsg(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      role === 'MINISTRY'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-200 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${role === 'MINISTRY' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">{t.roleMinistry}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      MoSJE National Equity Monitoring & IAS Officers
                    </p>
                  </button>

                </div>
              </div>

              {/* CITIZEN LOGIN (Direct Secure Mobile OTP Verification) */}
              {role === 'CITIZEN' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHindi ? 'आपका नाम (आधार अनुसार)' : 'Your Full Name (as per Aadhaar)'}
                    </label>
                    <input
                      type="text"
                      value={citizenLoginName}
                      onChange={(e) => setCitizenLoginName(e.target.value)}
                      placeholder={isHindi ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.mobileNumber}
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">+91</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (!otpSent && phone.length === 10 && !isLoading) {
                                handleSendOtp();
                              } else if (otpSent && enteredOtp.length === 6 && !isLoading) {
                                handleVerifyOtp(enteredOtp);
                              }
                            }
                          }}
                          placeholder="9876543210"
                          className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition shadow-xs shrink-0 flex items-center space-x-1 cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{isLoading ? '...' : (otpSent ? (isHindi ? 'पुनः भेजें' : 'Resend') : t.sendOtp)}</span>
                      </button>
                    </div>
                  </div>

                  {/* OTP Input Field using InputOtp (referencing input-otp-2) */}
                  {otpSent && (
                    <InputOtp
                      value={enteredOtp}
                      onChange={setEnteredOtp}
                      phone={phone}
                      onResend={handleSendOtp}
                      onVerify={handleVerifyOtp}
                      simulatedOtp={simulatedOtp}
                      isVerifying={isLoading}
                      language={language}
                    />
                  )}

                </div>
              )}

              {/* PARTNER / MINISTRY OFFICER LOGIN */}
              {role !== 'CITIZEN' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>
                      {role === 'PARTNER'
                        ? (isHindi 
                            ? 'अधिकृत बैंक पार्टनर (SBI, RRB) एवं राज्य SCA नोडल डेस्क लॉगिन। डेमो क्रेडेंशियल नीचे दिए गए हैं।'
                            : 'Authorized Sponsoring Bank Partner (SBI, RRBs) & State SCA Nodal Desk single sign-on.')
                        : 'सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) आधिकारिक नेशनल एडमिन कंसोल।'}
                    </span>
                  </div>

                  {role === 'PARTNER' && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        {isHindi ? 'त्वरित डेमो क्रेडेंशियल चुनें:' : 'Select Demo Partner Profile:'}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier('sme.indore@sbi.co.in');
                            setPassword('••••••••');
                          }}
                          className={`px-3 py-2 rounded-xl text-left border text-xs transition flex items-center space-x-2 cursor-pointer ${
                            identifier.includes('sbi')
                              ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-200 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Landmark className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="truncate">
                            <span className="block font-bold truncate">SBI Lead Bank</span>
                            <span className="text-[10px] text-slate-500 block truncate">Bank Partner Desk</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIdentifier('nodal.indore@mp-scdc.gov.in');
                            setPassword('••••••••');
                          }}
                          className={`px-3 py-2 rounded-xl text-left border text-xs transition flex items-center space-x-2 cursor-pointer ${
                            identifier.includes('scdc')
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-200 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div className="truncate">
                            <span className="block font-bold truncate">MP SC/BC Corp</span>
                            <span className="text-[10px] text-slate-500 block truncate">State SCA Desk</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {role === 'PARTNER' 
                        ? (isHindi ? 'बैंक / SCA अधिकारी ईमेल या आईडी' : 'Bank Partner / SCA Official Email or ID')
                        : (isHindi ? 'मंत्रालय ईमेल / एसएसओ आईडी' : 'MoSJE Official Email / Govt SSO ID')}
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={role === 'PARTNER' ? 'sme.indore@sbi.co.in' : 'jointsec.credit@mosje.gov.in'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.password}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5 ${
                      role === 'PARTNER' 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' 
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <span>
                      {role === 'PARTNER' && (identifier.includes('sbi') || identifier.includes('bank')
                        ? 'Sign In as Sponsoring Bank Partner (SBI)' 
                        : 'Sign In as Bank / Channel Partner')}
                      {role === 'MINISTRY' && 'Sign In to Ministry Executive Portal'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* SIGN UP TAB (CITIZEN REGISTRATION) */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* SIGN UP TAB (REGISTER BENEFICIARY) */}
          {/* Exact Field Order: Name -> Email -> Category -> State -> City/District -> Mobile & OTP */}
          {/* ========================================================================= */}
          {activeTab === 'signup' && (
            <div className="space-y-5">
              
              {/* Field 1: Name (as per Aadhaar) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHindi ? 'पूरा नाम (आधार अनुसार)' : 'Full Name (as on Aadhaar)'} *
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Ramesh Kumar Patel"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Field 2: Email (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHindi ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
                </label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="beneficiary@example.in"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Field 3: Category (like it is now) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.categoryLabel} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'SC', label: 'SC (अ.जा.)' },
                    { id: 'ST', label: 'ST (अ.ज.जा.)' },
                    { id: 'OBC', label: 'OBC (पि.वर्ग)' },
                    { id: 'OPEN', label: 'General (सामान्य)' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSignupCategory(cat.id as BeneficiaryCategory)}
                      className={`py-3 px-2 rounded-xl border text-sm font-bold transition text-center flex items-center justify-center ${
                        signupCategory === cat.id
                          ? 'border-orange-500 bg-orange-50 text-orange-800 ring-2 ring-orange-200 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4 & 5: State & City/District (like it is now) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.stateLabel} *</label>
                  <select
                    value={signupState}
                    onChange={(e) => setSignupState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                    <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                    <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                    <option value="Delhi">Delhi NCT (दिल्ली)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'शहर / जिला' : 'City / District'} *
                  </label>
                  <select
                    value={signupDistrict}
                    onChange={(e) => setSignupDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Indore">Indore (इंदौर)</option>
                    <option value="Bhopal">Bhopal (भोपाल)</option>
                    <option value="Lucknow">Lucknow (लखनऊ)</option>
                    <option value="Nagpur">Nagpur (नागपुर)</option>
                    <option value="New Delhi">New Delhi (नई दिल्ली)</option>
                  </select>
                </div>
              </div>

              {/* Field 6: Mobile Number + OTP Verification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.mobileNumber} *
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => {
                        setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        if (signupOtpSent) setSignupOtpSent(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!signupOtpSent && signupPhone.length === 10 && !isLoading) {
                            handleSendSignupOtp();
                          } else if (signupOtpSent && signupEnteredOtp.length === 6 && !isLoading) {
                            handleVerifySignupOtpAndRegister(signupEnteredOtp);
                          }
                        }
                      }}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendSignupOtp}
                    disabled={isLoading || signupPhone.length < 10}
                    className={`px-4 py-2.5 text-white font-bold text-xs rounded-xl transition shadow-xs shrink-0 flex items-center space-x-1 ${
                      signupPhone.length === 10
                        ? 'bg-orange-600 hover:bg-orange-700 cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>
                      {isLoading
                        ? '...'
                        : signupOtpSent
                        ? (isHindi ? 'पुनः भेजें' : 'Resend')
                        : (isHindi ? 'ओटीपी प्राप्त करें' : 'Get OTP')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dedicated Input OTP Block (referencing input-otp-2 architecture) */}
              {signupOtpSent && (
                <InputOtp
                  value={signupEnteredOtp}
                  onChange={setSignupEnteredOtp}
                  phone={signupPhone}
                  onResend={handleSendSignupOtp}
                  onVerify={handleVerifySignupOtpAndRegister}
                  simulatedOtp={signupSimulatedOtp}
                  isVerifying={isLoading}
                  language={language}
                />
              )}

              {/* Statutory DPDP Act 2023 Consent Checkbox */}
              <div>
                <div
                  onClick={() => setDpdpConsent(!dpdpConsent)}
                  className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start space-x-3 cursor-pointer hover:bg-emerald-50 transition"
                >
                  <div className="mt-0.5 text-emerald-600">
                    {dpdpConsent ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-1 font-bold text-emerald-950">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{isHindi ? 'DPDP अधिनियम 2023 वैधानिक सहमति' : 'DPDP Act 2023 Statutory Consent'}</span>
                    </div>
                    <p className="text-slate-600 leading-snug">
                      {t.dpdpConsentStatement}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenConsentModal();
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:underline pt-0.5"
                    >
                      {isHindi ? 'गोपनीयता नीति व डेटा उपयोग विवरण देखें' : 'View full data minimization & privacy policy →'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Call to Action when OTP has not been sent yet */}
              {!signupOtpSent && (
                <button
                  type="button"
                  onClick={handleSendSignupOtp}
                  disabled={isLoading || !signupName || signupPhone.length < 10}
                  className={`w-full py-3.5 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center space-x-2 ${
                    signupName && signupPhone.length === 10
                      ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20 cursor-pointer'
                      : 'bg-slate-300 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>{isHindi ? 'ओटीपी सत्यापन एवं पंजीकरण आगे बढ़ाएं' : 'Verify Mobile via OTP & Register'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 4. FOOTER NAVIGATION PANEL */}
        {/* ========================================================================= */}
        <div className="bg-slate-50 px-6 sm:px-10 py-4 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-500">
          <button
            type="button"
            onClick={onOpenConsentModal}
            className="text-emerald-700 hover:underline font-medium text-xs"
          >
            Statutory Privacy Notice
          </button>
          <button
            type="button"
            onClick={onNavigateHome}
            className="font-bold text-slate-700 hover:text-slate-900 transition"
          >
            ← {isHindi ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}
          </button>
        </div>

      </div>

    </div>
  );
};
