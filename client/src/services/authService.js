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
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  verifyResetOtp: async (email, otp) => {
    return await api.post('/auth/verify-reset-otp', { email, otp });
  },

  resetPassword: async ({ email, otp, newPassword, confirmPassword }) => {
    return await api.post('/auth/reset-password', { email, otp, newPassword, confirmPassword });
  }
};

export default authService;
