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

      const hasBlock = await ChatModel.hasBlockBetweenUsers(req.user.id, recipientId);
      if (hasBlock) {
        throw new AppError('Cannot create chat because one user has blocked the other', 403, 'CHAT_BLOCKED');
      }

      // Check if chat already exists
      let chat = await ChatModel.findPrivateChat(req.user.id, recipientId);

      if (chat) {
        const chatWithMembers = await ChatModel.getChatWithMembers(chat.id, req.user.id);
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

      const chatWithMembers = await ChatModel.getChatWithMembers(chat.id, req.user.id);

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

      const chat = await ChatModel.getChatWithMembers(chatId, req.user.id);

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

  // Clear chat for current user
  async clearChat(req, res, next) {
    try {
      const { chatId } = req.params;

      const isMember = await ChatModel.isMember(chatId, req.user.id);
      if (!isMember) {
        throw new AppError('Access denied', 403, 'FORBIDDEN');
      }

      const clearState = await ChatModel.clearForUser(chatId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Conversation cleared',
        clearedAt: clearState?.clearedAt,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete (leave) chat for current user
  async deleteChat(req, res, next) {
    try {
      const { chatId } = req.params;

      const isMember = await ChatModel.isMember(chatId, req.user.id);
      if (!isMember) {
        throw new AppError('Chat not found', 404, 'CHAT_NOT_FOUND');
      }

      await ChatModel.leave(chatId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Conversation deleted',
        chatId,
      });
    } catch (error) {
      next(error);
    }
  },

  // Block other user in a private chat
  async blockUser(req, res, next) {
    try {
      const { chatId } = req.params;

      const isMember = await ChatModel.isMember(chatId, req.user.id);
      if (!isMember) {
        throw new AppError('Chat not found', 404, 'CHAT_NOT_FOUND');
      }

      const chat = await ChatModel.findById(chatId);
      if (!chat) {
        throw new AppError('Chat not found', 404, 'CHAT_NOT_FOUND');
      }
      if (chat.type !== 'private') {
        throw new AppError('Blocking is only supported in private chats', 400, 'INVALID_CHAT_TYPE');
      }

      const otherUser = await ChatModel.getOtherParticipant(chatId, req.user.id);
      if (!otherUser) {
        throw new AppError('Participant not found', 404, 'USER_NOT_FOUND');
      }

      const blockRecord = await ChatModel.blockUser(req.user.id, otherUser.id);
      if (!blockRecord) {
        throw new AppError('Block feature is unavailable until DB migration is applied', 503, 'BLOCK_FEATURE_UNAVAILABLE');
      }

      await ChatModel.leave(chatId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'User blocked successfully',
        blockedUserId: otherUser.id,
        chatId,
      });
    } catch (error) {
      next(error);
    }
  },
};
