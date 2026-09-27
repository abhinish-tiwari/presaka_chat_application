import { logger } from '../../utils/logger.js';
import { MessageModel } from '../../models/message.model.js';
import { ChatModel } from '../../models/chat.model.js';

export const registerMessageHandlers = (io, socket) => {
	/**
	 * Handle sending a new message
	 */
	socket.on('message:send', async ({ chatId, content, type = 'text', tempId, replyToId }) => {
		try {
			// Verify user membership
			const isMember = await ChatModel.isMember(chatId, socket.userId);
			if (!isMember) {
				return socket.emit('error', { code: 'FORBIDDEN', message: 'Not a member of this chat' });
			}

			// Private chat block guard
			const blockStatus = await ChatModel.getBlockStatus(chatId, socket.userId);
			if (blockStatus?.hasBlockedOther || blockStatus?.isBlockedByOther) {
				return socket.emit('error', {
					code: 'CHAT_BLOCKED',
					message: 'Cannot send messages in this conversation',
				});
			}

			// Save message to DB
			const message = await MessageModel.create(chatId, socket.userId, content, type, null, replyToId);
			const fullMessage = await MessageModel.findById(message.id);

			// Initialize delivery receipts for all participants
			const chat = await ChatModel.getChatWithMembers(chatId, socket.userId);
			if (chat?.participants) {
				await Promise.all(
					chat.participants.map(p => MessageModel.createReceipt(message.id, p.id))
				);
			}

			// Acknowledge the sender
			socket.emit('message:sent', {
				tempId,
				message: { ...fullMessage, chatId, status: 'sent' },
			});

			// Broadcast to other members
			socket.to(`chat:${chatId}`).emit('message:receive', { ...fullMessage, chatId });

			// Update chat's last activity timestamp
			await ChatModel.update(chatId, { updated_at: new Date() });

		} catch (error) {
			logger.error('Error in message:send:', error);
			socket.emit('error', { code: 'MESSAGE_SEND_FAILED', message: error.message });
		}
	});

	/**
	 * Handle message delivered receipt
	 */
	socket.on('message:delivered', async ({ messageId, chatId }) => {
		try {
			if (!messageId || !chatId) return;

			const result = await MessageModel.markDelivered(messageId, socket.userId);
			if (result) {
				io.to(`chat:${chatId}`).emit('message:status', {
					messageId,
					chatId,
					status: 'delivered',
					timestamp: new Date().toISOString(),
				});
			}
		} catch (error) {
			logger.error('Error in message:delivered:', error);
		}
	});

	/**
	 * Handle message read receipt
	 */
	socket.on('message:read', async ({ messageId, chatId }) => {
		try {
			if (!messageId || !chatId) return;

			const result = await MessageModel.markRead(messageId, socket.userId);
			if (result) {
				io.to(`chat:${chatId}`).emit('message:status', {
					messageId,
					chatId,
					status: 'read',
					timestamp: new Date().toISOString(),
				});
			}
		} catch (error) {
			logger.error('Error in message:read:', error);
		}
	});

	/**
	 * Handle message editing
	 */
	socket.on('message:edit', async ({ messageId, chatId, content }) => {
		try {
			if (!messageId || !chatId || !content) return;

			const message = await MessageModel.findById(messageId);
			if (!message) {
				return socket.emit('error', { code: 'NOT_FOUND', message: 'Message not found' });
			}

			if (message.senderId !== socket.userId) {
				return socket.emit('error', { code: 'FORBIDDEN', message: 'Unauthorized edit' });
			}

			// 15-minute edit window
			const FIFTEEN_MINS = 15 * 60 * 1000;
			if (Date.now() - new Date(message.createdAt).getTime() > FIFTEEN_MINS) {
				return socket.emit('error', { code: 'TIME_EXPIRED', message: 'Edit window expired' });
			}

			const updatedMessage = await MessageModel.edit(messageId, content);

			io.to(`chat:${chatId}`).emit('message:edited', {
				messageId,
				chatId,
				content,
				isEdited: true,
				updatedAt: updatedMessage.updatedAt,
			});
		} catch (error) {
			logger.error('Error in message:edit:', error);
			socket.emit('error', { code: 'EDIT_FAILED', message: 'Failed to edit message' });
		}
	});

	/**
	 * Handle message deletion
	 */
	socket.on('message:delete', async ({ messageId, chatId }) => {
		try {
			if (!messageId || !chatId) return;

			const message = await MessageModel.findById(messageId);
			if (!message || message.senderId !== socket.userId) {
				return socket.emit('error', { code: 'UNAUTHORIZED', message: 'Cannot delete message' });
			}

			await MessageModel.delete(messageId);

			io.to(`chat:${chatId}`).emit('message:deleted', {
				messageId,
				chatId,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			logger.error('Error in message:delete:', error);
			socket.emit('error', { code: 'DELETE_FAILED', message: 'Failed to delete message' });
		}
	});

	/**
	 * Handle reactions
	 */
	socket.on('message:reaction:add', async ({ messageId, chatId, emoji }) => {
		try {
			if (!messageId || !chatId || !emoji) return;
			await MessageModel.addReaction(messageId, socket.userId, emoji);
			io.to(`chat:${chatId}`).emit('message:reaction:added', {
				messageId, chatId, userId: socket.userId, emoji
			});
		} catch (error) {
			logger.error('Error in reaction add:', error);
		}
	});

	socket.on('message:reaction:remove', async ({ messageId, chatId, emoji }) => {
		try {
			if (!messageId || !chatId || !emoji) return;
			await MessageModel.removeReaction(messageId, socket.userId, emoji);
			io.to(`chat:${chatId}`).emit('message:reaction:removed', {
				messageId, chatId, userId: socket.userId, emoji
			});
		} catch (error) {
			logger.error('Error in reaction remove:', error);
		}
	});
};
