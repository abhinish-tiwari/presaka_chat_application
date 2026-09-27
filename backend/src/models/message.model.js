import { query } from '../config/database.js';

const isMissingRelationError = (error, tableName) => (
	error?.code === '42P01'
	&& typeof error?.message === 'string'
	&& error.message.includes(tableName)
);

export const MessageModel = {
	/**
	 * Create new message
	 */
	async create(chatId, senderId, content, type = 'text', metadata = null, replyToMessageId = null) {
		const result = await query(
			`INSERT INTO messages (chat_id, sender_id, content, type, metadata, reply_to_message_id) 
			 VALUES ($1, $2, $3, $4, $5, $6) 
			 RETURNING *`,
			[chatId, senderId, content, type, metadata, replyToMessageId]
		);
		return result.rows[0];
	},

	/**
	 * Find message by ID with sender info and status
	 */
	async findById(id) {
		const result = await query(
			`SELECT
				m.*,
				json_build_object(
					'id', u.id,
					'name', u.name,
					'phone', u.phone,
					'avatarUrl', u.avatar_url
				) as sender,
				(SELECT json_build_object(
					'id', rm.id,
					'content', rm.content,
					'senderId', rm.sender_id,
					'senderName', ru.name
				)
				FROM messages rm
				INNER JOIN users ru ON rm.sender_id = ru.id
				WHERE rm.id = m.reply_to_message_id
				) as reply_to,
				(SELECT COALESCE(json_agg(json_build_object('emoji', emoji, 'userId', user_id)), '[]'::json)
				 FROM message_reactions
				 WHERE message_id = m.id
				) as reactions,
				CASE
					WHEN COUNT(mr.id) = 0 THEN 'sent'
					WHEN COUNT(mr.id) FILTER (WHERE mr.read_at IS NOT NULL) > 0 THEN 'read'
					WHEN COUNT(mr.id) FILTER (WHERE mr.delivered_at IS NOT NULL) > 0 THEN 'delivered'
					ELSE 'sent'
				END as status
			FROM messages m
			INNER JOIN users u ON m.sender_id = u.id
			LEFT JOIN message_receipts mr ON m.id = mr.message_id
			WHERE m.id = $1 AND m.deleted_at IS NULL
			GROUP BY m.id, u.id, u.name, u.phone, u.avatar_url`,
			[id]
		);
		return result.rows[0];
	},

	/**
	 * Get messages for a specific chat with pagination
	 */
	async getChatMessages(chatId, userId, limit = 50, before = null) {
		try {
			let queryText = `
				SELECT
					m.*,
					json_build_object(
						'id', u.id,
						'name', u.name,
						'phone', u.phone,
						'avatarUrl', u.avatar_url
					) as sender,
					(SELECT json_build_object(
						'id', rm.id,
						'content', rm.content,
						'senderId', rm.sender_id,
						'senderName', ru.name
					)
					FROM messages rm
					INNER JOIN users ru ON rm.sender_id = ru.id
					WHERE rm.id = m.reply_to_message_id
					) as reply_to,
					(SELECT COALESCE(json_agg(json_build_object('emoji', emoji, 'userId', user_id)), '[]'::json)
					 FROM message_reactions
					 WHERE message_id = m.id
					) as reactions,
					CASE
						WHEN COUNT(mr.id) = 0 THEN 'sent'
						WHEN COUNT(mr.id) FILTER (WHERE mr.read_at IS NOT NULL) > 0 THEN 'read'
						WHEN COUNT(mr.id) FILTER (WHERE mr.delivered_at IS NOT NULL) > 0 THEN 'delivered'
						ELSE 'sent'
					END as status
				FROM messages m
				INNER JOIN users u ON m.sender_id = u.id
				LEFT JOIN message_receipts mr ON m.id = mr.message_id
				WHERE m.chat_id = $1
				  AND m.deleted_at IS NULL
				  AND m.created_at > COALESCE((
					SELECT cc.cleared_at
					FROM chat_clears cc
					WHERE cc.chat_id = $1 AND cc.user_id = $2
				  ), TO_TIMESTAMP(0))
			`;

			const params = [chatId, userId];

			if (before) {
				queryText += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $3)`;
				params.push(before);
			}

			queryText += ` GROUP BY m.id, u.id, u.name, u.phone, u.avatar_url`;
			queryText += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
			params.push(limit);

			const result = await query(queryText, params);
			return result.rows.reverse();
		} catch (error) {
			if (!isMissingRelationError(error, 'chat_clears')) {
				throw error;
			}

			let legacyQueryText = `
				SELECT
					m.*,
					json_build_object(
						'id', u.id,
						'name', u.name,
						'phone', u.phone,
						'avatarUrl', u.avatar_url
					) as sender,
					(SELECT json_build_object(
						'id', rm.id,
						'content', rm.content,
						'senderId', rm.sender_id,
						'senderName', ru.name
					)
					FROM messages rm
					INNER JOIN users ru ON rm.sender_id = ru.id
					WHERE rm.id = m.reply_to_message_id
					) as reply_to,
					(SELECT COALESCE(json_agg(json_build_object('emoji', emoji, 'userId', user_id)), '[]'::json)
					 FROM message_reactions
					 WHERE message_id = m.id
					) as reactions,
					CASE
						WHEN COUNT(mr.id) = 0 THEN 'sent'
						WHEN COUNT(mr.id) FILTER (WHERE mr.read_at IS NOT NULL) > 0 THEN 'read'
						WHEN COUNT(mr.id) FILTER (WHERE mr.delivered_at IS NOT NULL) > 0 THEN 'delivered'
						ELSE 'sent'
					END as status
				FROM messages m
				INNER JOIN users u ON m.sender_id = u.id
				LEFT JOIN message_receipts mr ON m.id = mr.message_id
				WHERE m.chat_id = $1 AND m.deleted_at IS NULL
			`;

			const legacyParams = [chatId];

			if (before) {
				legacyQueryText += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $2)`;
				legacyParams.push(before);
			}

			legacyQueryText += ` GROUP BY m.id, u.id, u.name, u.phone, u.avatar_url`;
			legacyQueryText += ` ORDER BY m.created_at DESC LIMIT $${legacyParams.length + 1}`;
			legacyParams.push(limit);

			const legacyResult = await query(legacyQueryText, legacyParams);
			return legacyResult.rows.reverse();
		}
	},

	/**
	 * Create delivery/read receipt record
	 */
	async createReceipt(messageId, userId) {
		const result = await query(
			`INSERT INTO message_receipts (message_id, user_id) 
			 VALUES ($1, $2) 
			 ON CONFLICT (message_id, user_id) DO NOTHING 
			 RETURNING *`,
			[messageId, userId]
		);
		return result.rows[0];
	},

	/**
	 * Mark a message as delivered
	 */
	async markDelivered(messageId, userId) {
		const result = await query(
			`UPDATE message_receipts
			 SET delivered_at = CURRENT_TIMESTAMP
			 WHERE message_id = $1 AND user_id = $2 AND delivered_at IS NULL
			 RETURNING *`,
			[messageId, userId]
		);
		return result.rows[0];
	},

	/**
	 * Mark a message as read
	 */
	async markRead(messageId, userId) {
		const result = await query(
			`UPDATE message_receipts
			 SET read_at = CURRENT_TIMESTAMP, 
				 delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP)
			 WHERE message_id = $1 AND user_id = $2
			 RETURNING *`,
			[messageId, userId]
		);
		return result.rows[0];
	},

	/**
	 * Get count of unread messages for a user in a chat
	 */
	async getUnreadCount(chatId, userId) {
		const result = await query(
			`SELECT COUNT(*) as count
			 FROM messages m
			 LEFT JOIN message_receipts mr ON m.id = mr.message_id AND mr.user_id = $2
			 WHERE m.chat_id = $1 
			   AND m.sender_id != $2 
			   AND m.deleted_at IS NULL
			   AND mr.read_at IS NULL`,
			[chatId, userId]
		);
		return parseInt(result.rows[0].count);
	},

	/**
	 * Update message content (Edit)
	 */
	async edit(id, content) {
		const result = await query(
			`UPDATE messages 
			 SET content = $1, is_edited = true, updated_at = CURRENT_TIMESTAMP 
			 WHERE id = $2 
			 RETURNING *`,
			[content, id]
		);
		return result.rows[0];
	},

	/**
	 * Soft delete a message
	 */
	async delete(id) {
		const result = await query(
			`UPDATE messages 
			 SET deleted_at = CURRENT_TIMESTAMP 
			 WHERE id = $1 
			 RETURNING *`,
			[id]
		);
		return result.rows[0];
	},

	/**
	 * Add emoji reaction to a message
	 */
	async addReaction(messageId, userId, emoji) {
		const result = await query(
			`INSERT INTO message_reactions (message_id, user_id, emoji)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (message_id, user_id, emoji) 
			 DO UPDATE SET created_at = CURRENT_TIMESTAMP
			 RETURNING *`,
			[messageId, userId, emoji]
		);
		return result.rows[0];
	},

	/**
	 * Remove specific emoji reaction
	 */
	async removeReaction(messageId, userId, emoji) {
		const result = await query(
			`DELETE FROM message_reactions
			 WHERE message_id = $1 AND user_id = $2 AND emoji = $3
			 RETURNING *`,
			[messageId, userId, emoji]
		);
		return result.rows[0];
	},
};
