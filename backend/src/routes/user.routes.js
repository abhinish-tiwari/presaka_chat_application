import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user
router.get('/me', UserController.getMe);

// Update profile
router.patch('/me', validateProfileUpdate, UserController.updateProfile);

// Search users
router.get('/search', UserController.searchUsers);

export default router;

