import { logger } from '../../utils/logger.js';
import { getRedis, setWithExpiry, del } from '../../config/redis.js';
import { UserModel } from '../../models/user.model.js';

export const registerPresenceHandlers = (io, socket) => {
	const redis = getRedis();

	/**
	 * Handle typing indicators
	 */
	socket.on('typing:start', async ({ chatId }) => {
		try {
			await setWithExpiry(`typing:${chatId}:${socket.userId}`, '1', 5);
			socket.to(`chat:${chatId}`).emit('user:typing', {
				chatId,
				userId: socket.userId,
			});
		} catch (error) {
			logger.error('Error in typing:start:', error);
		}
	});

	socket.on('typing:stop', async ({ chatId }) => {
		try {
			await del(`typing:${chatId}:${socket.userId}`);
			socket.to(`chat:${chatId}`).emit('user:stopped-typing', {
				chatId,
				userId: socket.userId,
			});
		} catch (error) {
			logger.error('Error in typing:stop:', error);
		}
	});

	/**
	 * Handle actual disconnection logic
	 */
	const handleDisconnect = async () => {
		logger.info(`Presence: User disconnected - ${socket.userId}`);

		try {
			// Clean up socket mapping in Redis
			await redis.sRem(`sockets:${socket.userId}`, socket.id);

			// Check if any other sessions remain online
			const activeSockets = await redis.sMembers(`sockets:${socket.userId}`);

			if (activeSockets.length === 0) {
				const lastSeen = new Date().toISOString();

				// Update global presence state
				await setWithExpiry(
					`presence:${socket.userId}`,
					{ status: 'offline', lastSeen },
					3600
				);

				// Persist last seen in DB
				await UserModel.updateLastSeen(socket.userId);

				// Broadcast to all active listeners
				socket.broadcast.emit('user:offline', {
					userId: socket.userId,
					lastSeen,
				});
			}
		} catch (error) {
			logger.error('Error cleaning up presence on disconnect:', error);
		}
	};

	socket.on('disconnect', handleDisconnect);
};
