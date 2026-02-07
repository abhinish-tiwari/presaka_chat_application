import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { getRedis, setWithExpiry } from '../config/redis.js';
import { ChatModel } from '../models/chat.model.js';
import { UserModel } from '../models/user.model.js';

// Handlers
import { registerMessageHandlers } from './handlers/messageHandler.js';
import { registerChatHandlers } from './handlers/chatHandler.js';
import { registerPresenceHandlers } from './handlers/presenceHandler.js';

export const setupSocketIO = (io) => {
	/**
	 * Socket authentication middleware
	 */
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token;

			if (!token) {
				return next(new Error('Authentication error: Token missing'));
			}

			const decoded = verifyAccessToken(token);
			socket.userId = decoded.userId;
			socket.phone = decoded.phone;

			next();
		} catch (error) {
			logger.error('Socket authentication failed:', error.message);
			next(new Error('Authentication error'));
		}
	});

	/**
	 * Connection lifecycle handler
	 */
	io.on('connection', async (socket) => {
		logger.info(`User connected: ${socket.userId} (Socket: ${socket.id})`);

		try {
			const redis = getRedis();

			// 1. Initial State Sync
			// Track active socket sessions for the user
			await redis.sAdd(`sockets:${socket.userId}`, socket.id);

			// Set/Update global presence to online
			await setWithExpiry(
				`presence:${socket.userId}`,
				{ status: 'online', lastSeen: null, socketId: socket.id },
				3600
			);

			// Persist last seen in DB
			await UserModel.updateLastSeen(socket.userId);

			// 2. Auto-join Chat Rooms
			// Fetch user's active chats and join their rooms automatically for real-time delivery
			const chats = await ChatModel.getUserChats(socket.userId, 100, 0);
			chats.forEach(chat => socket.join(`chat:${chat.id}`));

			// 3. Peer Discovery (Online Status)
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

			// Inform the connected user who else is online in their circles
			socket.emit('users:online', { userIds: Array.from(onlineUserIds) });

			// Notify others that this user has joined
			socket.broadcast.emit('user:online', {
				userId: socket.userId,
				timestamp: new Date().toISOString(),
			});

			// 4. Register Sub-Handlers
			registerMessageHandlers(io, socket);
			registerChatHandlers(io, socket);
			registerPresenceHandlers(io, socket);

		} catch (error) {
			logger.error('Error in socket connection setup:', error);
		}
	});

	logger.info('✅ Socket.IO system initialized with modular handlers');
};
