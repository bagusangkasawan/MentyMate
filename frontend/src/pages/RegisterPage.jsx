import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/useApi';
import { CustomModal } from '../components/ui/CustomModal';
import { COUNTRIES } from '../config/language';

export const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { loading, callApi, modal, setModal } = useApi();

  const [form, setForm] = useState({
    username: '',
    password: '',
    phone: '',
    preferredLanguage: i18n.language === 'id' ? 'id' : 'en',
    country: 'ID',
    region: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await callApi('/auth/register', 'POST', form);
      navigate('/login');
    } catch {
      // handled
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-foreground">{t('auth.registerTitle')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('auth.registerSubtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('auth.username')}
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('auth.password')}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground">
                {t('auth.preferredLanguage')}
              </label>
              <select
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="id">Bahasa Indonesia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground">
                {t('auth.country')}
              </label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              {t('auth.region')}
            </label>
            <input
              type="text"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              placeholder="Jabodetabek, Bandung..."
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? t('common.loading') : t('auth.registerBtn')}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t('common.signIn')}
          </Link>
        </p>
      </div>
      <CustomModal modal={modal} setModal={setModal} />
    </div>
  );
};
