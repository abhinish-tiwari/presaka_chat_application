import { ChatModel } from '../models/chat.model.js';
import { AppError } from '../middleware/errorHandler.js';

export const ChatController = {
  // Get all chats
  async getChats(req, res, next) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const chats = await ChatModel.getUserChats(req.user.id, parseInt(limit), parseInt(offset));

      res.status(200).json({
        success: true,
        chats,
        total: chats.length,
      });
    } catch (error) {
      next(error);
    }
  },

  // Create private chat
  async createPrivateChat(req, res, next) {
    try {
      const { recipientId } = req.body;

      if (!recipientId) {
        throw new AppError('Recipient ID required', 400, 'INVALID_REQUEST');
      }

      if (recipientId === req.user.id) {
        throw new AppError('Cannot create chat with yourself', 400, 'INVALID_REQUEST');
      }

      // Check if chat already exists
      let chat = await ChatModel.findPrivateChat(req.user.id, recipientId);

      if (chat) {
        const chatWithMembers = await ChatModel.getChatWithMembers(chat.id);
        return res.status(200).json({
          success: true,
          chat: chatWithMembers,
        });
      }

      // Create new chat
      chat = await ChatModel.create('private', req.user.id);

      // Add members
      await ChatModel.addMember(chat.id, req.user.id, 'member');
      await ChatModel.addMember(chat.id, recipientId, 'member');

      const chatWithMembers = await ChatModel.getChatWithMembers(chat.id);

      res.status(201).json({
        success: true,
        chat: chatWithMembers,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get chat details
  async getChatDetails(req, res, next) {
    try {
      const { chatId } = req.params;

      // Check if user is member
      const isMember = await ChatModel.isMember(chatId, req.user.id);
      if (!isMember) {
        throw new AppError('Access denied', 403, 'FORBIDDEN');
      }

      const chat = await ChatModel.getChatWithMembers(chatId);

      if (!chat) {
        throw new AppError('Chat not found', 404, 'CHAT_NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        chat,
      });
    } catch (error) {
      next(error);
    }
  },
};

