import { useEffect } from 'react';

/**
 * Enable closing a modal via Escape key and backdrop click when `enabled` is true.
 * @param {boolean} enabled
 * @param {() => void} onClose
 * @returns {(e: React.MouseEvent) => void} Backdrop click handler
 */
export const useDismissableModal = (enabled, onClose) => {
  useEffect(() => {
    if (!enabled) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onClose]);

  return (e) => {
    if (enabled && e.target === e.currentTarget) {
      onClose?.();
    }
  };
};
