import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { CustomModal } from '../components/ui/CustomModal';
import { setAppLanguage } from '../i18n';

/**
 * User sign-in page that syncs preferred language and hydrates the session profile.
 * @param {object} props
 * @param {(token: string, user: object) => void} props.onLogin
 * @returns {JSX.Element}
 */
export const LoginPage = ({ onLogin }) => {
  const { t } = useTranslation();
  const { loading, callApi, modal, setModal } = useApi();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await callApi('/auth/login', 'POST', { username, password });
      if (data.preferredLanguage) {
        setAppLanguage(data.preferredLanguage);
      }
      const profile = await callApi('/auth/me', 'GET', null, data.token);
      onLogin(data.token, profile);
    } catch {
      // handled by useApi
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-foreground">{t('auth.loginTitle')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('auth.username')}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('auth.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? t('common.loading') : t('auth.loginBtn')}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            {t('common.register')}
          </Link>
        </p>
      </div>
      <CustomModal modal={modal} setModal={setModal} />
    </div>
  );
};
