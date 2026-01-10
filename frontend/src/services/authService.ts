import api from './api';
import { AuthResponse, OTPRequestResponse } from '@/types';

export const authService = {
  // Request OTP
  async requestOTP(phone: string): Promise<OTPRequestResponse> {
    const response = await api.post<OTPRequestResponse>('/auth/request-otp', { phone });
    return response.data;
  },

  // Verify OTP
  async verifyOTP(phone: string, otp: string, requestId: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/verify-otp', {
      phone,
      otp,
      requestId,
    });
    return response.data;
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  // Logout
  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },
};

