import React from 'react';

/**
 * Crisp inline SVG flag icons (US & Indonesia) for the language switcher.
 * @param {object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
export const FlagUS = ({ className = 'h-3.5 w-5' }) => (
  <svg
    viewBox="0 0 24 16"
    className={`shrink-0 rounded-[2px] border border-black/10 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="16" fill="#FFFFFF" />
    <rect y="0" width="24" height="2" fill="#B22234" />
    <rect y="4" width="24" height="2" fill="#B22234" />
    <rect y="8" width="24" height="2" fill="#B22234" />
    <rect y="12" width="24" height="2" fill="#B22234" />
    <rect width="11" height="9" fill="#3C3B6E" />
    <circle cx="3" cy="2.5" r="0.7" fill="#FFFFFF" />
    <circle cx="6" cy="2.5" r="0.7" fill="#FFFFFF" />
    <circle cx="9" cy="2.5" r="0.7" fill="#FFFFFF" />
    <circle cx="4.5" cy="4.5" r="0.7" fill="#FFFFFF" />
    <circle cx="7.5" cy="4.5" r="0.7" fill="#FFFFFF" />
    <circle cx="3" cy="6.5" r="0.7" fill="#FFFFFF" />
    <circle cx="6" cy="6.5" r="0.7" fill="#FFFFFF" />
    <circle cx="9" cy="6.5" r="0.7" fill="#FFFFFF" />
  </svg>
);

export const FlagID = ({ className = 'h-3.5 w-5' }) => (
  <svg
    viewBox="0 0 24 16"
    className={`shrink-0 rounded-[2px] border border-black/10 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="8" fill="#CE1126" />
    <rect y="8" width="24" height="8" fill="#FFFFFF" />
  </svg>
);

export const LanguageFlag = ({ lang, className }) =>
  lang === 'id' ? <FlagID className={className} /> : <FlagUS className={className} />;
