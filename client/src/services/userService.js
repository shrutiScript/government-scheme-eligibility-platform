import api from './api';

export const userService = {
  getProfile: async () => {
    return await api.get('/profile');
  },

  updateProfile: async (profileData) => {
    return await api.put('/profile', profileData);
  },

  uploadAvatar: async (formData) => {
    return await api.post('/profile/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  removeAvatar: async () => {
    return await api.delete('/profile/avatar');
  },

  getSavedSchemes: async () => {
    return await api.get('/profile/saved-schemes');
  },

  saveScheme: async (schemeId) => {
    return await api.post(`/profile/saved-schemes/${schemeId}`);
  },

  removeSavedScheme: async (schemeId) => {
    return await api.delete(`/profile/saved-schemes/${schemeId}`);
  }
};

