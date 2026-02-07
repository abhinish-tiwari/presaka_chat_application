import { logger } from '../../utils/logger.js';
import { ChatModel } from '../../models/chat.model.js';

export const registerChatHandlers = (io, socket) => {
	/**
	 * Handle manual joining of a chat room (usually for new chats)
	 */
	socket.on('chat:join', async ({ chatId }) => {
		try {
			const isMember = await ChatModel.isMember(chatId, socket.userId);
			if (isMember) {
				socket.join(`chat:${chatId}`);
				logger.debug(`User ${socket.userId} joined room: chat:${chatId}`);
			}
		} catch (error) {
			logger.error('Error in chat:join:', error);
		}
	});

	/**
	 * Handle leaving a chat room
	 */
	socket.on('chat:leave', ({ chatId }) => {
		socket.leave(`chat:${chatId}`);
		logger.debug(`User ${socket.userId} left room: chat:${chatId}`);
	});
};
