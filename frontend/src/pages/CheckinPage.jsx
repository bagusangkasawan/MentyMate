import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Activity } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useApi } from '../hooks/useApi';
import {
  getCached,
  withSessionCache,
  removeCached,
  removeCachedByPrefix,
} from '../utils/sessionCache';
import { ConsentGate } from '../components/privacy/ConsentGate';
import { CustomModal } from '../components/ui/CustomModal';

/**
 * Daily mood & physical habit check-in with encrypted notes, AI reflection,
 * and 14-day clinician handover summary. Caches user reads per session.
 * @param {object} props
 * @param {string} props.token
 * @param {(protocol: object, incidentId: string) => void} props.onTriggerCrisis
 * @returns {JSX.Element}
 */
export const CheckinPage = ({ token, onTriggerCrisis }) => {
  const { t, i18n } = useTranslation();
  const { loading, callApi, modal, setModal } = useApi();

  const [tab, setTab] = useState('today'); // 'today' | 'history' | 'insights' | 'summary'
  const [consentRequired, setConsentRequired] = useState(false);
  const [mood, setMood] = useState('baik');
  const [description, setDescription] = useState('');
  const [showPhysical, setShowPhysical] = useState(false);
  const [physical, setPhysical] = useState({
    sleepQuality: 3,
    sleepDurationHours: 7,
    energyLevel: 3,
    physicalActivityMinutes: 20,
    stressLevel: 3,
  });
  const activeLang = i18n.language === 'id' ? 'id' : 'en';
  const [history, setHistory] = useState(() => getCached('user:checkin:history') || []);
  const [recommendation, setRecommendation] = useState(
    () => getCached(`user:checkin:recommendation:${activeLang}`) || ''
  );
  const [recommendationLang, setRecommendationLang] = useState(() =>
    getCached(`user:checkin:recommendation:${activeLang}`) ? activeLang : ''
  );
  const [summary, setSummary] = useState(() => getCached('user:checkin:summary'));

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const hasCheckedInToday = history.some((c) => new Date(c.date) >= startOfToday);

  const loadHistory = useCallback(
    async (force = false) => {
      try {
        const list = await withSessionCache(
          'user:checkin:history',
          async () => (await callApi('/checkin', 'GET', null, token, { silent: true })) || [],
          { force }
        );
        setHistory(list);
        setConsentRequired(false);
      } catch (err) {
        if (err.code === 'CONSENT_REQUIRED') setConsentRequired(true);
      }
    },
    [callApi, token]
  );

  useEffect(() => {
    loadHistory(false);
  }, [loadHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      mood,
      description,
      language: i18n.language === 'id' ? 'id' : 'en',
      ...(showPhysical ? { physicalMetrics: physical } : {}),
    };

    setModal({
      show: true,
      title: t('checkin.confirmTitle'),
      message: t('checkin.confirmBody'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        try {
          const res = await callApi('/checkin', 'POST', payload, token);
          setDescription('');
          setRecommendation('');
          setRecommendationLang('');
          setSummary(null);
          removeCachedByPrefix('user:checkin:');
          removeCached('public:impact:summary');
          setModal({ show: true, title: t('common.appName'), message: t('checkin.savedMsg') });
          if (res.isCrisis) {
            onTriggerCrisis(res.crisisProtocol, res.incidentId);
          }
          await loadHistory(true);
        } catch (err) {
          if (err.code === 'CONSENT_REQUIRED') setConsentRequired(true);
        }
      },
      onCancel: () => setModal({ show: false }),
    });
  };

  const handleFetchInsights = async () => {
    setTab('insights');
    if (!hasCheckedInToday || loading) return;
    if (recommendation && recommendationLang === activeLang) return;
    try {
      const rec = await withSessionCache(
        `user:checkin:recommendation:${activeLang}`,
        async () => {
          const data = await callApi('/checkin/recommendation', 'GET', null, token);
          return data.recommendation || '';
        }
      );
      setRecommendation(rec);
      setRecommendationLang(activeLang);
    } catch {
      // handled
    }
  };

  const handleFetchSummary = async () => {
    setTab('summary');
    if (summary || loading) return;
    try {
      const data = await withSessionCache('user:checkin:summary', () =>
        callApi('/checkin/wellbeing-summary', 'GET', null, token)
      );
      setSummary(data);
    } catch {
      // handled
    }
  };

  if (consentRequired) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <ConsentGate featureKey="moodTracking" token={token} onGranted={() => loadHistory(true)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('checkin.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('checkin.subtitle')}</p>
      </div>

      {/* Pill Tabs (Headspace filter chips) */}
      <div className="grid grid-cols-2 gap-2 border-b border-border pb-4 sm:flex sm:flex-wrap">
        {[
          { id: 'today', label: t('checkin.tabs.today'), onClick: () => setTab('today') },
          { id: 'history', label: t('checkin.tabs.history'), onClick: () => setTab('history') },
          { id: 'insights', label: t('checkin.tabs.insights'), onClick: handleFetchInsights },
          { id: 'summary', label: t('checkin.tabs.summary'), onClick: handleFetchSummary },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={`min-h-[44px] rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              tab === item.id
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-surface text-foreground hover:bg-surface-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <div>
            <label className="block text-sm font-semibold text-foreground">
              {t('checkin.moodQuestion')}
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
              {['baik', 'sedang', 'buruk'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`min-h-[44px] rounded-lg border px-2 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:py-3 sm:text-sm ${
                    mood === m
                      ? 'border-primary bg-accent-soft text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-surface-muted'
                  }`}
                >
                  {t(`checkin.moods.${m}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="checkin-note" className="block text-sm font-semibold text-foreground">
              {t('checkin.noteLabel')}
            </label>
            <textarea
              id="checkin-note"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('checkin.notePlaceholder')}
              className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Pillar 05: Optional Physical Metrics */}
          <div className="rounded-lg border border-border bg-background p-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={showPhysical}
                onChange={(e) => setShowPhysical(e.target.checked)}
                className="accent-primary"
              />
              <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
              {t('checkin.physicalToggle')}
            </label>

            {showPhysical && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t('checkin.sleepQuality')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={physical.sleepQuality}
                    onChange={(e) =>
                      setPhysical({ ...physical, sleepQuality: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t('checkin.sleepDuration')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={physical.sleepDurationHours}
                    onChange={(e) =>
                      setPhysical({ ...physical, sleepDurationHours: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t('checkin.energyLevel')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={physical.energyLevel}
                    onChange={(e) =>
                      setPhysical({ ...physical, energyLevel: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t('checkin.activityMinutes')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1440"
                    value={physical.physicalActivityMinutes}
                    onChange={(e) =>
                      setPhysical({
                        ...physical,
                        physicalActivityMinutes: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t('checkin.stressLevel')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={physical.stressLevel}
                    onChange={(e) =>
                      setPhysical({ ...physical, stressLevel: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
                  />
                </div>
                <div className="sm:col-span-2 rounded-md border border-dashed border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
                  {i18n.language === 'id'
                    ? 'Integrasi Wearable (opsional, fase berikutnya): Saat ini input dicatat manual; sinkronisasi perangkat wearable siap dihubungkan pada pengembangan lanjutan.'
                    : 'Optional Wearable Integration (upcoming): Currently logged manually; wearable sync hooks are prepared for future device integration.'}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? t('common.loading') : t('checkin.submitBtn')}
          </button>
        </form>
      )}

      {tab === 'history' && (
        <div className="rounded-xl border border-border bg-surface p-6">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('checkin.noHistory')}</p>
          ) : (
            <div className="divide-y divide-border">
              {history.map((c) => (
                <div key={c._id} className="py-3.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">
                      {t(`checkin.moods.${c.mood}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.date).toLocaleDateString()}
                    </span>
                  </div>
                  {c.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  )}
                  {c.physicalMetrics && (
                    <p className="mt-1 text-xs text-primary">
                      Sleep: {c.physicalMetrics.sleepDurationHours ?? '-'}h · Energy:{' '}
                      {c.physicalMetrics.energyLevel ?? '-'}/5 · Stress:{' '}
                      {c.physicalMetrics.stressLevel ?? '-'}/5
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'insights' && (
        <div className="rounded-xl border border-border bg-surface p-6">
          {!hasCheckedInToday ? (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">{t('checkin.needTodayTitle')}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('checkin.needTodayBody')}
              </p>
              <button
                type="button"
                onClick={() => setTab('today')}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                {t('checkin.goToToday')}
              </button>
            </div>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : (
            <div
              className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(recommendation || t('checkin.noHistory'))),
              }}
            />
          )}
        </div>
      )}

      {tab === 'summary' && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('checkin.summaryTitle')}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t('checkin.summaryDesc')}</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface-muted sm:w-auto"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              {t('checkin.printSummary')}
            </button>
          </div>

          {summary && (
            <div className="mt-5 space-y-4 text-sm">
              <p className="rounded-lg bg-surface-muted p-3 text-xs text-muted-foreground">
                {summary.disclaimer}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Avg Sleep</div>
                  <div className="mt-1 text-lg font-bold">
                    {summary.physicalAverages?.sleepDurationHours ?? '—'} h
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Avg Energy</div>
                  <div className="mt-1 text-lg font-bold">
                    {summary.physicalAverages?.energyLevel ?? '—'} / 5
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Avg Stress</div>
                  <div className="mt-1 text-lg font-bold">
                    {summary.physicalAverages?.stressLevel ?? '—'} / 5
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <CustomModal modal={modal} setModal={setModal} />
    </div>
  );
};
