export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
}

export interface WidgetConfig {
  title: string;
  subtitle: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
  defaultLanguage: string;
  theme: 'light' | 'dark' | 'system';
  enableVoice: boolean;
  avatarIcon: string;
}

export const LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'स्वचालित (Auto)', flag: '🌐', speechCode: 'hi-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'en', name: 'English', nativeName: 'English (India)', flag: '🇮🇳', speechCode: 'en-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', speechCode: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', speechCode: 'mr-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳', speechCode: 'ur-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', speechCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', speechCode: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', speechCode: 'pa-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', speechCode: 'or-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', speechCode: 'as-IN' },
  // Global languages for international / overseas scholarship queries
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
];

export const PERSONAS: Persona[] = [
  {
    id: 'mosje-advisor',
    name: 'MoSJE Welfare Advisor',
    description: 'Statutory expert on NSFDC, NBCFDC, and NSKFDC schemes, income limits, and eligibility.',
    icon: 'Bot',
    systemPrompt: 'You are SAHAYAK AI, the official welfare advisor for the Ministry of Social Justice and Empowerment (MoSJE), Government of India. Provide clear, empathetic, and statutory guidance to beneficiaries regarding central concessional schemes, caste-based income ceilings, and document checklists in the user\'s language.',
  },
  {
    id: 'loan-modeler',
    name: 'Concessional Loan Modeler',
    description: 'Specialist in low-interest EMIs, moratorium grace periods, and capital subsidy calculation.',
    icon: 'Calculator',
    systemPrompt: 'You are the SAHAYAK Concessional Loan & Finance Modeler. Explain loan amortizations, 4% to 6% p.a. concessional interest rates, moratorium grace periods up to 6 months, and government capital subsidies in simple, practical terms for grassroots entrepreneurs.',
  },
  {
    id: 'citizen-support',
    name: 'Citizen Support & Grievance',
    description: 'Empathetic agent for application tracking, DigiLocker verification, and national helpline info.',
    icon: 'Headphones',
    systemPrompt: 'You are an empathetic, rapid-response Citizen Support & Grievance Officer for MoSJE welfare schemes. Help users track their application status, explain DigiLocker instant verification, and provide official helpline details (1800-11-2001) in their preferred language.',
  },
  {
    id: 'polyglot-guide',
    name: 'Polyglot Regional Guide',
    description: 'Simplifies legal schemes and government terms into regional dialects with phonetic guides.',
    icon: 'Languages',
    systemPrompt: 'You are a warm, bilingual cultural linguistic guide. Break down complex government jargon, legal clauses, and procedural paperwork into simple, accessible regional terms and dialects for rural and marginalized citizens.',
  },
  {
    id: 'general',
    name: 'General Assistant',
    description: 'Versatile companion for answering any general welfare and platform inquiries.',
    icon: 'Sparkles',
    systemPrompt: 'You are SAHAYAK, a warm, highly knowledgeable, and versatile multilingual AI companion for Indian citizens seeking social empowerment and inclusive growth.',
  },
];
