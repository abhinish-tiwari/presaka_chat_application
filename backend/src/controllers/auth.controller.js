import { AuthService } from '../services/auth.service.js';
import { AppError } from '../middleware/errorHandler.js';

export const AuthController = {
  // Request OTP
  async requestOTP(req, res, next) {
    try {
      const { phone } = req.body;
      const result = await AuthService.requestOTP(phone);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // Verify OTP
  async verifyOTP(req, res, next) {
    try {
      const { phone, otp, requestId } = req.body;
      const result = await AuthService.verifyOTP(phone, otp, requestId);
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        throw new AppError('Refresh token not provided', 401, 'UNAUTHORIZED');
      }

      const result = await AuthService.refreshToken(refreshToken);

      // Set new refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // Logout
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },
};

