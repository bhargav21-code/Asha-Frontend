import axios from 'axios';

const apiBaseURL = process.env.REACT_APP_API_URL || '/api';
const apiBase = new URL(apiBaseURL, window.location.origin);
const trustedApiPath = apiBase.pathname.replace(/\/+$/, '') || '/';

if (
  process.env.NODE_ENV === 'production' &&
  apiBase.protocol !== 'https:' &&
  !['localhost', '127.0.0.1'].includes(apiBase.hostname)
) {
  throw new Error('The production API must use HTTPS. Set REACT_APP_API_URL to an HTTPS URL.');
}

const api = axios.create({ baseURL: apiBaseURL });

function isTrustedApiRequest(config = {}) {
  try {
    const requestBase = new URL(config.baseURL || apiBaseURL, window.location.origin);
    const rawURL = config.url || '';
    const absoluteURL = /^[a-z][a-z\d+.-]*:/i.test(rawURL) || rawURL.startsWith('//');
    const target = absoluteURL
      ? new URL(rawURL, requestBase)
      : new URL(
          `${requestBase.pathname.replace(/\/+$/, '')}/${rawURL.replace(/^\/+/, '')}`,
          requestBase.origin
        );

    return (
      target.origin === apiBase.origin &&
      (target.pathname === trustedApiPath || target.pathname.startsWith(`${trustedApiPath}/`))
    );
  } catch {
    return false;
  }
}

api.interceptors.request.use((config) => {
  const headers = config.headers || {};
  if (isTrustedApiRequest(config)) {
    const token = localStorage.getItem('asha_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  } else if (typeof headers.delete === 'function') {
    headers.delete('Authorization');
  } else {
    delete headers.Authorization;
    delete headers.authorization;
  }
  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && isTrustedApiRequest(err.config)) {
      localStorage.removeItem('asha_token');
      localStorage.removeItem('asha_user');
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
