import api from './api';

export const adminService = {
  getStats: async () => {
    return await api.get('/admin/stats');
  },

  getUsers: async (params = {}) => {
    return await api.get('/admin/users', { params });
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
