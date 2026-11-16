const SUPPORTED_LANGUAGES = ['en', 'id'];

/**
 * Returns the platform default language controlled by DEFAULT_LANGUAGE flag.
 * Defaults to 'en' (English-first) and can be switched to 'id' via env flag.
 */
function getDefaultLanguage() {
  const flag = (process.env.DEFAULT_LANGUAGE || 'en').toLowerCase().trim();
  return SUPPORTED_LANGUAGES.includes(flag) ? flag : 'en';
}

/**
 * Resolves the active language for a request:
 * 1. Explicit query/header/body override if supported
 * 2. Authenticated user's preferredLanguage
 * 3. Platform DEFAULT_LANGUAGE flag
 */
function resolveLanguage(req, user = null) {
  const candidates = [
    req?.body?.language,
    req?.query?.lang,
    req?.headers?.['x-language'],
    req?.headers?.['accept-language']?.split(',')[0]?.split('-')[0],
    user?.preferredLanguage,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const normalized = candidate.toLowerCase().trim().slice(0, 2);
      if (SUPPORTED_LANGUAGES.includes(normalized)) {
        return normalized;
      }
    }
  }
  return getDefaultLanguage();
}

const MESSAGES = {
  en: {
    serverError: 'An unexpected server error occurred.',
    unauthorized: 'Authentication required.',
    consentRequired: 'Consent is required before using this feature.',
    usernameExists: 'Username is already registered.',
    userCreated: 'User registered successfully.',
    userNotFound: 'User not found.',
    invalidCredentials: 'Invalid username or password.',
    profileUpdated: 'Profile updated successfully.',
    samePassword: 'New password must differ from current password.',
    noUpdates: 'No fields provided to update.',
    checkinExistsToday: 'Daily check-in has already been submitted today.',
    checkinSaved: 'Daily check-in saved successfully.',
    noCheckins: 'No check-ins recorded yet.',
    messageRequired: 'Message is required.',
    botError: 'Unable to process chat response right now.',
    rateLimitExceeded: 'Too many requests, please try again later.',
    validationFailed: 'Invalid request payload.',
  },
  id: {
    serverError: 'Terjadi kesalahan pada server.',
    unauthorized: 'Autentikasi diperlukan.',
    consentRequired: 'Persetujuan diperlukan sebelum menggunakan fitur ini.',
    usernameExists: 'Username sudah terdaftar.',
    userCreated: 'User berhasil didaftarkan.',
    userNotFound: 'User tidak ditemukan.',
    invalidCredentials: 'Username atau password salah.',
    profileUpdated: 'Profil berhasil diperbarui.',
    samePassword: 'Password baru harus berbeda dari password saat ini.',
    noUpdates: 'Tidak ada data untuk diperbarui.',
    checkinExistsToday: 'Check-in sudah dilakukan hari ini.',
    checkinSaved: 'Check-in berhasil disimpan.',
    noCheckins: 'Belum ada check-in.',
    messageRequired: 'Pesan wajib diisi.',
    botError: 'Gagal berkomunikasi dengan chatbot saat ini.',
    rateLimitExceeded: 'Terlalu banyak permintaan, coba lagi nanti.',
    validationFailed: 'Data input tidak valid.',
  },
};

function t(lang, key) {
  const safeLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : getDefaultLanguage();
  return MESSAGES[safeLang]?.[key] || MESSAGES.en[key] || key;
}

module.exports = {
  SUPPORTED_LANGUAGES,
  getDefaultLanguage,
  resolveLanguage,
  t,
};
