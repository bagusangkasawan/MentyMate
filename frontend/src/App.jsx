import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from './hooks/useApi.js';
import { withSessionCache, clearUserCache } from './utils/sessionCache.js';
import { setAppLanguage } from './i18n';

import { Navbar } from './components/layout/Navbar.jsx';
import { ChatbotModal } from './components/chatbot/ChatbotModal.jsx';
import { CrisisSupportModal } from './components/safety/CrisisSupportModal.jsx';

import { HomePage } from './pages/HomePage.jsx';
import { TryPage } from './pages/TryPage.jsx';
import { BlogPage } from './pages/BlogPage.jsx';
import { CheckinPage } from './pages/CheckinPage.jsx';
import { AssessmentPage } from './pages/AssessmentPage.jsx';
import { SupportPage } from './pages/SupportPage.jsx';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage.jsx';
import { ImpactMetricsPage } from './pages/ImpactMetricsPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';

/**
 * Root application shell managing authentication state, routing, offline detection,
 * AI Companion chat state, and global Crisis Support modal orchestration.
 * @returns {JSX.Element}
 */
export default function App() {
  const { t, i18n } = useTranslation();
  const { callApi } = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    setIsChatOpen(false);
    const routeTitles = {
      '/': t('nav.home'),
      '/support': t('nav.support'),
      '/try': t('nav.try'),
      '/impact': t('nav.impact'),
      '/blog': t('nav.articles'),
      '/checkin': t('nav.checkin'),
      '/assessment': t('nav.assessment'),
      '/privacy': t('nav.privacy'),
      '/login': t('common.signIn'),
      '/register': t('common.register'),
    };
    const pageTitle = routeTitles[location.pathname] || (location.pathname.startsWith('/blog/') ? t('nav.articles') : '');
    document.title = pageTitle
      ? `${pageTitle} | MentyMate`
      : `MentyMate | ${t('common.tagline')}`;
  }, [location.pathname, i18n.language, t]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatQuota, setChatQuota] = useState(null);
  // Store a flag instead of static translated text so the greeting updates live when language switches.
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', isWelcome: true, isMarkdown: true },
  ]);

  const [crisisModal, setCrisisModal] = useState({
    isOpen: false,
    protocol: null,
    incidentId: null,
  });

  useEffect(() => {
    const storedToken = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleOpenCrisis = async (protocol = null, incidentId = null) => {
    if (protocol) {
      setCrisisModal({ isOpen: true, protocol, incidentId });
      return;
    }
    try {
      const country = user?.country || 'ID';
      const lang = i18n.language === 'id' ? 'id' : 'en';
      const data = await withSessionCache(`public:crisis:${country}:${lang}`, () =>
        callApi(`/chat/crisis-guidance?country=${country}`, 'GET', null, null, { silent: true })
      );
      setCrisisModal({ isOpen: true, protocol: data, incidentId: null });
    } catch {
      // Offline fallback inside CrisisSupportModal
      setCrisisModal({ isOpen: true, protocol: null, incidentId: null });
    }
  };

  const handleLogin = (newToken, userData) => {
    // Purge any prior user-scoped cache before hydrating the new session.
    clearUserCache();
    setToken(newToken);
    setUser(userData);
    sessionStorage.setItem('authToken', newToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    if (userData?.preferredLanguage) {
      setAppLanguage(userData.preferredLanguage);
    }
    navigate('/checkin');
  };

  const handleLogout = () => {
    clearUserCache();
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    setChatMessages([{ sender: 'bot', isWelcome: true, isMarkdown: true }]);
    setChatQuota(null);
    navigate('/');
  };

  const handleSendMessage = async (message) => {
    if (isTyping || !message.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'user', content: message, isMarkdown: false }]);
    setIsTyping(true);
    try {
      const data = await callApi(
        '/chat',
        'POST',
        { message, language: i18n.language === 'id' ? 'id' : 'en' },
        token,
        { silent: true }
      );
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', content: data.reply, isMarkdown: true },
      ]);
      if (data.quota) setChatQuota(data.quota);
      if (data.isCrisis) {
        handleOpenCrisis(data.crisisProtocol, data.incidentId);
      }
    } catch (error) {
      if (error.status === 429) {
        setChatQuota({ limit: 15, remaining: 0 });
      }
      if (error.status === 401) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'bot', content: t('common.loginRequired'), action: 'login' },
        ]);
      } else if (error.code === 'CONSENT_REQUIRED') {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'bot', content: t('chat.consentPrompt'), action: 'privacy' },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'bot', content: error.message, isMarkdown: false },
        ]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" replace />;
    return children;
  };

  const PublicOnlyRoute = ({ children }) => {
    if (token) return <Navigate to="/checkin" replace />;
    return children;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:flex-row">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onChatbotOpen={() => setIsChatOpen((open) => !open)}
        onOpenCrisis={() => handleOpenCrisis()}
      />

      <div className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
        {!isOnline && (
          <div
            role="status"
            className="border-b border-border bg-warm-amber px-4 py-2 text-center text-xs font-semibold text-foreground"
          >
            {t('common.offlineBanner')}
          </div>
        )}
        <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                user={user}
                onChatbotOpen={() => setIsChatOpen(true)}
                onOpenCrisis={() => handleOpenCrisis()}
              />
            }
          />
          <Route path="/support" element={<SupportPage user={user} />} />
          <Route
            path="/try"
            element={
              <PublicOnlyRoute>
                <TryPage onOpenCrisis={() => handleOpenCrisis()} />
              </PublicOnlyRoute>
            }
          />
          <Route path="/impact" element={<ImpactMetricsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPage />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage onLogin={handleLogin} />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/checkin"
            element={
              <ProtectedRoute>
                <CheckinPage token={token} onTriggerCrisis={handleOpenCrisis} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <AssessmentPage token={token} onTriggerCrisis={handleOpenCrisis} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <ProtectedRoute>
                <PrivacySettingsPage
                  token={token}
                  onUserUpdated={(updated) => {
                    setUser(updated);
                    sessionStorage.setItem('user', JSON.stringify(updated));
                  }}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </main>
      </div>

      <ChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        quota={chatQuota}
        onNavigate={(path) => navigate(path)}
        onOpenCrisis={() => handleOpenCrisis()}
      />

      <CrisisSupportModal
        isOpen={crisisModal.isOpen}
        onClose={() => setCrisisModal({ isOpen: false, protocol: null, incidentId: null })}
        protocol={crisisModal.protocol}
        incidentId={crisisModal.incidentId}
        token={token}
        trustedContact={user?.trustedContact}
      />
    </div>
  );
}
