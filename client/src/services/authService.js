import api from './api';

export const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  getMe: async (roleContext = null) => {
    const headers = {};
    if (roleContext) {
      headers['X-Role-Context'] = roleContext;
    }
    return await api.get('/auth/me', { headers });
  },

  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  },

  updateEmail: async (data) => {
    return await api.put('/auth/email', data);
  },

  updatePassword: async (data) => {
    return await api.put('/auth/password', data);
  }
};

export default authService;
