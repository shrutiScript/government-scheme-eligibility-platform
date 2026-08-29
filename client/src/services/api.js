import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

const getStorageItem = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Dynamic Bearer token retriever
 * Strictly tab-isolated using current tab's sessionStorage.
 */
export const getActiveToken = (roleContext = null, url = '', method = 'GET') => {
  const adminToken = getStorageItem('gov_admin_token');
  const userToken = getStorageItem('gov_user_token') || getStorageItem('gov_token');

  const upperMethod = (method || '').toUpperCase();
  const isModifyingScheme = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(upperMethod) && url?.includes('/schemes');
  const isAdminOperation =
    roleContext === 'admin' ||
    url?.startsWith('/admin') ||
    isModifyingScheme ||
    (typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin'));

  if (isAdminOperation) {
    return adminToken || null;
  }

  if (roleContext === 'user') {
    return userToken || null;
  }

  return userToken || null;
};

// Request Interceptor: Dynamically attach current active token
api.interceptors.request.use(
  (config) => {
    // If Authorization header is already explicitly defined, do not overwrite
    if (config.headers?.Authorization || config.headers?.authorization) {
      return config;
    }

    let roleContext = null;
    if (config.headers) {
      if (typeof config.headers.get === 'function') {
        roleContext = config.headers.get('x-role-context') || config.headers.get('X-Role-Context');
      } else {
        roleContext = config.headers['x-role-context'] || config.headers['X-Role-Context'];
      }
    }

    const adminToken = getStorageItem('gov_admin_token');
    const userToken = getStorageItem('gov_user_token') || getStorageItem('gov_token');

    const upperMethod = (config.method || '').toUpperCase();
    const isModifyingScheme = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(upperMethod) && config.url?.includes('/schemes');
    const isAdminPath = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin');

    let token = null;
    if (roleContext === 'admin' || config.url?.startsWith('/admin') || isModifyingScheme || isAdminPath) {
      token = adminToken || null;
    } else {
      token = userToken || null;
    }

    if (token) {
      if (config.headers) {
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors without unnecessary token wiping on temporary network/server glitches
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    const reqUrl = error.config?.url || '';

    const isBlocked =
      message.toLowerCase().includes('blocked') ||
      message.toLowerCase().includes('suspended') ||
      message.toLowerCase().includes('contact the administrator');

    // 401 Unauthorized: Only clear token if authentication verification explicitly rejects it on /auth/me
    if (status === 401 && reqUrl.includes('/auth/me')) {
      if (reqUrl.includes('roleContext=admin') || error.config?.headers?.['X-Role-Context'] === 'admin') {
        try {
          sessionStorage.removeItem('gov_admin_token');
          sessionStorage.removeItem('gov_admin_user');
        } catch {}
      } else {
        try {
          sessionStorage.removeItem('gov_user_token');
          sessionStorage.removeItem('gov_token');
          sessionStorage.removeItem('gov_citizen_user');
          sessionStorage.removeItem('gov_user');
        } catch {}
      }
    }

    // 403 Forbidden: Blocked citizen account -> clean up current tab's citizen token and redirect
    if (status === 403 && isBlocked) {
      try {
        sessionStorage.removeItem('gov_user_token');
        sessionStorage.removeItem('gov_token');
        sessionStorage.removeItem('gov_citizen_user');
        sessionStorage.removeItem('gov_user');
      } catch {}

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?blocked=1';
      }
    }

    const compiledMessage = message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(compiledMessage));
  }
);

export default api;
