import React from 'react';
import { PhoneCall, ShieldAlert, ExternalLink, HeartHandshake, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config';

const OFFLINE_FALLBACK = {
  en: {
    title: 'Immediate Human Support Is Available',
    lead: 'If you are in distress or unsafe, please connect with a trained human responder right now.',
    disclaimer:
      'MentyMate is not a clinical or emergency service. Reach out to emergency services or someone you trust.',
    steps: [
      'Call your local emergency number immediately if you are in physical danger.',
      'Speak with a 24/7 crisis helpline counselor.',
      'Contact a trusted friend, family member, or counselor.',
    ],
    acknowledgeLabel: 'I have reviewed these support options',
    localContacts: [
      { name: 'Indonesian Emergency (112)', phone: '112', available: '24/7' },
      { name: 'Kemenkes / Medical Emergency (119)', phone: '119', available: '24/7' },
      { name: 'LISA Helpline Indonesia', phone: '+628113855472', available: '24/7' },
      { name: 'US 988 Suicide & Crisis Lifeline', phone: '988', available: '24/7' },
    ],
    globalContacts: [
      { name: 'Find A Helpline (130+ Countries)', url: 'https://findahelpline.com/', available: '24/7' },
    ],
  },
  id: {
    title: 'Bantuan Manusia Tersedia Sekarang',
    lead: 'Jika kamu sedang berada dalam kondisi sangat berat atau berisiko, segera hubungi tenaga manusia terlatih.',
    disclaimer:
      'MentyMate bukan layanan klinis maupun darurat. Hubungi layanan darurat atau orang tepercaya sekarang.',
    steps: [
      'Segera hubungi nomor darurat setempat jika berada dalam bahaya fisik langsung.',
      'Hubungi saluran bantuan krisis 24/7 untuk berbicara dengan konselor terlatih.',
      'Hubungi teman tepercaya, keluarga, atau konselor.',
    ],
    acknowledgeLabel: 'Saya sudah membaca panduan bantuan ini',
    localContacts: [
      { name: 'Darurat Nasional Indonesia (112)', phone: '112', available: '24/7' },
      { name: 'Kemenkes / Ambulans (119)', phone: '119', available: '24/7' },
      { name: 'Saluran Bantuan LISA', phone: '+628113855472', available: '24/7' },
    ],
    globalContacts: [
      { name: 'Find A Helpline (Internasional)', url: 'https://findahelpline.com/', available: '24/7' },
    ],
  },
};

export const CrisisSupportModal = ({
  isOpen,
  onClose,
  protocol,
  incidentId,
  token,
  trustedContact,
}) => {
  const { t, i18n } = useTranslation();
  if (!isOpen) return null;

  const lang = i18n.language === 'id' ? 'id' : 'en';
  const data = protocol || OFFLINE_FALLBACK[lang];

  const handleAcknowledge = async () => {
    if (token) {
      fetch(`${API_BASE_URL}/chat/crisis-ack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-language': lang,
        },
        body: JSON.stringify({ incidentId, language: lang }),
      }).catch(() => {});
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-title"
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-crisis-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-crisis-border bg-crisis-bg p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-crisis" aria-hidden="true" />
            <div>
              <h2 id="crisis-modal-title" className="text-lg font-bold text-crisis">
                {data.title}
              </h2>
              <p className="mt-1 text-sm text-foreground">{data.lead}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-black/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <p className="rounded-lg border border-border bg-surface-muted p-3 text-xs leading-relaxed text-muted-foreground">
            {data.disclaimer}
          </p>

          <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
            {data.steps?.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('support.categories.urgent_helpline')}
            </h3>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              {data.localContacts?.map((c, idx) => (
                <div
                  key={idx}
                  className="@container flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-3 @sm:flex-row @sm:items-center @sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.available}</div>
                  </div>
                  {c.phone && (
                    <a
                      href={`tel:${c.phone.replace(/\s+/g, '')}${c.extension ? `,${c.extension}` : ''}`}
                      className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-crisis px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 @sm:w-auto"
                    >
                      <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                      {c.extension ? `${c.phone} (ext. ${c.extension})` : c.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-muted p-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <HeartHandshake className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('crisis.trustedContactTitle')}
            </div>
            {trustedContact?.phone ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {trustedContact.name} ({trustedContact.relationship || 'Trusted'})
                </span>
                <a
                  href={`tel:${trustedContact.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('crisis.callTrusted')}
                </a>
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">{t('crisis.noTrustedContact')}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              {data.globalContacts?.map((g, idx) => (
                <a
                  key={idx}
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary underline"
                >
                  {g.name}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAcknowledge}
              className="min-h-[44px] w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover sm:w-auto"
            >
              {data.acknowledgeLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
