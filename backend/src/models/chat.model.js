import { query } from '../config/database.js';
import { keysToSnake } from '../utils/caseConverter.js';

const isMissingRelationError = (error, tableName) => (
	error?.code === '42P01'
	&& typeof error?.message === 'string'
	&& error.message.includes(tableName)
);

export const ChatModel = {
	/**
	 * Create a new chat (private or group)
	 */
	async create(type, createdBy, name = null) {
		const result = await query(
			'INSERT INTO chats (type, name, created_by) VALUES ($1, $2, $3) RETURNING *',
			[type, name, createdBy]
		);
		return result.rows[0];
	},

	/**
	 * Find a specific chat by ID
	 */
	async findById(id) {
		const result = await query(
			'SELECT * FROM chats WHERE id = $1',
			[id]
		);
		return result.rows[0];
	},

	/**
	 * Find an existing private chat between two specific users
	 */
	async findPrivateChat(userId1, userId2) {
		const result = await query(
			`SELECT c.* FROM chats c
			 INNER JOIN chat_members cm1 ON c.id = cm1.chat_id AND cm1.user_id = $1
			 INNER JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id = $2
			 WHERE c.type = 'private' 
			   AND cm1.left_at IS NULL 
			   AND cm2.left_at IS NULL
			 LIMIT 1`,
			[userId1, userId2]
		);
		return result.rows[0];
	},

	/**
	 * Get all active chats for a user with rich metadata (last message, participants, unread count)
	 */
	async getUserChats(userId, limit = 20, offset = 0) {
		try {
			const result = await query(
				`SELECT
					c.*,
					(SELECT COUNT(*)
					 FROM messages m
					 WHERE m.chat_id = c.id
					   AND m.deleted_at IS NULL
					   AND m.created_at > COALESCE(cc.cleared_at, TO_TIMESTAMP(0))
					) as message_count,
					(SELECT COALESCE(
						json_agg(json_build_object(
							'id', u.id,
							'name', u.name,
							'phone', u.phone,
							'avatarUrl', u.avatar_url,
							'isOnline', u.last_seen > NOW() - INTERVAL '5 minutes',
							'lastSeen', u.last_seen
						)),
						'[]'::json
					)
					FROM chat_members cm2
					INNER JOIN users u ON cm2.user_id = u.id
					WHERE cm2.chat_id = c.id AND cm2.user_id != $1 AND cm2.left_at IS NULL
					) as participants,
					(SELECT json_build_object(
						'id', m.id,
						'content', m.content,
						'type', m.type,
						'senderId', m.sender_id,
						'createdAt', m.created_at,
						'status', (
							SELECT CASE
								WHEN COUNT(mr.id) = 0 THEN 'sent'
								WHEN COUNT(mr.id) FILTER (WHERE mr.read_at IS NOT NULL) > 0 THEN 'read'
								WHEN COUNT(mr.id) FILTER (WHERE mr.delivered_at IS NOT NULL) > 0 THEN 'delivered'
								ELSE 'sent'
							END
							FROM message_receipts mr
							WHERE mr.message_id = m.id
						)
					)
					FROM messages m
					WHERE m.chat_id = c.id
					  AND m.deleted_at IS NULL
					  AND m.created_at > COALESCE(cc.cleared_at, TO_TIMESTAMP(0))
					ORDER BY m.created_at DESC
					LIMIT 1
					) as last_message,
					(SELECT COUNT(*)
					 FROM messages m
					 LEFT JOIN message_receipts mr ON m.id = mr.message_id AND mr.user_id = $1
					 WHERE m.chat_id = c.id
					   AND m.sender_id != $1
					   AND m.deleted_at IS NULL
					   AND m.created_at > COALESCE(cc.cleared_at, TO_TIMESTAMP(0))
					   AND mr.read_at IS NULL
					) as unread_count
				FROM chats c
				INNER JOIN chat_members cm ON c.id = cm.chat_id
				LEFT JOIN chat_clears cc ON cc.chat_id = c.id AND cc.user_id = $1
				WHERE cm.user_id = $1 AND cm.left_at IS NULL
				ORDER BY c.updated_at DESC
				LIMIT $2 OFFSET $3`,
				[userId, limit, offset]
			);
			return result.rows;
		} catch (error) {
			if (!isMissingRelationError(error, 'chat_clears')) {
				throw error;
			}

			// Backward compatibility for DBs where new migration has not run yet.
			const legacyResult = await query(
				`SELECT
					c.*,
					(SELECT COUNT(*) FROM messages m WHERE m.chat_id = c.id AND m.deleted_at IS NULL) as message_count,
					(SELECT COALESCE(
						json_agg(json_build_object(
							'id', u.id,
							'name', u.name,
							'phone', u.phone,
							'avatarUrl', u.avatar_url,
							'isOnline', u.last_seen > NOW() - INTERVAL '5 minutes',
							'lastSeen', u.last_seen
						)),
						'[]'::json
					)
					FROM chat_members cm2
					INNER JOIN users u ON cm2.user_id = u.id
					WHERE cm2.chat_id = c.id AND cm2.user_id != $1 AND cm2.left_at IS NULL
					) as participants,
					(SELECT json_build_object(
						'id', m.id,
						'content', m.content,
						'type', m.type,
						'senderId', m.sender_id,
						'createdAt', m.created_at,
						'status', (
							SELECT CASE
								WHEN COUNT(mr.id) = 0 THEN 'sent'
								WHEN COUNT(mr.id) FILTER (WHERE mr.read_at IS NOT NULL) > 0 THEN 'read'
								WHEN COUNT(mr.id) FILTER (WHERE mr.delivered_at IS NOT NULL) > 0 THEN 'delivered'
								ELSE 'sent'
							END
							FROM message_receipts mr
							WHERE mr.message_id = m.id
						)
					)
					FROM messages m
					WHERE m.chat_id = c.id AND m.deleted_at IS NULL
					ORDER BY m.created_at DESC
					LIMIT 1
					) as last_message,
					(SELECT COUNT(*)
					 FROM messages m
					 LEFT JOIN message_receipts mr ON m.id = mr.message_id AND mr.user_id = $1
					 WHERE m.chat_id = c.id
					   AND m.sender_id != $1
					   AND m.deleted_at IS NULL
					   AND mr.read_at IS NULL
					) as unread_count
				FROM chats c
				INNER JOIN chat_members cm ON c.id = cm.chat_id
				WHERE cm.user_id = $1 AND cm.left_at IS NULL
				ORDER BY c.updated_at DESC
				LIMIT $2 OFFSET $3`,
				[userId, limit, offset]
			);
			return legacyResult.rows;
		}
	},

	/**
	 * Get full chat details including member list and participant status
	 */
	async getChatWithMembers(chatId, userId = null) {
		try {
			const result = await query(
				`SELECT
					c.*,
					(SELECT COUNT(*)
					 FROM messages m
					 WHERE m.chat_id = c.id
					   AND m.deleted_at IS NULL
					   AND m.created_at > COALESCE(cc.cleared_at, TO_TIMESTAMP(0))
					) as message_count,
					json_agg(json_build_object(
						'id', u.id,
						'name', u.name,
						'phone', u.phone,
						'avatarUrl', u.avatar_url,
						'isOnline', u.last_seen > NOW() - INTERVAL '5 minutes',
						'lastSeen', u.last_seen,
						'role', cm.role
					)) as participants,
					(SELECT json_build_object(
						'id', m.id,
						'content', m.content,
						'type', m.type,
						'senderId', m.sender_id,
						'createdAt', m.created_at,
						'status', (
							SELECT CASE
								WHEN COUNT(mr.id) = 0 THEN 'sent'
								WHEN COUNT(mr.id) FILTER (WHERE mr.read_at IS NOT NULL) > 0 THEN 'read'
								WHEN COUNT(mr.id) FILTER (WHERE mr.delivered_at IS NOT NULL) > 0 THEN 'delivered'
								ELSE 'sent'
							END
							FROM message_receipts mr
							WHERE mr.message_id = m.id
						)
					)
					FROM messages m
					WHERE m.chat_id = c.id
					  AND m.deleted_at IS NULL
					  AND m.created_at > COALESCE(cc.cleared_at, TO_TIMESTAMP(0))
					ORDER BY m.created_at DESC
					LIMIT 1
					) as last_message,
					(SELECT COUNT(*)
					 FROM messages m
					 LEFT JOIN message_receipts mr ON m.id = mr.message_id AND mr.user_id = $2
					 WHERE m.chat_id = c.id
					   AND m.sender_id != $2
					   AND m.deleted_at IS NULL
					   AND m.created_at > COALESCE(cc.cleared_at, TO_TIMESTAMP(0))
					   AND mr.read_at IS NULL
					) as unread_count
				FROM chats c
				INNER JOIN chat_members cm ON c.id = cm.chat_id
				INNER JOIN users u ON cm.user_id = u.id
				LEFT JOIN chat_clears cc ON cc.chat_id = c.id AND cc.user_id = $2
				WHERE c.id = $1 AND cm.left_at IS NULL
				GROUP BY c.id, cc.cleared_at`,
				[chatId, userId]
			);
			return result.rows[0];
		} catch (error) {
			if (!isMissingRelationError(error, 'chat_clears')) {
				throw error;
			}

			const legacyResult = await query(
				`SELECT
					c.*,
					(SELECT COUNT(*) FROM messages m WHERE m.chat_id = c.id AND m.deleted_at IS NULL) as message_count,
					json_agg(json_build_object(
						'id', u.id,
						'name', u.name,
						'phone', u.phone,
						'avatarUrl', u.avatar_url,
						'isOnline', u.last_seen > NOW() - INTERVAL '5 minutes',
						'lastSeen', u.last_seen,
						'role', cm.role
					)) as participants,
					(SELECT json_build_object(
						'id', m.id,
						'content', m.content,
						'type', m.type,
						'senderId', m.sender_id,
						'createdAt', m.created_at,
						'status', (
							SELECT CASE
								WHEN COUNT(mr.id) = 0 THEN 'sent'
								WHEN COUNT(mr.id) FILTER (WHERE mr.read_at IS NOT NULL) > 0 THEN 'read'
								WHEN COUNT(mr.id) FILTER (WHERE mr.delivered_at IS NOT NULL) > 0 THEN 'delivered'
								ELSE 'sent'
							END
							FROM message_receipts mr
							WHERE mr.message_id = m.id
						)
					)
					FROM messages m
					WHERE m.chat_id = c.id AND m.deleted_at IS NULL
					ORDER BY m.created_at DESC
					LIMIT 1
					) as last_message,
					(SELECT COUNT(*)
					 FROM messages m
					 LEFT JOIN message_receipts mr ON m.id = mr.message_id AND mr.user_id = $2
					 WHERE m.chat_id = c.id
					   AND m.sender_id != $2
					   AND m.deleted_at IS NULL
					   AND mr.read_at IS NULL
					) as unread_count
				FROM chats c
				INNER JOIN chat_members cm ON c.id = cm.chat_id
				INNER JOIN users u ON cm.user_id = u.id
				WHERE c.id = $1 AND cm.left_at IS NULL
				GROUP BY c.id`,
				[chatId, userId]
			);
			return legacyResult.rows[0];
		}
	},

	/**
	 * Add a user to a chat as a member
	 */
	async addMember(chatId, userId, role = 'member') {
		const result = await query(
			'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
			[chatId, userId, role]
		);
		return result.rows[0];
	},

	/**
	 * Check if a user is an active member of a chat
	 */
	async isMember(chatId, userId) {
		const result = await query(
			'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2 AND left_at IS NULL',
			[chatId, userId]
		);
		return result.rows.length > 0;
	},

	/**
	 * Persist a per-user clear timestamp for chat history.
	 */
	async clearForUser(chatId, userId) {
		try {
			const result = await query(
				`INSERT INTO chat_clears (chat_id, user_id, cleared_at)
				 VALUES ($1, $2, CURRENT_TIMESTAMP)
				 ON CONFLICT (chat_id, user_id)
				 DO UPDATE SET cleared_at = EXCLUDED.cleared_at
				 RETURNING *`,
				[chatId, userId]
			);
			return result.rows[0];
		} catch (error) {
			if (!isMissingRelationError(error, 'chat_clears')) {
				throw error;
			}

			// Keep API functional before migration; this clear is session-level only.
			return {
				chatId,
				userId,
				clearedAt: new Date().toISOString(),
				isTransient: true,
			};
		}
	},

	/**
	 * Mark a user as having left a chat.
	 */
	async leave(chatId, userId) {
		const result = await query(
			`UPDATE chat_members
			 SET left_at = CURRENT_TIMESTAMP
			 WHERE chat_id = $1 AND user_id = $2 AND left_at IS NULL
			 RETURNING *`,
			[chatId, userId]
		);
		return result.rows[0];
	},

	/**
	 * Get another active participant in a chat.
	 * For private chats this returns the counterpart user.
	 */
	async getOtherParticipant(chatId, userId) {
		const result = await query(
			`SELECT
				u.id,
				u.name,
				u.phone
			FROM chat_members cm
			INNER JOIN users u ON u.id = cm.user_id
			WHERE cm.chat_id = $1
			  AND cm.user_id != $2
			  AND cm.left_at IS NULL
			LIMIT 1`,
			[chatId, userId]
		);
		return result.rows[0];
	},

	/**
	 * Check if either user has blocked the other.
	 */
	async hasBlockBetweenUsers(userId1, userId2) {
		try {
			const result = await query(
				`SELECT EXISTS(
					SELECT 1
					FROM user_blocks
					WHERE (blocker_id = $1 AND blocked_id = $2)
					   OR (blocker_id = $2 AND blocked_id = $1)
				) as is_blocked`,
				[userId1, userId2]
			);
			return result.rows[0]?.isBlocked || false;
		} catch (error) {
			if (isMissingRelationError(error, 'user_blocks')) {
				return false;
			}
			throw error;
		}
	},

	/**
	 * Create/keep a one-way block relation.
	 */
	async blockUser(blockerId, blockedId) {
		try {
			const result = await query(
				`INSERT INTO user_blocks (blocker_id, blocked_id)
				 VALUES ($1, $2)
				 ON CONFLICT (blocker_id, blocked_id)
				 DO NOTHING
				 RETURNING *`,
				[blockerId, blockedId]
			);

			if (result.rows[0]) {
				return result.rows[0];
			}

			const existing = await query(
				'SELECT * FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2',
				[blockerId, blockedId]
			);
			return existing.rows[0];
		} catch (error) {
			if (isMissingRelationError(error, 'user_blocks')) {
				return null;
			}
			throw error;
		}
	},

	/**
	 * For private chats, return whether sender has blocked the other side
	 * or is blocked by the other side.
	 */
	async getBlockStatus(chatId, userId) {
		const chat = await this.findById(chatId);
		if (!chat || chat.type !== 'private') {
			return { hasBlockedOther: false, isBlockedByOther: false };
		}

		const otherUser = await this.getOtherParticipant(chatId, userId);
		if (!otherUser) {
			return { hasBlockedOther: false, isBlockedByOther: false };
		}

		try {
			const result = await query(
				`SELECT
					EXISTS(
						SELECT 1 FROM user_blocks
						WHERE blocker_id = $1 AND blocked_id = $2
					) as has_blocked_other,
					EXISTS(
						SELECT 1 FROM user_blocks
						WHERE blocker_id = $2 AND blocked_id = $1
					) as is_blocked_by_other`,
				[userId, otherUser.id]
			);

			return result.rows[0] || { hasBlockedOther: false, isBlockedByOther: false };
		} catch (error) {
			if (isMissingRelationError(error, 'user_blocks')) {
				return { hasBlockedOther: false, isBlockedByOther: false };
			}
			throw error;
		}
	},

	/**
	 * Update chat properties dynamically
	 */
	async update(id, data = {}) {
		const snakeData = keysToSnake(data || {}) || {};
		const hasUpdatedAt = Object.prototype.hasOwnProperty.call(snakeData, 'updated_at');

		const fields = [];
		const values = [];
		let paramCount = 1;

		Object.keys(snakeData).forEach(key => {
			fields.push(`${key} = $${paramCount}`);
			values.push(snakeData[key]);
			paramCount++;
		});

		values.push(id);

		const setClause = fields.length > 0
			? (hasUpdatedAt ? `${fields.join(', ')}` : `${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP`)
			: `updated_at = CURRENT_TIMESTAMP`;

		const result = await query(
			`UPDATE chats SET ${setClause} WHERE id = $${paramCount} RETURNING *`,
			values
		);
		return result.rows[0];
	},
};
