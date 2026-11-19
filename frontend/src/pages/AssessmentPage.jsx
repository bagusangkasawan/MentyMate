import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, TrendingUp } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getCached, withSessionCache, removeCached } from '../utils/sessionCache';
import { INSTRUMENTS } from '../data/instruments';
import { ConsentGate } from '../components/privacy/ConsentGate';

/**
 * Validated PHQ-9 & GAD-7 self-assessment page with baseline trends.
 * Caches assessment history/insights per session and invalidates on new submissions.
 * @param {object} props
 * @param {string} props.token
 * @param {(protocol: object, incidentId: string) => void} props.onTriggerCrisis
 * @returns {JSX.Element}
 */
export const AssessmentPage = ({ token, onTriggerCrisis }) => {
  const { t, i18n } = useTranslation();
  const { callApi, loading } = useApi();

  const lang = i18n.language === 'id' ? 'id' : 'en';
  const [instrument, setInstrument] = useState('PHQ-9');
  const [answers, setAnswers] = useState(Array(9).fill(0));
  const [consentRequired, setConsentRequired] = useState(false);
  const [insights, setInsights] = useState(() => getCached('user:assessments:data')?.insights || null);
  const [history, setHistory] = useState(() => getCached('user:assessments:data')?.history || []);
  const [latestResult, setLatestResult] = useState(null);

  const loadData = useCallback(
    async (force = false) => {
      try {
        const data = await withSessionCache(
          'user:assessments:data',
          async () => {
            const ins = await callApi('/assessments/insights', 'GET', null, token, { silent: true });
            return { insights: ins, history: ins?.assessments || [] };
          },
          { force }
        );
        setInsights(data.insights || null);
        setHistory(data.history || []);
        setConsentRequired(false);
      } catch (err) {
        if (err.code === 'CONSENT_REQUIRED') {
          setConsentRequired(true);
        }
      }
    },
    [callApi, token]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const handleInstrumentChange = (next) => {
    setInstrument(next);
    setAnswers(Array(next === 'PHQ-9' ? 9 : 7).fill(0));
    setLatestResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      callApi('/analytics/events', 'POST', {
        eventType: 'screening_started',
        language: lang,
        metadata: { instrument },
      }, null, { silent: true }).catch(() => {});

      const res = await callApi(
        '/assessments',
        'POST',
        { type: instrument, answers, language: lang },
        token
      );
      setLatestResult(res.assessment);
      removeCached('user:assessments:data');
      removeCached('public:impact:summary');
      if (res.isCrisis) {
        onTriggerCrisis(res.crisisProtocol, res.incidentId);
      }
      await loadData(true);
    } catch (err) {
      if (err.code === 'CONSENT_REQUIRED') {
        setConsentRequired(true);
      }
    }
  };

  if (consentRequired) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <ConsentGate featureKey="selfAssessment" token={token} onGranted={() => loadData(true)} />
      </div>
    );
  }

  const currentSpec = INSTRUMENTS[instrument];
  const questions = currentSpec.items[lang];
  const options = t('assessment.options', { returnObjects: true }) || [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('assessment.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('assessment.subtitle')}</p>
        <p className="mt-2 rounded-lg border border-border bg-surface-muted px-3.5 py-2 text-xs text-muted-foreground">
          {t('common.nonDiagnosticNote')}
        </p>
      </div>

      {/* Personal Baseline & Trend Summary (Linear Workspace Panel) */}
      {insights?.baseline && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border bg-surface-muted/60 px-5 py-3">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <h2 className="text-sm font-bold text-foreground">{t('assessment.baselineTitle')}</h2>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-4 sm:p-5">
            <div className="rounded-xl border border-border bg-warm-sky/45 p-3.5">
              <div className="text-xs text-muted-foreground">PHQ-9 Latest / Baseline</div>
              <div className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {insights.baseline.latestPhq9 ?? '—'} / {insights.baseline.phq9Baseline ?? '—'}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-warm-amber/45 p-3.5">
              <div className="text-xs text-muted-foreground">GAD-7 Latest / Baseline</div>
              <div className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {insights.baseline.latestGad7 ?? '—'} / {insights.baseline.gad7Baseline ?? '—'}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3.5">
              <div className="text-xs text-muted-foreground">Mood Check-ins</div>
              <div className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {insights.baseline.checkinCount}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-accent-soft/50 p-3.5">
              <div className="text-xs text-muted-foreground">Mood Trend</div>
              <div className="mt-1 text-xl font-bold text-primary">
                {t(`assessment.trendLabels.${insights.baseline.moodTrend}`)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questionnaire Card */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">
              {t('assessment.selectInstrument')}
            </span>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto">
            {['PHQ-9', 'GAD-7'].map((inst) => (
              <button
                key={inst}
                type="button"
                onClick={() => handleInstrumentChange(inst)}
                className={`min-h-[44px] w-full rounded-full px-5 py-2 text-sm font-semibold transition-colors sm:w-auto ${
                  instrument === inst
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-foreground hover:bg-surface-muted'
                }`}
              >
                {inst === 'PHQ-9' ? t('assessment.phq9Name') : t('assessment.gad7Name')}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-foreground">{t('assessment.timeframePrompt')}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {questions.map((qText, idx) => (
            <fieldset key={idx} className="rounded-lg border border-border bg-background p-4">
              <legend className="px-1 text-sm font-semibold text-foreground">
                {idx + 1}. {qText}
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                {options.map((optLabel, val) => (
                  <label
                    key={val}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                      answers[idx] === val
                        ? 'border-primary bg-accent-soft text-foreground'
                        : 'border-border bg-surface text-muted-foreground hover:bg-surface-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      value={val}
                      checked={answers[idx] === val}
                      onChange={() =>
                        setAnswers((prev) => prev.map((v, i) => (i === idx ? val : v)))
                      }
                      className="accent-primary"
                    />
                    <span>{optLabel}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground">{currentSpec.citation[lang]}</p>
            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60 sm:w-auto"
            >
              {loading ? t('common.loading') : t('assessment.submit')}
            </button>
          </div>
        </form>

        {latestResult && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-accent-soft p-5">
            <h3 className="text-base font-bold text-foreground">{t('assessment.resultTitle')}</h3>
            <div className="mt-2 flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">{t('assessment.scoreLabel')}: </span>
                <strong className="text-foreground">{latestResult.totalScore}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">{t('assessment.severityLabel')}: </span>
                <strong className="text-primary">
                  {t(`assessment.bands.${latestResult.severityBand}`)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History + Longitudinal SVG Trend Chart */}
      {history.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-bold text-foreground">{t('assessment.historyTitle')}</h2>

          {history.length >= 2 && (
            <div className="mt-4 rounded-lg border border-border bg-background p-4">
              <svg
                viewBox="0 0 400 100"
                className="h-28 w-full overflow-visible"
                role="img"
                aria-label="Assessment longitudinal score trend"
              >
                {(() => {
                  const pts = [...history].slice(0, 10).reverse();
                  const maxScore = 27;
                  const coords = pts.map((item, idx) => {
                    const x = pts.length === 1 ? 200 : (idx / (pts.length - 1)) * 380 + 10;
                    const y = 90 - (Math.min(item.totalScore, maxScore) / maxScore) * 75;
                    return { x, y, score: item.totalScore, type: item.type };
                  });
                  const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ');
                  return (
                    <>
                      <line x1="10" y1="90" x2="390" y2="90" stroke="currentColor" className="text-border" strokeWidth="1" />
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        className="text-primary"
                        strokeWidth="2.5"
                        points={polyline}
                      />
                      {coords.map((c, i) => (
                        <g key={i}>
                          <circle cx={c.x} cy={c.y} r="4" className="fill-secondary" />
                          <text x={c.x} y={c.y - 8} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
                            {c.score}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          )}

          <div className="mt-4 divide-y divide-border">
            {history.slice(0, 8).map((item) => (
              <div key={item._id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <span className="font-semibold text-foreground">{item.type}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{item.totalScore}</span>
                  <span className="rounded-md bg-surface-muted px-2.5 py-1 text-xs font-medium text-primary">
                    {t(`assessment.bands.${item.severityBand}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
