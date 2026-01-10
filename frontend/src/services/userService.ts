import api from './api';
import { User, UpdateUserData } from '@/types';

export const userService = {
  // Get current user
  async getMe(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/users/me');
    return response.data;
  },

  // Update profile
  async updateProfile(data: UpdateUserData): Promise<{ user: User }> {
    const response = await api.patch<{ user: User }>('/users/me', data);
    return response.data;
  },

  // Search users
  async searchUsers(phone: string): Promise<{ users: User[] }> {
    const response = await api.get<{ users: User[] }>('/users/search', {
      params: { phone },
    });
    return response.data;
  },
};

