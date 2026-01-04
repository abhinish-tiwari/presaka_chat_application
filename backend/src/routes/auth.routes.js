import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validatePhone, validateOTP } from '../middleware/validator.js';
import { otpRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Request OTP
router.post('/request-otp', validatePhone, otpRateLimiter, AuthController.requestOTP);

// Verify OTP
router.post('/verify-otp', validateOTP, AuthController.verifyOTP);

// Refresh token
router.post('/refresh', AuthController.refreshToken);

// Logout
router.post('/logout', AuthController.logout);

export default router;

