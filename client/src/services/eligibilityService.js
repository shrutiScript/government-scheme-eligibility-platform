import api from './api';

export const eligibilityService = {
  checkEligibility: async (profileData) => {
    return await api.post('/eligibility/check', profileData);
  },

  getRecommendations: async () => {
    return await api.get('/eligibility/recommendations');
  }
};
