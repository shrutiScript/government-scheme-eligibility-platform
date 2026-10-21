import api from './api';

export const adminService = {
  getStats: async () => {
    return await api.get('/admin/stats');
  },

  getLogs: async (params = {}) => {
    return await api.get('/admin/logs', { params });
  },

  getUsers: async (params = {}) => {
    return await api.get('/admin/users', { params });
  },

  updateUser: async (userId, userData) => {
    return await api.put(`/admin/users/${userId}`, userData);
  },

  updateUserRole: async (userId, role) => {
    return await api.put(`/admin/users/${userId}/role`, { role });
  },

  toggleBlockUser: async (userId) => {
    return await api.patch(`/admin/users/${userId}/toggle-block`);
  },

  deleteUser: async (userId) => {
    return await api.delete(`/admin/users/${userId}`);
  }
};

export default adminService;
