import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  HeartHandshake,
  ChevronRight,
  ChevronDown,
  Activity,
  ClipboardCheck,
  Wind,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const HomePage = ({ onOpenCrisis }) => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(0);

  const pillars = t('landing.pillars', { returnObjects: true }) || [];
  const faqs = t('landing.faqs', { returnObjects: true }) || [];
  const intents = t('landing.intents', { returnObjects: true }) || [];

  const intentMeta = [
    { to: '/checkin', icon: Activity, tint: 'bg-warm-amber/70 border-border', iconBg: 'bg-surface' },
    { to: '/assessment', icon: ClipboardCheck, tint: 'bg-warm-sky/70 border-border', iconBg: 'bg-surface' },
    { to: '/support', icon: Wind, tint: 'bg-accent-soft/70 border-border', iconBg: 'bg-surface' },
    { to: null, icon: ShieldAlert, tint: 'bg-warm-coral/80 border-crisis-border', iconBg: 'bg-surface text-crisis' },
  ];

  return (
    <div>
      {/* 1. Linear-inspired Left-Aligned Editorial Hero + Full-Width Workspace Canvas */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 lg:pb-20 lg:pt-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-secondary">{t('common.tagline')}</p>
          <h1 className="mt-3 text-[clamp(1.85rem,1.25rem+2.4vw,3.15rem)] font-bold leading-[1.1] text-foreground">
            {t('landing.headline')}
          </h1>
          <p className="mt-4 max-w-2xl text-[clamp(0.975rem,0.9rem+0.3vw,1.125rem)] leading-relaxed text-muted-foreground">
            {t('landing.subheadline')}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/checkin"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:bg-primary-hover active:scale-[0.98] sm:w-auto"
            >
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('landing.primaryCta')}
            </Link>

            <Link
              to="/support"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface px-7 py-3 text-sm font-semibold text-foreground transition-transform hover:bg-surface-muted active:scale-[0.98] sm:w-auto"
            >
              <HeartHandshake className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('landing.secondaryCta')}
            </Link>
          </div>
        </div>

        {/* Linear-style Framed Workspace Canvas with Top Toolbar Strip */}
        <div className="@container mt-10 overflow-hidden rounded-3xl border border-border bg-surface shadow-xs sm:mt-12">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-muted/60 px-5 py-3">
            <span className="text-xs font-semibold text-muted-foreground">
              {t('landing.preview.label')}
            </span>
            <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              EN / ID
            </span>
          </div>

          <div className="grid gap-4 p-4 sm:p-6 @md:grid-cols-3">
            <Link
              to="/checkin"
              className="rounded-2xl border border-border bg-warm-amber/40 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs font-medium text-muted-foreground">
                {t('landing.preview.moodTitle')}
              </div>
              <div className="mt-2 font-display text-lg font-bold tabular-nums text-foreground">
                {t('landing.preview.moodStatus')}
              </div>
              <svg viewBox="0 0 180 40" className="mt-3 h-8 w-full" aria-hidden="true">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  className="text-secondary"
                  strokeWidth="2.5"
                  points="4,30 38,24 72,26 106,16 140,18 176,10"
                />
              </svg>
            </Link>

            <Link
              to="/assessment"
              className="rounded-2xl border border-border bg-warm-sky/50 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs font-medium text-muted-foreground">
                {t('landing.preview.screenTitle')}
              </div>
              <div className="mt-2 font-display text-lg font-bold text-foreground">
                {t('landing.preview.screenStatus')}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                <span className="h-2 w-12 rounded-full bg-primary" />
                <span className="h-2 w-8 rounded-full bg-secondary" />
                <span className="h-2 w-6 rounded-full bg-border" />
              </div>
            </Link>

            <button
              type="button"
              onClick={onOpenCrisis}
              className="rounded-2xl border border-crisis-border bg-warm-coral/60 p-5 text-left transition-colors hover:bg-warm-coral"
            >
              <div className="text-xs font-medium text-crisis">
                {t('landing.preview.safetyTitle')}
              </div>
              <div className="mt-2 font-display text-lg font-bold text-foreground">
                {t('landing.preview.safetyStatus')}
              </div>
              <div className="mt-3 text-xs font-semibold tabular-nums text-crisis">
                112 · 119 · 800-1717 · 988
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Headspace-inspired 2x2 Warm Color-Blocked Intent Selector */}
      <section className="border-t border-border bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t('landing.intentTitle')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {t('landing.intentSubtitle')}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {intents.map((item, idx) => {
              const meta = intentMeta[idx] || intentMeta[0];
              const Icon = meta.icon;
              const content = (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className={`mt-0.5 rounded-xl border border-border p-3 text-primary ${meta.iconBg}`}>
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </div>
              );

              return meta.to ? (
                <Link
                  key={idx}
                  to={meta.to}
                  className={`block min-h-[48px] rounded-2xl border p-6 transition-transform hover:border-primary/40 active:scale-[0.99] ${meta.tint}`}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={idx}
                  type="button"
                  onClick={onOpenCrisis}
                  className={`block min-h-[48px] w-full rounded-2xl border p-6 text-left transition-transform hover:opacity-95 active:scale-[0.99] ${meta.tint}`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Linear-style Numbered 6 Pillars Hairline Sequence */}
      <section className="border-t border-border py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              {t('landing.pillarsTitle')}
            </h2>
            <p className="mt-2 text-base text-muted-foreground">{t('landing.pillarsSubtitle')}</p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="divide-y divide-border">
              {pillars.map((pillar) => (
                <div
                  key={pillar.code}
                  className="grid gap-2 px-5 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-4 sm:px-6"
                >
                  <div className="text-sm font-bold tabular-nums text-primary sm:col-span-1">
                    {pillar.code}
                  </div>
                  <h3 className="text-base font-bold text-foreground sm:col-span-4">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:col-span-7">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Headspace-style Clean Accordion FAQ */}
      <section className="border-t border-border bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">{t('landing.faqTitle')}</h2>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="flex min-h-[44px] w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="text-base font-bold text-foreground">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 pr-8 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
