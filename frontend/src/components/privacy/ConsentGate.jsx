import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../hooks/useApi';

export const ConsentGate = ({ featureKey, token, onGranted }) => {
  const { t } = useTranslation();
  const { callApi, loading } = useApi();
  const [error, setError] = useState('');

  const handleGrant = async () => {
    setError('');
    try {
      await callApi('/privacy/consents', 'PUT', { [featureKey]: true }, token);
      onGranted?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-bold text-foreground">{t('privacy.gateTitle')}</h2>
          <p className="mt-1 text-sm font-semibold text-primary">
            {t(`privacy.consentItems.${featureKey}.title`)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t(`privacy.consentItems.${featureKey}.desc`)}
          </p>
          {error && <p className="mt-2 text-xs text-crisis">{error}</p>}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleGrant}
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? t('common.loading') : t('privacy.gateGrant')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
