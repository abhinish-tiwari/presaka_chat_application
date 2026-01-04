import api from './api';

export const authService = {
  // Request OTP
  async requestOTP(phone) {
    const response = await api.post('/auth/request-otp', { phone });
    return response.data;
  },

  // Verify OTP
  async verifyOTP(phone, otp, requestId) {
    const response = await api.post('/auth/verify-otp', {
      phone,
      otp,
      requestId,
    });
    return response.data;
  },

  // Refresh token
  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Logout
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

