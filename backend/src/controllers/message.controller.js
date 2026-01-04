import { MessageModel } from '../models/message.model.js';
import { ChatModel } from '../models/chat.model.js';
import { AppError } from '../middleware/errorHandler.js';

export const MessageController = {
  // Get chat messages
  async getChatMessages(req, res, next) {
    try {
      const { chatId } = req.params;
      const { limit = 50, before } = req.query;

      // Check if user is member
      const isMember = await ChatModel.isMember(chatId, req.user.id);
      if (!isMember) {
        throw new AppError('Access denied', 403, 'FORBIDDEN');
      }

      const messages = await MessageModel.getChatMessages(
        chatId,
        parseInt(limit),
        before
      );

      res.status(200).json({
        success: true,
        messages,
        hasMore: messages.length === parseInt(limit),
      });
    } catch (error) {
      next(error);
    }
  },
};

