import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../config/index';
import i18n from '../i18n';

/**
 * Shared fetch hook injecting `x-language` and Bearer JWT headers,
 * with centralized error modal state and memoized `callApi` identity.
 * @returns {{ loading: boolean, callApi: Function, modal: object, setModal: Function }}
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, title: '', message: '' });

  const callApi = useCallback(async (endpoint, method = 'GET', body = null, token = null, options = {}) => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-language': i18n.language || 'en',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config = { method, headers };
      if (body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        const err = new Error(errorData.message || errorData.error || `HTTP error ${response.status}`);
        err.status = response.status;
        err.code = errorData.code;
        err.feature = errorData.feature;
        throw err;
      }

      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      const silent =
        options.silent ||
        error.code === 'CONSENT_REQUIRED' ||
        (endpoint === '/chat' && error.status === 401);

      if (!silent) {
        console.error('API Call Error:', error);
        setModal({ show: true, title: 'Notice', message: error.message });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, callApi, modal, setModal };
};
