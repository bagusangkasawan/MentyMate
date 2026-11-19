import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, ClipboardCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { INSTRUMENTS } from '../data/instruments';

const GUEST_STORAGE_KEY = 'mentymate_guest_preview';

function scorePreview(type, answers) {
  const total = answers.reduce((sum, val) => sum + Number(val || 0), 0);
  let band = 'minimal';
  if (type === 'PHQ-9') {
    if (total >= 20) band = 'severe';
    else if (total >= 15) band = 'moderately_severe';
    else if (total >= 10) band = 'moderate';
    else if (total >= 5) band = 'mild';
  } else {
    if (total >= 15) band = 'severe';
    else if (total >= 10) band = 'moderate';
    else if (total >= 5) band = 'mild';
  }
  const item9Triggered = type === 'PHQ-9' && Number(answers[8] || 0) > 0;
  return { total, band, isCrisis: item9Triggered || (type === 'PHQ-9' && total >= 20) || (type === 'GAD-7' && total >= 15) };
}

/**
 * Guest preview page allowing visitors to try a 1x local-only mood snapshot
 * and PHQ-9/GAD-7 screening without creating an account.
 * @param {object} props
 * @param {() => void} props.onOpenCrisis
 * @returns {JSX.Element}
 */
export const TryPage = ({ onOpenCrisis }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'id' ? 'id' : 'en';

  const [savedMood, setSavedMood] = useState(() => {
    try {
      const raw = localStorage.getItem(GUEST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [mood, setMood] = useState(savedMood?.mood || 'baik');
  const [stress, setStress] = useState(savedMood?.stress || 3);
  const [moodSavedNotice, setMoodSavedNotice] = useState(false);

  const [instrument, setInstrument] = useState('PHQ-9');
  const [answers, setAnswers] = useState(Array(9).fill(0));
  const [result, setResult] = useState(null);

  const handleSaveMood = () => {
    const entry = { mood, stress, date: new Date().toISOString() };
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(entry));
    } catch {
      // ignore storage errors
    }
    setSavedMood(entry);
    setMoodSavedNotice(true);
  };

  const handleInstrumentChange = (next) => {
    setInstrument(next);
    setAnswers(Array(next === 'PHQ-9' ? 9 : 7).fill(0));
    setResult(null);
  };

  const handleScorePreview = (e) => {
    e.preventDefault();
    const computed = scorePreview(instrument, answers);
    setResult({ ...computed, type: instrument });
    if (computed.isCrisis) {
      onOpenCrisis?.();
    }
  };

  const questions = INSTRUMENTS[instrument].items[lang];
  const options = t('assessment.options', { returnObjects: true }) || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 overflow-x-hidden px-4 py-8 sm:space-y-8 sm:px-6 sm:py-10">
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t('try.badge')}</span>
        </span>
        <h1 className="mt-3 break-words text-2xl font-bold text-foreground sm:text-3xl">
          {t('try.title')}
        </h1>
        <p className="mt-1 max-w-2xl break-words text-sm text-muted-foreground">
          {t('try.subtitle')}
        </p>
      </div>

      {/* 1. Local Mood Snapshot */}
      <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="break-words text-lg font-bold text-foreground">{t('try.moodTitle')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {['baik', 'sedang', 'buruk'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setMood(val);
                setMoodSavedNotice(false);
              }}
              className={`min-h-[44px] w-full break-words rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                mood === val
                  ? 'border-primary bg-accent-soft text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-surface-muted'
              }`}
            >
              {t(`checkin.moods.${val}`)}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
            <span className="min-w-0 break-words">{t('checkin.stressLevel')}</span>
            <span className="shrink-0 font-semibold text-foreground">{stress}/5</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={stress}
            onChange={(e) => {
              setStress(Number(e.target.value));
              setMoodSavedNotice(false);
            }}
            className="mt-1.5 w-full accent-primary"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={handleSaveMood}
            className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover sm:w-auto"
          >
            {t('try.saveLocal')}
          </button>
          {moodSavedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="break-words">{t('try.savedLocal')}</span>
            </span>
          )}
        </div>
      </section>

      {/* 2. Local Screening Preview */}
      <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <ClipboardCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <h2 className="break-words text-lg font-bold text-foreground">{t('try.screeningTitle')}</h2>
          </div>
          <div className="flex shrink-0 gap-2">
            {['PHQ-9', 'GAD-7'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleInstrumentChange(item)}
                className={`min-h-[36px] rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                  instrument === item
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleScorePreview} className="mt-5 space-y-4">
          {questions.map((qText, idx) => (
            <div key={idx} className="min-w-0 rounded-xl border border-border bg-background p-3.5 sm:p-4">
              <p className="break-words text-sm font-semibold leading-snug text-foreground">
                {idx + 1}. {qText}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {options.map((optLabel, val) => (
                  <label
                    key={val}
                    className={`flex min-h-[42px] min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                      answers[idx] === val
                        ? 'border-primary bg-accent-soft text-foreground'
                        : 'border-border bg-surface text-muted-foreground hover:bg-surface-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`try-q-${idx}`}
                      value={val}
                      checked={answers[idx] === val}
                      onChange={() => {
                        const next = [...answers];
                        next[idx] = val;
                        setAnswers(next);
                      }}
                      className="shrink-0 accent-primary"
                    />
                    <span className="min-w-0 break-words leading-snug">{optLabel}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover sm:w-auto"
          >
            {t('try.scoreAction')}
          </button>
        </form>

        {result && (
          <div className="mt-5 min-w-0 rounded-xl border border-primary/30 bg-accent-soft/60 p-4">
            <p className="break-words text-xs font-bold uppercase tracking-wide text-primary">
              {t('try.resultTitle')} · {result.type}
            </p>
            <p className="mt-1 break-words text-lg font-bold text-foreground">
              {result.total} ({t(`assessment.bands.${result.band}`)})
            </p>
            <p className="mt-1 break-words text-xs text-muted-foreground">
              {t('common.nonDiagnosticNote')}
            </p>
          </div>
        )}
      </section>

      {/* Conversion CTA */}
      <section className="flex min-w-0 flex-col items-stretch justify-between gap-4 rounded-2xl border border-border bg-warm-amber/50 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="min-w-0">
          <h3 className="break-words text-base font-bold text-foreground">{t('try.ctaTitle')}</h3>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:shrink-0">
          <Link
            to="/register"
            className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover sm:w-auto"
          >
            {t('try.ctaButton')}
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-[42px] w-full items-center justify-center rounded-full border border-border bg-surface px-5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted sm:w-auto"
          >
            {t('try.loginButton')}
          </Link>
        </div>
      </section>
    </div>
  );
};
