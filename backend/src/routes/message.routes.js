import express from 'express';
import { MessageController } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get chat messages
router.get('/chats/:chatId/messages', MessageController.getChatMessages);

export default router;

