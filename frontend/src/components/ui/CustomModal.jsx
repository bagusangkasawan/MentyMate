import React from 'react';
import { useTranslation } from 'react-i18next';

export const CustomModal = ({
  modal,
  setModal,
  title: propTitle,
  message: propMessage,
  show: propShow,
  onClose: propOnClose,
  confirmText: propConfirmText,
  cancelText: propCancelText,
  onConfirm: propOnConfirm,
  onCancel: propOnCancel,
}) => {
  const { t } = useTranslation();

  const show = modal ? modal.show : propShow;
  if (!show) return null;

  const title = modal ? modal.title : propTitle;
  const message = modal ? modal.message : propMessage;
  const confirmText = modal ? modal.confirmText : propConfirmText;
  const cancelText = modal ? modal.cancelText : propCancelText;
  const onClose = modal
    ? modal.onClose || (() => setModal?.({ show: false }))
    : propOnClose;
  const onConfirm = modal ? modal.onConfirm : propOnConfirm;
  const onCancel = modal ? modal.onCancel : propOnCancel;
  const isDestructive = modal ? Boolean(modal.isDestructive) : false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">
        <h3 className={`text-lg font-bold ${isDestructive ? 'text-crisis' : 'text-primary'}`}>
          {title}
        </h3>
        <div
          className="mt-2 mb-5 text-sm leading-relaxed text-foreground"
          dangerouslySetInnerHTML={{ __html: message }}
        />

        <div className="flex gap-2.5">
          {cancelText && (
            <button
              type="button"
              onClick={onCancel || onClose}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted"
            >
              {cancelText}
            </button>
          )}
          {confirmText ? (
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                isDestructive ? 'bg-crisis hover:opacity-90' : 'bg-primary hover:bg-primary-hover'
              }`}
            >
              {confirmText}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {t('common.close')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
