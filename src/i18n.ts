import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TRANSLATIONS } from './services/i18nService';

// Extract resources for i18next
const resources = Object.entries(TRANSLATIONS).reduce((acc, [lang, dict]) => {
  acc[lang] = { translation: dict };
  return acc;
}, {} as Record<string, { translation: any }>);

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? localStorage.getItem('sahayak_language') || 'en' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
