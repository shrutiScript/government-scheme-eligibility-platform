import api from './api';

export const adminService = {
  getStats: async () => {
    return await api.get('/admin/stats');
  },

<<<<<<< HEAD
=======
  getLogs: async (params = {}) => {
    return await api.get('/admin/logs', { params });
  },

>>>>>>> second-copy
  getUsers: async (params = {}) => {
    return await api.get('/admin/users', { params });
  },

<<<<<<< HEAD
=======
  updateUser: async (userId, userData) => {
    return await api.put(`/admin/users/${userId}`, userData);
  },

>>>>>>> second-copy
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
<<<<<<< HEAD
=======

export default adminService;
>>>>>>> second-copy
