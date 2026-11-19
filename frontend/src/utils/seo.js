const SITE_URL = 'https://mentymate.mategroup.id';
const JSON_LD_ID = 'mentymate-dynamic-jsonld';

function setMetaTag(selector, attrName, attrVal, content) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Updates per-route canonical URL, meta description, Open Graph tags, and optional JSON-LD schema.
 * @param {object} params
 * @param {string} [params.title]
 * @param {string} [params.description]
 * @param {string} [params.path='/']
 * @param {object|null} [params.jsonLd=null]
 * @returns {void}
 */
export function updateSeoMeta({ title, description, path = '/', jsonLd = null }) {
  if (typeof document === 'undefined') return;

  const fullUrl = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (title) {
    document.title = title;
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  }
  if (description) {
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  }

  setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullUrl);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', fullUrl);

  const existingScript = document.getElementById(JSON_LD_ID);
  if (jsonLd) {
    const script = existingScript || document.createElement('script');
    script.id = JSON_LD_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    if (!existingScript) document.head.appendChild(script);
  } else if (existingScript) {
    existingScript.remove();
  }
}

/**
 * Removes any route-specific JSON-LD script when navigating away.
 * @returns {void}
 */
export function clearDynamicJsonLd() {
  if (typeof document === 'undefined') return;
  document.getElementById(JSON_LD_ID)?.remove();
}
