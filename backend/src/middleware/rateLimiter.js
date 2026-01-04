import rateLimit from 'express-rate-limit';
import { getRedis } from '../config/redis.js';
import { AppError } from './errorHandler.js';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP request rate limiter
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    error: 'OTP_RATE_LIMIT_EXCEEDED',
    message: 'Too many OTP requests, please try again later',
  },
  keyGenerator: (req) => req.body.phone || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom Redis-based rate limiter for OTP
export const otpRateLimiter = async (req, res, next) => {
  try {
    const phone = req.body.phone;
    if (!phone) {
      return next(new AppError('Phone number required', 400, 'INVALID_REQUEST'));
    }

    const redis = getRedis();
    const key = `ratelimit:otp:${phone}`;
    
    const attempts = await redis.get(key);
    const maxAttempts = parseInt(process.env.OTP_RATE_LIMIT) || 3;
    
    if (attempts && parseInt(attempts) >= maxAttempts) {
      return res.status(429).json({
        success: false,
        error: 'OTP_RATE_LIMIT_EXCEEDED',
        message: 'Too many OTP requests. Please try again later.',
      });
    }

    // Increment attempts
    if (attempts) {
      await redis.incr(key);
    } else {
      await redis.setEx(key, parseInt(process.env.OTP_RATE_WINDOW) || 600, '1');
    }

    next();
  } catch (error) {
    next(error);
  }
};

