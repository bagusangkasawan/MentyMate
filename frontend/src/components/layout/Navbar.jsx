import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  ShieldAlert,
  MessageCircle,
  Home,
  HeartHandshake,
  BarChart3,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  ShieldCheck,
  Power,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../../i18n';
import { FlagUS, FlagID, LanguageFlag } from '../ui/LanguageFlag';
import { CustomModal } from '../ui/CustomModal';

/**
 * Responsive navigation shell: collapsible desktop sidebar, mobile header + bottom tab bar,
 * EN/ID flag language switcher, and persistent Crisis Help trigger.
 * @param {object} props
 * @param {object|null} props.user
 * @param {() => void} props.onLogout
 * @param {() => void} props.onChatbotOpen
 * @param {() => void} props.onOpenCrisis
 * @returns {JSX.Element}
 */
export const Navbar = ({ user, onLogout, onChatbotOpen, onOpenCrisis }) => {
  const { t, i18n } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const activeLang = i18n.language === 'id' ? 'id' : 'en';

  const toggleLanguage = () => {
    setAppLanguage(activeLang === 'id' ? 'en' : 'id');
  };

  const closeDrawer = () => setDrawerOpen(false);

  const navItems = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/support', label: t('nav.support'), icon: HeartHandshake },
    { to: '/impact', label: t('nav.impact'), icon: BarChart3 },
    { to: '/blog', label: t('nav.articles'), icon: BookOpen },
    ...(!user ? [{ to: '/try', label: t('nav.try'), icon: Sparkles }] : []),
    ...(user
      ? [
          { to: '/checkin', label: t('nav.checkin'), icon: CalendarCheck },
          { to: '/assessment', label: t('nav.assessment'), icon: ClipboardCheck },
          { to: '/privacy', label: t('nav.privacy'), icon: ShieldCheck },
        ]
      : []),
  ];

  const renderSidebarContent = (isCollapsed = false) => {
    const navLinkClass = ({ isActive }) =>
      `flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} rounded-xl py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-accent-soft text-primary font-semibold'
          : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
      }`;

    return (
      <div className={`flex h-full flex-col justify-between ${isCollapsed ? 'p-3' : 'p-4'}`}>
        <div className="space-y-6">
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between px-1'}`}>
            <Link
              to="/"
              onClick={closeDrawer}
              title="MentyMate"
              className="flex items-center gap-2.5"
            >
              <img src="/icon.png" alt="MentyMate" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
              {!isCollapsed && (
                <span className="font-display text-lg font-bold text-primary">MentyMate</span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden rounded-lg p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground lg:inline-flex"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-muted lg:hidden"
              aria-label={t('common.close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={closeDrawer}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  className={navLinkClass}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2.5 border-t border-border pt-4">
          <button
            type="button"
            title={isCollapsed ? t('nav.openChat') : undefined}
            aria-label={t('nav.openChat')}
            onClick={() => {
              closeDrawer();
              onChatbotOpen();
            }}
            className={`flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full bg-secondary py-2 text-xs font-semibold text-secondary-foreground transition-transform hover:opacity-95 active:scale-[0.98] ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>{t('nav.openChat')}</span>}
          </button>

          <button
            type="button"
            title={isCollapsed ? t('nav.urgentHelp') : undefined}
            aria-label={t('nav.urgentHelp')}
            onClick={() => {
              closeDrawer();
              onOpenCrisis();
            }}
            className={`flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full border border-crisis-border bg-crisis-bg py-2 text-xs font-semibold text-crisis transition-opacity hover:opacity-90 ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
          >
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>{t('nav.urgentHelp')}</span>}
          </button>

          {/* Language Switcher with USA & Indonesia Flags */}
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleLanguage}
              title={t('common.languageLabel')}
              aria-label={t('common.languageLabel')}
              className="flex min-h-[38px] w-full items-center justify-center rounded-full border border-border bg-background hover:bg-surface-muted"
            >
              <LanguageFlag lang={activeLang} />
            </button>
          ) : (
            <div
              role="group"
              aria-label={t('common.languageLabel')}
              className="grid grid-cols-2 gap-1 rounded-full border border-border bg-surface-muted p-1"
            >
              <button
                type="button"
                onClick={() => setAppLanguage('en')}
                className={`inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeLang === 'en'
                    ? 'bg-surface text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FlagUS />
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => setAppLanguage('id')}
                className={`inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeLang === 'id'
                    ? 'bg-surface text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FlagID />
                <span>ID</span>
              </button>
            </div>
          )}

          {user ? (
            <button
              type="button"
              title={isCollapsed ? t('common.signOut') : undefined}
              aria-label={t('common.signOut')}
              onClick={() => {
                closeDrawer();
                setConfirmLogout(true);
              }}
              className="inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-full bg-crisis px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Power className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {!isCollapsed && <span>{t('common.signOut')}</span>}
            </button>
          ) : (
            <Link
              to="/login"
              title={isCollapsed ? t('common.signIn') : undefined}
              aria-label={t('common.signIn')}
              onClick={closeDrawer}
              className="inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              <LogIn className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {!isCollapsed && <span>{t('common.signIn')}</span>}
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile & Tablet Top Bar (< lg) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-foreground hover:bg-surface-muted"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/icon.png" alt="MentyMate" className="h-7 w-7 rounded-md object-cover" />
            <span className="font-display text-base font-bold text-primary">MentyMate</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t('common.languageLabel')}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-surface-muted"
          >
            <LanguageFlag lang={activeLang} />
          </button>
          <button
            type="button"
            onClick={onOpenCrisis}
            aria-label={t('nav.urgentHelp')}
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-full bg-crisis px-3 text-xs font-semibold text-white hover:opacity-90"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{t('nav.urgentHelp')}</span>
          </button>
        </div>
      </header>

      {/* Desktop Sticky Collapsible Sidebar (>= lg) */}
      <aside
        className={`hidden shrink-0 border-r border-border bg-surface transition-[width] duration-200 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {renderSidebarContent(collapsed)}
      </aside>

      {/* Mobile Slide-Over Drawer (< lg) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-surface shadow-2xl">
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}

      {/* Mobile-First Bottom Navigation Bar (< lg) */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <div className="grid grid-cols-5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-[11px] font-medium ${
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <Home className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="w-full truncate text-center">{t('nav.mobile.home')}</span>
          </NavLink>

          <NavLink
            to="/support"
            className={({ isActive }) =>
              `flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-[11px] font-medium ${
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <HeartHandshake className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="w-full truncate text-center">{t('nav.mobile.support')}</span>
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/checkin"
                className={({ isActive }) =>
                  `flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-[11px] font-medium ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`
                }
              >
                <CalendarCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="w-full truncate text-center">{t('nav.mobile.checkin')}</span>
              </NavLink>

              <NavLink
                to="/assessment"
                className={({ isActive }) =>
                  `flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-[11px] font-medium ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`
                }
              >
                <ClipboardCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="w-full truncate text-center">{t('nav.mobile.assessment')}</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/impact"
                className={({ isActive }) =>
                  `flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-[11px] font-medium ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`
                }
              >
                <BarChart3 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="w-full truncate text-center">{t('nav.mobile.impact')}</span>
              </NavLink>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-[11px] font-medium ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`
                }
              >
                <LogIn className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="w-full truncate text-center">{t('nav.mobile.login')}</span>
              </NavLink>
            </>
          )}

          <button
            type="button"
            onClick={onChatbotOpen}
            className="flex min-h-[56px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 text-[11px] font-semibold text-secondary"
          >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="w-full truncate text-center">{t('nav.mobile.ai')}</span>
          </button>
        </div>
      </nav>

      <CustomModal
        modal={{
          show: confirmLogout,
          title: t('common.signOut'),
          message: t('common.signOutConfirm'),
          confirmText: t('common.signOut'),
          cancelText: t('common.cancel'),
          isDestructive: true,
          onConfirm: () => {
            setConfirmLogout(false);
            onLogout();
          },
          onCancel: () => setConfirmLogout(false),
        }}
      />
    </>
  );
};
