import api from './api';

export const schemeService = {
  getSchemes: async (params = {}) => {
    return await api.get('/schemes', { params });
  },

  getSchemeById: async (id) => {
    return await api.get(`/schemes/${id}`);
  },

  createScheme: async (schemeData) => {
    return await api.post('/schemes', schemeData);
  },

  updateScheme: async (id, schemeData) => {
    return await api.put(`/schemes/${id}`, schemeData);
  },

  deleteScheme: async (id) => {
    return await api.delete(`/schemes/${id}`);
  },

  toggleSchemeStatus: async (id) => {
    return await api.patch(`/schemes/${id}/toggle-status`);
  }
};
