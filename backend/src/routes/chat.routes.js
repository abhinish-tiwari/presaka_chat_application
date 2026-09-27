import express from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all chats
router.get('/', ChatController.getChats);

// Create private chat
router.post('/private', ChatController.createPrivateChat);

// Clear chat history for current user
router.post('/:chatId/clear', ChatController.clearChat);

// Block other user in private chat
router.post('/:chatId/block', ChatController.blockUser);

// Delete chat for current user
router.delete('/:chatId', ChatController.deleteChat);

// Get chat details
router.get('/:chatId', ChatController.getChatDetails);

export default router;
