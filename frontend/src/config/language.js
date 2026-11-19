export const SUPPORTED_LANGUAGES = ['en', 'id'];

/**
 * Default language controlled by VITE_DEFAULT_LANGUAGE flag.
 * Set to 'en' (English-first) for international hackathon;
 * change VITE_DEFAULT_LANGUAGE=id to switch default to Bahasa Indonesia-first.
 * @returns {'en' | 'id'}
 */
export function getDefaultLanguage() {
  const flag = (import.meta.env.VITE_DEFAULT_LANGUAGE || 'en').toLowerCase().trim();
  return SUPPORTED_LANGUAGES.includes(flag) ? flag : 'en';
}

export const WHATSAPP_COMMUNITY_URL =
  import.meta.env.VITE_WHATSAPP_COMMUNITY_URL || 'https://chat.whatsapp.com/MateGroupCommunity';

export const COUNTRIES = [
  { code: 'ID', label: 'Indonesia (ID)' },
  { code: 'AE', label: 'UAE / Abu Dhabi (AE)' },
  { code: 'US', label: 'United States (US)' },
  { code: 'GB', label: 'United Kingdom (GB)' },
];
