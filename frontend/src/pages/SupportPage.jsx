import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneCall, ExternalLink, Users, CheckCircle2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { BreathingExercise } from '../components/support/BreathingExercise';
import { WHATSAPP_COMMUNITY_URL, COUNTRIES } from '../config/language';

export const SupportPage = ({ user }) => {
  const { t, i18n } = useTranslation();
  const { callApi, loading } = useApi();

  const lang = i18n.language === 'id' ? 'id' : 'en';
  const [country, setCountry] = useState(user?.country || 'ID');
  const [region, setRegion] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [services, setServices] = useState([]);
  const [showPeerModal, setShowPeerModal] = useState(false);
  const [followupSentId, setFollowupSentId] = useState(null);

  const loadServices = useCallback(async () => {
    const params = new URLSearchParams({
      country,
      region,
      category,
    });
    try {
      const data = await callApi(`/support/services?${params.toString()}`, 'GET', null, null, {
        silent: true,
      });
      setServices(data || []);
    } catch {
      setServices([]);
    }
  }, [callApi, country, region, category]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleConfirmFollowup = async (serviceId, serviceCategory) => {
    setFollowupSentId(serviceId);
    await callApi(
      '/analytics/events',
      'POST',
      {
        eventType: 'referral_followup_confirmed',
        language: lang,
        country,
        metadata: { category: serviceCategory },
      },
      null,
      { silent: true }
    ).catch(() => {});
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('support.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('support.subtitle')}</p>
      </div>

      {/* Step 1 & 2: Self-guided Breathing + Peer Support & Grounding/Journaling */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex lg:col-span-7">
          <BreathingExercise
            onCompleteCycle={() => {
              callApi(
                '/analytics/events',
                'POST',
                { eventType: 'activity_used', language: lang, country },
                null,
                { silent: true }
              ).catch(() => {});
            }}
          />
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-3xl border border-border bg-warm-amber/60 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <Users className="h-5 w-5 shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-bold text-foreground">{t('support.peerTitle')}</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('support.peerDesc')}
            </p>
            <button
              type="button"
              onClick={() => setShowPeerModal(true)}
              className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-transform hover:opacity-95 active:scale-[0.98]"
            >
              {t('support.peerCta')}
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-foreground">
              {lang === 'id' ? 'Mindfulness 5-4-3-2-1' : '5-4-3-2-1 Grounding'}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {lang === 'id'
                ? 'Sebutkan 5 hal yang terlihat, 4 yang bisa disentuh, 3 suara terdengar, 2 aroma tercium, dan 1 rasa untuk kembali ke momen kini.'
                : 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste to anchor yourself in the present.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-warm-amber/50 p-5">
            <h3 className="text-sm font-bold text-foreground">
              {lang === 'id' ? 'Panduan Journaling Singkat' : 'Guided Journaling Prompt'}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {lang === 'id'
                ? 'Apa satu hal yang paling menguras energimu hari ini, dan satu langkah kecil yang masih berada dalam kendalimu?'
                : 'What drained your energy most today, and what is one small step still within your control right now?'}
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: Local Professional & Urgent Support Directory (Linear Workspace Frame) */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border bg-surface-muted/60 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-foreground">{t('support.directoryTitle')}</h2>
        </div>
        <div className="p-4 sm:p-6">

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('support.filterCountry')}
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
              <option value="ALL">All / International</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('support.filterRegion')}
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="ALL">All Regions</option>
              <option value="National">National</option>
              <option value="Abu Dhabi">Abu Dhabi</option>
              <option value="Jabodetabek">Jabodetabek</option>
              <option value="Bandung">Bandung</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Yogyakarta">Yogyakarta</option>
              <option value="Bali">Bali</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('support.filterCategory')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {Object.entries(t('support.categories', { returnObjects: true }) || {}).map(
                ([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {loading && services.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : (
            services.map((svc) => (
              <div
                key={svc._id}
                className="@container flex flex-col justify-between rounded-xl border border-border bg-background p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {t(`support.categories.${svc.category}`)} · {svc.region}
                    </span>
                    {svc.isFreeOrSubsidized && (
                      <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-foreground">
                        {t('support.freeBadge')}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-foreground">{svc.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {lang === 'id' ? svc.descriptionId : svc.descriptionEn}
                  </p>
                  {(svc.eligibilityEn || svc.eligibilityId) && (
                    <p className="mt-2 rounded-md bg-surface-muted px-2.5 py-1.5 text-xs text-foreground">
                      <span className="font-semibold">{t('support.eligibilityLabel')}: </span>
                      {lang === 'id' ? svc.eligibilityId : svc.eligibilityEn}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-3 @sm:flex-row @sm:flex-wrap @sm:items-center @sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {svc.phone && (
                      <a
                        href={`tel:${svc.phone}`}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground active:opacity-90"
                      >
                        <PhoneCall className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{svc.phone}</span>
                      </a>
                    )}
                    {svc.contactUrl && (
                      <a
                        href={svc.contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-foreground active:bg-surface-muted"
                      >
                        <span>{t('support.visitSite')}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                      </a>
                    )}
                  </div>

                  {followupSentId === svc._id ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {t('support.followupThanks')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConfirmFollowup(svc._id, svc.category)}
                      className="inline-flex min-h-[40px] w-full items-center justify-center rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted active:bg-surface-muted @sm:w-auto"
                    >
                      {t('support.confirmFollowup')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </div>

      {/* Privacy Notice Modal before WhatsApp Community */}
      {showPeerModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">{t('support.peerPrivacyTitle')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('support.peerPrivacyBody')}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPeerModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                {t('common.cancel')}
              </button>
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPeerModal(false)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {t('support.peerProceed')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
