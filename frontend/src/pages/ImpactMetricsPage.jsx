import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  RefreshCw,
  ShieldAlert,
  Globe,
  TrendingDown,
  Activity,
  Lock,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';

export const ImpactMetricsPage = () => {
  const { t } = useTranslation();
  const { callApi, loading } = useApi();
  const [summary, setSummary] = useState(null);

  const loadSummary = useCallback(async () => {
    try {
      const data = await callApi('/analytics/summary', 'GET', null, null, { silent: true });
      setSummary(data);
    } catch {
      setSummary(null);
    }
  }, [callApi]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const enCount = summary?.languageAccessibility?.en || 0;
  const idCount = summary?.languageAccessibility?.id || 0;
  const langTotal = enCount + idCount;
  const enPct = langTotal > 0 ? Math.round((enCount / langTotal) * 100) : 50;
  const idPct = langTotal > 0 ? 100 - enPct : 50;

  const geoEntries = Object.entries(summary?.geographyFairness || {}).sort((a, b) => b[1] - a[1]);
  const geoTotal = geoEntries.reduce((acc, [, c]) => acc + c, 0);

  const screeningRate = summary?.outcomes?.screeningCompletionRate ?? 0;
  const crisisRate = summary?.safety?.guidanceCompletionRate ?? 0;
  const symptom = summary?.outcomes?.symptomImprovement;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-6 w-6 shrink-0" aria-hidden="true" />
            <h1 className="text-[clamp(1.5rem,1.2rem+1.2vw,2.1rem)] font-bold text-foreground">
              {t('impact.title')}
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('impact.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={loadSummary}
          disabled={loading}
          className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted disabled:opacity-60 sm:w-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{t('impact.refresh')}</span>
        </button>
      </div>

      {loading && !summary ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          {t('common.loading')}
        </div>
      ) : (
        <>
          {/* Section 1: Early Identification & Care Conversion */}
          <section className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border bg-surface-muted/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t('impact.sections.conversion')}
                </h2>
              </div>
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                Live
              </span>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {/* Screening Completion with Progress Bar */}
              <div className="rounded-2xl border border-border bg-warm-sky/45 p-5">
                <div className="text-xs font-semibold text-muted-foreground">
                  {t('impact.cards.screeningRate')}
                </div>
                <div className="mt-2 font-display text-3xl font-bold tabular-nums text-primary">
                  {screeningRate}%
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${screeningRate}%` }}
                  />
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                  {t('impact.descriptions.screeningRate')}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-warm-amber/45 p-5">
                <div className="text-xs font-semibold text-muted-foreground">
                  {t('impact.cards.checkins')}
                </div>
                <div className="mt-2 font-display text-3xl font-bold tabular-nums text-foreground">
                  {summary?.outcomes?.checkinSubmitted ?? 0}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t('impact.descriptions.checkins')}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-5">
                <div className="text-xs font-semibold text-muted-foreground">
                  {t('impact.cards.activityUsed')}
                </div>
                <div className="mt-2 font-display text-3xl font-bold tabular-nums text-foreground">
                  {summary?.outcomes?.activityUsed ?? 0}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t('impact.descriptions.activityUsed')}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-5">
                <div className="text-xs font-semibold text-muted-foreground">
                  {t('impact.cards.directoryViews')}
                </div>
                <div className="mt-2 font-display text-3xl font-bold tabular-nums text-foreground">
                  {summary?.outcomes?.directoryViewed ?? 0}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t('impact.descriptions.directoryViews')}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-accent-soft/50 p-5 sm:col-span-2 lg:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  {t('impact.cards.referralFollowups')}
                </div>
                <div className="mt-2 font-display text-3xl font-bold tabular-nums text-primary">
                  {summary?.outcomes?.referralFollowupConfirmed ?? 0}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t('impact.descriptions.referralFollowups')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Safety Telemetry & Longitudinal Outcomes */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Safety Telemetry */}
            <section className="overflow-hidden rounded-2xl border border-crisis-border bg-surface">
              <div className="flex items-center gap-2 border-b border-crisis-border bg-warm-coral/70 px-5 py-3">
                <ShieldAlert className="h-4 w-4 text-crisis" aria-hidden="true" />
                <h2 className="text-xs font-bold uppercase tracking-wide text-crisis">
                  {t('impact.sections.safety')}
                </h2>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="text-xs text-muted-foreground">
                      {t('impact.cards.crisisTotal')}
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">
                      {summary?.safety?.totalIncidents ?? 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-crisis-border bg-warm-coral/40 p-4">
                    <div className="text-xs text-crisis">
                      {t('impact.cards.crisisRate')}
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold tabular-nums text-crisis">
                      {crisisRate}%
                    </div>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-crisis transition-all"
                    style={{ width: `${crisisRate}%` }}
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t('impact.descriptions.crisisRate')}
                </p>
              </div>
            </section>

            {/* Symptom Outcomes */}
            <section className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border bg-surface-muted/60 px-5 py-3">
                <TrendingDown className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t('impact.sections.outcomes')}
                </h2>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-warm-sky/40 p-4">
                    <div className="text-xs text-muted-foreground">
                      {t('impact.cards.symptomImprovement')}
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold tabular-nums text-primary">
                      {symptom?.trackedPairs > 0 ? `${symptom.improvedRate}%` : '—'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="text-xs text-muted-foreground">Avg Score Delta</div>
                    <div className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">
                      {symptom?.trackedPairs > 0 ? `${symptom.avgPointReduction} pts` : '—'}
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t('impact.descriptions.symptomImprovement')}
                </p>
              </div>
            </section>
          </div>

          {/* Section 3: Language & Geography Fairness */}
          <section className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border bg-surface-muted/60 px-5 py-3">
              <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('impact.sections.equity')}
              </h2>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-2">
              {/* Language Split Bar */}
              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>{t('impact.cards.langParity')}</span>
                  <span className="tabular-nums text-xs text-muted-foreground">
                    {enCount} EN · {idCount} ID
                  </span>
                </div>
                <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="bg-primary transition-all"
                    style={{ width: `${enPct}%` }}
                    title={`EN: ${enPct}%`}
                  />
                  <div
                    className="bg-secondary transition-all"
                    style={{ width: `${idPct}%` }}
                    title={`ID: ${idPct}%`}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
                  <span>English ({enPct}%)</span>
                  <span>Bahasa Indonesia ({idPct}%)</span>
                </div>
              </div>

              {/* Geography Coverage Breakdown */}
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {t('impact.cards.geographyFairness')}
                </div>
                {geoEntries.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">—</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {geoEntries.slice(0, 5).map(([code, count]) => {
                      const pct = geoTotal > 0 ? Math.round((count / geoTotal) * 100) : 0;
                      return (
                        <div key={code} className="flex items-center gap-3 text-xs">
                          <span className="w-12 font-bold text-foreground">{code}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                            <div
                              className="h-full rounded-full bg-secondary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-16 text-right tabular-nums text-muted-foreground">
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Privacy Guarantee Footer Note */}
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p>{t('impact.descriptions.privacyNote')}</p>
          </div>
        </>
      )}
    </div>
  );
};
