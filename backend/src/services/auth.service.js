import { setWithExpiry, get, del } from '../config/redis.js';
import { UserModel } from '../models/user.model.js';
import { generateOTP, hashOTP, verifyOTP as verifyOTPUtil, generateRequestId } from '../utils/otp.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendOTP } from './sms.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export const AuthService = {
  // Request OTP
  async requestOTP(phone) {
    try {
      // Generate OTP
      const otp = generateOTP();
      const requestId = generateRequestId();

      logger.info(`Generated OTP for ${phone}: ${otp}`); // Remove in production

      // Hash OTP
      const hashedOTP = await hashOTP(otp);

      // Store in Redis
      const otpData = {
        hash: hashedOTP,
        attempts: 0,
        requestId,
      };

      const expiry = parseInt(process.env.OTP_EXPIRY) || 300; // 5 minutes
      await setWithExpiry(`otp:${phone}`, otpData, expiry);

      // Send OTP via SMS
      await sendOTP(phone, otp);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresIn: expiry,
        requestId,
      };
    } catch (error) {
      logger.error('Error requesting OTP:', error);
      throw error;
    }
  },

  // Verify OTP
  async verifyOTP(phone, otp, requestId) {
    try {
      // Get OTP data from Redis
      const otpData = await get(`otp:${phone}`);

      if (!otpData) {
        throw new AppError('OTP expired or not found', 401, 'OTP_EXPIRED');
      }

      if (otpData.requestId !== requestId) {
        throw new AppError('Invalid request ID', 400, 'INVALID_REQUEST_ID');
      }

      // Check attempts
      const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 3;
      if (otpData.attempts >= maxAttempts) {
        await del(`otp:${phone}`);
        throw new AppError('Too many attempts', 429, 'TOO_MANY_ATTEMPTS');
      }

      // Verify OTP
      const isValid = await verifyOTPUtil(otp, otpData.hash);

      if (!isValid) {
        // Increment attempts
        otpData.attempts += 1;
        await setWithExpiry(`otp:${phone}`, otpData, 300);
        throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
      }

      // Delete OTP from Redis
      await del(`otp:${phone}`);

      // Find or create user
      let user = await UserModel.findByPhone(phone);
      if (!user) {
        user = await UserModel.create(phone);
      }

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.phone);
      const { token: refreshToken, tokenId } = generateRefreshToken(user.id, user.phone);

      // Store refresh token in Redis
      await setWithExpiry(
        `refresh:${tokenId}`,
        { userId: user.id, issuedAt: Date.now() },
        7 * 24 * 60 * 60 // 7 days
      );

      return {
        success: true,
        user,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes
        },
      };
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      throw error;
    }
  },

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      // Check if token exists in Redis
      const tokenData = await get(`refresh:${decoded.tokenId}`);
      if (!tokenData) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(decoded.userId, decoded.phone);
      const { token: newRefreshToken, tokenId: newTokenId } = generateRefreshToken(
        decoded.userId,
        decoded.phone
      );

      // Delete old refresh token
      await del(`refresh:${decoded.tokenId}`);

      // Store new refresh token
      await setWithExpiry(
        `refresh:${newTokenId}`,
        { userId: decoded.userId, issuedAt: Date.now() },
        7 * 24 * 60 * 60
      );

      return {
        success: true,
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 900,
        },
      };
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw error;
    }
  },

  // Logout
  async logout(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await del(`refresh:${decoded.tokenId}`);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Error logging out:', error);
      throw error;
    }
  },
};

