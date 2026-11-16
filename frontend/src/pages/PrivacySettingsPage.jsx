import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Download, Trash2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { setAppLanguage } from '../i18n';
import { CustomModal } from '../components/ui/CustomModal';
import { COUNTRIES } from '../config/language';

export const PrivacySettingsPage = ({ token, onUserUpdated, onLogout }) => {
  const { t } = useTranslation();
  const { callApi, loading, modal, setModal } = useApi();

  const [consents, setConsents] = useState({
    aiChat: { granted: false },
    moodTracking: { granted: false },
    selfAssessment: { granted: false },
  });
  const [country, setCountry] = useState('ID');
  const [region, setRegion] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [trustedContact, setTrustedContact] = useState({ name: '', phone: '', relationship: '' });
  const [savedNotice, setSavedNotice] = useState('');

  const loadSettings = useCallback(async () => {
    try {
      const data = await callApi('/privacy/consents', 'GET', null, token);
      if (data.consents) setConsents(data.consents);
      if (data.country) setCountry(data.country);
      if (data.region) setRegion(data.region);
      if (data.preferredLanguage) setPreferredLanguage(data.preferredLanguage);
      if (data.trustedContact) setTrustedContact(data.trustedContact);
    } catch {
      // handled by useApi
    }
  }, [callApi, token]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggleConsent = async (key) => {
    const nextVal = !consents[key]?.granted;
    const res = await callApi('/privacy/consents', 'PUT', { [key]: nextVal }, token);
    if (res.consents) setConsents(res.consents);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const res = await callApi(
      '/auth/update-profile',
      'PUT',
      { country, region, preferredLanguage, trustedContact },
      token
    );
    setAppLanguage(preferredLanguage);
    onUserUpdated?.(res.user);
    setSavedNotice(t('common.save'));
    setTimeout(() => setSavedNotice(''), 2500);
  };

  const handleExport = async () => {
    const data = await callApi('/privacy/export', 'GET', null, token);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentymate-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    setModal({
      show: true,
      title: t('privacy.deleteBtn'),
      message: t('privacy.deleteConfirm'),
      confirmText: t('privacy.deleteBtn'),
      cancelText: t('common.cancel'),
      isDestructive: true,
      onConfirm: async () => {
        setModal({ show: false });
        await callApi('/privacy/account', 'DELETE', null, token);
        onLogout();
      },
      onCancel: () => setModal({ show: false }),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('privacy.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('privacy.subtitle')}</p>
      </div>

      {/* Granular Consents */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">{t('privacy.consentsTitle')}</h2>
        </div>
        <div className="mt-4 divide-y divide-border">
          {['aiChat', 'moodTracking', 'selfAssessment'].map((key) => {
            const granted = Boolean(consents[key]?.granted);
            return (
              <div key={key} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {t(`privacy.consentItems.${key}.title`)}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t(`privacy.consentItems.${key}.desc`)}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={granted}
                  disabled={loading}
                  onClick={() => handleToggleConsent(key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-60 ${
                    granted ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      granted ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location, Language & Trusted Contact */}
      <form onSubmit={handleSaveProfile} className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">{t('privacy.profileRegionTitle')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('auth.preferredLanguage')}
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="en">English (EN)</option>
              <option value="id">Bahasa Indonesia (ID)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('auth.country')}
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('auth.region')}
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Jakarta, Bandung..."
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <h3 className="mt-6 text-sm font-bold text-foreground">{t('crisis.trustedContactTitle')}</h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Name"
            value={trustedContact.name || ''}
            onChange={(e) => setTrustedContact({ ...trustedContact, name: e.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="tel"
            placeholder="Phone (+62...)"
            value={trustedContact.phone || ''}
            onChange={(e) => setTrustedContact({ ...trustedContact, phone: e.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Relationship"
            value={trustedContact.relationship || ''}
            onChange={(e) =>
              setTrustedContact({ ...trustedContact, relationship: e.target.value })
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:bg-primary-hover active:scale-[0.98]"
          >
            {t('common.save')}
          </button>
          {savedNotice && <span className="text-xs font-semibold text-success">{savedNotice}</span>}
        </div>
      </form>

      {/* Data Export & Account Deletion */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">{t('privacy.dataControlTitle')}</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted sm:w-auto"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('privacy.exportBtn')}
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-crisis-border bg-warm-coral px-5 py-2.5 text-sm font-semibold text-crisis hover:opacity-90 sm:w-auto"
          >
            <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('privacy.deleteBtn')}
          </button>
        </div>
      </div>

      <CustomModal modal={modal} setModal={setModal} />
    </div>
  );
};
