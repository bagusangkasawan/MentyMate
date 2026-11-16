import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ShieldAlert } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next';

export const ChatbotModal = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isTyping,
  onNavigate,
  onOpenCrisis,
}) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!isTyping && input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('chat.title')}
      className="fixed inset-x-0 top-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-30 flex items-end justify-center bg-black/50 sm:inset-0 sm:z-[1000] sm:items-center sm:p-4"
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-surface sm:h-[88vh] sm:max-h-[680px] sm:max-w-2xl sm:rounded-xl sm:border sm:border-border sm:shadow-2xl">
        <header className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <div>
              <h2 className="text-base font-bold">{t('chat.title')}</h2>
              <p className="text-xs opacity-85">{t('chat.status')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCrisis}
              className="inline-flex items-center gap-1 rounded-md bg-crisis px-2.5 py-1 text-xs font-semibold text-white"
            >
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              {t('nav.urgentHelp')}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="rounded-md p-1 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div ref={chatBoxRef} className="flex-grow space-y-3 overflow-y-auto bg-background p-5">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                    isUser
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border bg-surface text-foreground shadow-sm'
                  }`}
                >
                  {msg.action === 'login' || msg.action === 'privacy' ? (
                    <div>
                      <p>{msg.content}</p>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate(msg.action === 'login' ? '/login' : '/privacy');
                          onClose();
                        }}
                        className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                      >
                        {msg.action === 'login' ? t('common.signIn') : t('nav.privacy')}
                      </button>
                    </div>
                  ) : isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-primary-foreground">
                      {msg.content}
                    </p>
                  ) : (
                    <div
                      className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground"
                      dangerouslySetInnerHTML={{
                        __html: msg.isMarkdown
                          ? DOMPurify.sanitize(marked.parse(msg.content))
                          : msg.content,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
                {t('common.loading')}
              </div>
            </div>
          )}
        </div>

        <footer className="border-t border-border bg-surface p-4">
          <div className="flex items-center gap-2.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t('chat.placeholder')}
              rows="1"
              className="flex-grow resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              aria-label={t('chat.send')}
              className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
