import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PHASES = [
  { key: 'inhale', seconds: 4 },
  { key: 'hold', seconds: 7 },
  { key: 'exhale', seconds: 8 },
];

export const BreathingExercise = ({ onCompleteCycle }) => {
  const { t, i18n } = useTranslation();
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [state, setState] = useState({
    phaseIdx: 0,
    remaining: PHASES[0].seconds,
    cycles: 0,
  });
  const onCompleteRef = useRef(onCompleteCycle);

  useEffect(() => {
    onCompleteRef.current = onCompleteCycle;
  }, [onCompleteCycle]);

  useEffect(() => {
    if (state.cycles > 0) {
      setRunning(false);
      setCompleted(true);
      onCompleteRef.current?.();
    }
  }, [state.cycles]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.remaining > 1) {
          return { ...prev, remaining: prev.remaining - 1 };
        }
        const nextIdx = prev.phaseIdx + 1;
        // Auto-stop after completing 1 full 4-7-8 cycle (inhale -> hold -> exhale)
        if (nextIdx >= PHASES.length) {
          return {
            phaseIdx: 0,
            remaining: PHASES[0].seconds,
            cycles: prev.cycles + 1,
          };
        }
        return {
          ...prev,
          phaseIdx: nextIdx,
          remaining: PHASES[nextIdx].seconds,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  const currentPhase = running ? PHASES[state.phaseIdx].key : 'ready';

  const circleScaleClass = !running
    ? 'scale-100 duration-500 ease-out'
    : currentPhase === 'inhale'
    ? 'scale-125 duration-[4000ms] ease-out'
    : currentPhase === 'hold'
    ? 'scale-125 duration-500 ease-linear'
    : 'scale-90 duration-[8000ms] ease-in-out';

  const haloScaleClass = !running
    ? 'scale-100 opacity-30 duration-500'
    : currentPhase === 'inhale'
    ? 'scale-150 opacity-60 duration-[4000ms] ease-out'
    : currentPhase === 'hold'
    ? 'scale-150 opacity-50 duration-500'
    : 'scale-95 opacity-25 duration-[8000ms] ease-in-out';

  return (
    <div className="@container flex w-full flex-col rounded-3xl border border-border bg-warm-sky/45 p-5 sm:p-7">
      <div className="flex flex-col gap-3 @sm:flex-row @sm:items-start @sm:justify-between @sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary">
            <Wind className="h-5 w-5 shrink-0" aria-hidden="true" />
            <h3 className="text-lg font-bold text-foreground">{t('support.breathingTitle')}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('support.breathingDesc')}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!running) {
              setCompleted(false);
              setState((prev) => ({
                ...prev,
                phaseIdx: 0,
                remaining: PHASES[0].seconds,
              }));
            }
            setRunning((r) => !r);
          }}
          className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:bg-primary-hover active:scale-[0.98] @sm:w-auto"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? t('support.stopBreathing') : t('support.startBreathing')}
        </button>
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface px-4 py-10">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <div
            aria-hidden="true"
            className={`absolute inset-4 rounded-full bg-accent-soft transition-transform ${haloScaleClass}`}
          />
          <div
            className={`relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-secondary bg-surface text-2xl font-bold text-primary transition-transform ${circleScaleClass}`}
          >
            {running ? `${state.remaining}s` : '4-7-8'}
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold text-foreground">
          {t(`support.phases.${currentPhase}`)}
        </p>

        {completed && !running && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {i18n.language === 'id'
              ? '1 siklus 4-7-8 selesai. Tekan Mulai lagi jika ingin mengulang.'
              : '1 full 4-7-8 cycle complete. Tap Start if you would like another round.'}
          </p>
        )}
      </div>
    </div>
  );
};
