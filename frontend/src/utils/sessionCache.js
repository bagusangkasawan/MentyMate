const CACHE_PREFIX = 'mentymate_cache:';

/**
 * Read a cached JSON payload from sessionStorage.
 * @param {string} key
 * @param {number|null} maxAgeMs Optional TTL in milliseconds
 * @returns {any|null}
 */
export const getCached = (key, maxAgeMs = null) => {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (maxAgeMs !== null && Date.now() - timestamp > maxAgeMs) {
      sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

/**
 * Persist a JSON payload in sessionStorage with a timestamp.
 * @param {string} key
 * @param {any} data
 */
export const setCached = (key, data) => {
  try {
    sessionStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Ignore storage quota or private-mode errors
  }
};

/**
 * Merge partial fields into an existing cached object.
 * @param {string} key
 * @param {Record<string, any>} partial
 */
export const patchCached = (key, partial) => {
  const existing = getCached(key);
  setCached(key, { ...(existing && typeof existing === 'object' ? existing : {}), ...partial });
};

/**
 * Remove a specific cache key from sessionStorage.
 * @param {string} key
 */
export const removeCached = (key) => {
  try {
    sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {
    // Ignore
  }
};

/**
 * Remove all cached entries whose key starts with the given prefix.
 * @param {string} prefix
 */
export const removeCachedByPrefix = (prefix) => {
  try {
    const fullPrefix = `${CACHE_PREFIX}${prefix}`;
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(fullPrefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // Ignore
  }
};

/**
 * Clear all user-scoped cached entries (e.g. on logout or account deletion).
 */
export const clearUserCache = () => removeCachedByPrefix('user:');

/**
 * Return cached data if available (and within maxAgeMs), otherwise invoke fetcher and cache its result.
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} fetcher
 * @param {{ force?: boolean, maxAgeMs?: number|null }} [options]
 * @returns {Promise<T>}
 */
export const withSessionCache = async (key, fetcher, { force = false, maxAgeMs = null } = {}) => {
  if (!force) {
    const cached = getCached(key, maxAgeMs);
    if (cached !== null) return cached;
  }
  const data = await fetcher();
  if (data !== undefined && data !== null) {
    setCached(key, data);
  }
  return data;
};
