import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { getRedis, setWithExpiry, del } from '../config/redis.js';
import { MessageModel } from '../models/message.model.js';
import { ChatModel } from '../models/chat.model.js';
import { UserModel } from '../models/user.model.js';

export const setupSocketIO = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.phone = decoded.phone;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    logger.info(`User connected: ${socket.userId} (${socket.id})`);

    try {
      const redis = getRedis();

      // Store socket mapping
      await redis.sAdd(`sockets:${socket.userId}`, socket.id);

      // Update user presence
      await setWithExpiry(
        `presence:${socket.userId}`,
        { status: 'online', lastSeen: null, socketId: socket.id },
        3600
      );

      // Update last seen in database
      await UserModel.updateLastSeen(socket.userId);

      // Join user's chats
      const chats = await ChatModel.getUserChats(socket.userId, 100, 0);
      chats.forEach(chat => {
        socket.join(`chat:${chat.id}`);
      });

      // Get all online users from chats and send to newly connected user
      const onlineUserIds = new Set();
      for (const chat of chats) {
        const chatParticipants = chat.participants || [];
        for (const participant of chatParticipants) {
          if (participant.id !== socket.userId) {
            const presence = await redis.get(`presence:${participant.id}`);
            if (presence) {
              const presenceData = JSON.parse(presence);
              if (presenceData.status === 'online') {
                onlineUserIds.add(participant.id);
              }
            }
          }
        }
      }

      // Send list of online users to the newly connected user
      socket.emit('users:online', {
        userIds: Array.from(onlineUserIds),
      });

      // Notify contacts that user is online
      socket.broadcast.emit('user:online', {
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });

      // Handle chat join
      socket.on('chat:join', async ({ chatId }) => {
        try {
          const isMember = await ChatModel.isMember(chatId, socket.userId);
          if (isMember) {
            socket.join(`chat:${chatId}`);
            logger.debug(`User ${socket.userId} joined chat ${chatId}`);
          }
        } catch (error) {
          logger.error('Error joining chat:', error);
        }
      });

      // Handle chat leave
      socket.on('chat:leave', ({ chatId }) => {
        socket.leave(`chat:${chatId}`);
        logger.debug(`User ${socket.userId} left chat ${chatId}`);
      });

      // Handle message send
      socket.on('message:send', async ({ chatId, content, type = 'text', tempId }) => {
        try {
          // Verify user is member
          const isMember = await ChatModel.isMember(chatId, socket.userId);
          if (!isMember) {
            socket.emit('error', { code: 'FORBIDDEN', message: 'Not a member of this chat' });
            return;
          }

          // Create message
          const message = await MessageModel.create(chatId, socket.userId, content, type);
          const fullMessage = await MessageModel.findById(message.id);

          // Create receipts for all chat members except sender
          const chat = await ChatModel.getChatWithMembers(chatId, socket.userId);
          if (chat && chat.participants) {
            for (const participant of chat.participants) {
              await MessageModel.createReceipt(message.id, participant.id);
            }
          }

          // Send acknowledgment to sender
          socket.emit('message:sent', {
            tempId,
            message: { ...fullMessage, chatId, status: 'sent' },
          });

          // Broadcast to chat members
          socket.to(`chat:${chatId}`).emit('message:receive', { ...fullMessage, chatId });

          // Update chat timestamp
          await ChatModel.update(chatId, { updated_at: new Date() });

        } catch (error) {
          logger.error('Error sending message:', error);
          socket.emit('error', { code: 'MESSAGE_SEND_FAILED', message: error.message });
        }
      });

      // Handle message delivered
      socket.on('message:delivered', async ({ messageId, chatId }) => {
        try {
          logger.info('Received message:delivered event', { messageId, chatId, userId: socket.userId });

          if (!messageId || !chatId) {
            logger.warn('Invalid message:delivered event', { messageId, chatId });
            return;
          }

          const result = await MessageModel.markDelivered(messageId, socket.userId);
          logger.info('Mark delivered result:', { result, messageId, userId: socket.userId });

          // Only notify if update was successful
          if (result) {
            logger.info('Emitting message:status (delivered)', { messageId, chatId });
            io.to(`chat:${chatId}`).emit('message:status', {
              messageId,
              chatId,
              status: 'delivered',
              timestamp: new Date().toISOString(),
            });
          } else {
            logger.warn('Mark delivered returned no result', { messageId, userId: socket.userId });
          }
        } catch (error) {
          logger.error('Error marking message delivered:', error.message);
          // Don't crash, just log the error
        }
      });

      // Handle message read
      socket.on('message:read', async ({ messageId, chatId }) => {
        try {
          logger.info('Received message:read event', { messageId, chatId, userId: socket.userId });

          if (!messageId || !chatId) {
            logger.warn('Invalid message:read event', { messageId, chatId });
            return;
          }

          const result = await MessageModel.markRead(messageId, socket.userId);
          logger.info('Mark read result:', { result, messageId, userId: socket.userId });

          // Only notify if update was successful
          if (result) {
            logger.info('Emitting message:status (read)', { messageId, chatId });
            io.to(`chat:${chatId}`).emit('message:status', {
              messageId,
              chatId,
              status: 'read',
              timestamp: new Date().toISOString(),
            });
          } else {
            logger.warn('Mark read returned no result', { messageId, userId: socket.userId });
          }
        } catch (error) {
          logger.error('Error marking message read:', error.message);
          // Don't crash, just log the error
        }
      });

      // Handle typing start
      socket.on('typing:start', async ({ chatId }) => {
        try {
          await setWithExpiry(`typing:${chatId}:${socket.userId}`, '1', 5);
          socket.to(`chat:${chatId}`).emit('user:typing', {
            chatId,
            userId: socket.userId,
          });
        } catch (error) {
          logger.error('Error handling typing start:', error);
        }
      });

      // Handle typing stop
      socket.on('typing:stop', async ({ chatId }) => {
        try {
          await del(`typing:${chatId}:${socket.userId}`);
          socket.to(`chat:${chatId}`).emit('user:stopped-typing', {
            chatId,
            userId: socket.userId,
          });
        } catch (error) {
          logger.error('Error handling typing stop:', error);
        }
      });

      // Handle message delete
      socket.on('message:delete', async ({ messageId, chatId }) => {
        try {
          if (!messageId || !chatId) {
            logger.warn('Invalid message:delete event', { messageId, chatId });
            return;
          }

          // Get message to verify ownership
          const message = await MessageModel.findById(messageId);
          if (!message) {
            socket.emit('error', { code: 'NOT_FOUND', message: 'Message not found' });
            return;
          }

          // Only sender can delete their own message
          if (message.senderId !== socket.userId) {
            socket.emit('error', { code: 'FORBIDDEN', message: 'You can only delete your own messages' });
            return;
          }

          // Soft delete the message
          await MessageModel.delete(messageId);

          // Notify all users in the chat
          io.to(`chat:${chatId}`).emit('message:deleted', {
            messageId,
            chatId,
            timestamp: new Date().toISOString(),
          });

          logger.info('Message deleted:', { messageId, chatId, userId: socket.userId });
        } catch (error) {
          logger.error('Error deleting message:', error.message);
          socket.emit('error', { code: 'DELETE_FAILED', message: 'Failed to delete message' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        logger.info(`User disconnected: ${socket.userId} (${socket.id})`);

        try {
          // Remove socket mapping
          await redis.sRem(`sockets:${socket.userId}`, socket.id);

          // Check if user has other active sockets
          const activeSockets = await redis.sMembers(`sockets:${socket.userId}`);
          
          if (activeSockets.length === 0) {
            // Update presence to offline
            await setWithExpiry(
              `presence:${socket.userId}`,
              { status: 'offline', lastSeen: new Date().toISOString() },
              3600
            );

            // Update last seen in database
            await UserModel.updateLastSeen(socket.userId);

            // Notify contacts that user is offline
            socket.broadcast.emit('user:offline', {
              userId: socket.userId,
              lastSeen: new Date().toISOString(),
            });
          }
        } catch (error) {
          logger.error('Error handling disconnect:', error);
        }
      });

    } catch (error) {
      logger.error('Error in connection handler:', error);
    }
  });

  logger.info('✅ Socket.IO setup complete');
};

