import api from './api';

export const userService = {
  // Get current user
  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update profile
  async updateProfile(data) {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  // Search users
  async searchUsers(phone) {
    const response = await api.get('/users/search', {
      params: { phone },
    });
    return response.data;
  },
};

