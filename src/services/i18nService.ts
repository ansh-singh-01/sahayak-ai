import { en, TranslationKeys, FullTranslationKeys } from './locales/en';
import { hi } from './locales/hi';
import { mr } from './locales/mr';
import { gu } from './locales/gu';
import { ta } from './locales/ta';
import { te } from './locales/te';
import { bn } from './locales/bn';
import { kn } from './locales/kn';
import { pa } from './locales/pa';
import { ml } from './locales/ml';
import { or } from './locales/or';

export type Language = 
  | 'en' 
  | 'hi' 
  | 'mr' 
  | 'gu' 
  | 'bn' 
  | 'ta' 
  | 'te' 
  | 'kn' 
  | 'pa' 
  | 'ml' 
  | 'or';

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  region: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'All India / Pan-India', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'National / North & Central', speechCode: 'hi-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra / West', speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat / West', speechCode: 'gu-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal / East', speechCode: 'bn-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu / South', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh & Telangana / South', speechCode: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka / South', speechCode: 'kn-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab / North', speechCode: 'pa-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala / South', speechCode: 'ml-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha / East', speechCode: 'or-IN' }
];

export const INDIAN_LANGUAGES: LanguageMeta[] = SUPPORTED_LANGUAGES;

export const RAW_TRANSLATIONS: Record<Language, Partial<TranslationKeys>> = {
  en,
  hi,
  mr,
  gu,
  bn,
  ta,
  te,
  kn,
  pa,
  ml,
  or
};

/**
 * Creates a fallback-aware proxy dictionary so that any missing key falls back to English,
 * ensuring robust rendering without undefined crashes.
 */
function createFallbackDictionary(dict: Partial<TranslationKeys>, fallback: FullTranslationKeys): FullTranslationKeys {
  return new Proxy(dict, {
    get(target, prop: string) {
      if (prop in target && target[prop as keyof TranslationKeys]) {
        return target[prop as keyof TranslationKeys];
      }
      return fallback[prop as keyof FullTranslationKeys] || '';
    }
  }) as FullTranslationKeys;
}

export const TRANSLATIONS: Record<Language, FullTranslationKeys> = {
  en,
  hi: createFallbackDictionary(hi, en),
  mr: createFallbackDictionary(mr, en),
  gu: createFallbackDictionary(gu, en),
  bn: createFallbackDictionary(bn, en),
  ta: createFallbackDictionary(ta, en),
  te: createFallbackDictionary(te, en),
  kn: createFallbackDictionary(kn, en),
  pa: createFallbackDictionary(pa, en),
  ml: createFallbackDictionary(ml, en),
  or: createFallbackDictionary(or, en)
};

export function getSpeechCode(language: Language): string {
  const match = SUPPORTED_LANGUAGES.find(l => l.code === language);
  return match?.speechCode || 'hi-IN';
}

export function isIndicLanguage(language: Language): boolean {
  return language !== 'en';
}
