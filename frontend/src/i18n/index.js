import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import id from './locales/id/translation.json';
import { getDefaultLanguage, SUPPORTED_LANGUAGES } from '../config/language';

const STORAGE_KEY = 'mentymate_lang';

function resolveInitialLanguage() {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
    return saved;
  }
  return getDefaultLanguage();
}

const initialLng = resolveInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  lng: initialLng,
  fallbackLng: getDefaultLanguage(),
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: {
    escapeValue: false,
  },
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLng;
}

export function setAppLanguage(lang) {
  const next = SUPPORTED_LANGUAGES.includes(lang) ? lang : getDefaultLanguage();
  i18n.changeLanguage(next);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, next);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
  }
  return next;
}

export default i18n;
