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
        req.user.id,
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

  // Delete message
  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;

      // Get message to verify ownership
      const message = await MessageModel.findById(messageId);
      if (!message) {
        throw new AppError('Message not found', 404, 'NOT_FOUND');
      }

      // Only sender can delete their own message
      if (message.senderId !== req.user.id) {
        throw new AppError('You can only delete your own messages', 403, 'FORBIDDEN');
      }

      // Soft delete the message
      await MessageModel.delete(messageId);

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
