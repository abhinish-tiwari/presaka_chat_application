import { query } from '../config/database.js';
import { keysToCamel } from '../utils/caseConverter.js';

export const MessageModel = {
  // Create new message
  async create(chatId, senderId, content, type = 'text', metadata = null) {
    const result = await query(
      'INSERT INTO messages (chat_id, sender_id, content, type, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [chatId, senderId, content, type, metadata]
    );
    return keysToCamel(result.rows[0]);
  },

  // Find message by ID
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
    return keysToCamel(result.rows[0]);
  },

  // Get chat messages
  async getChatMessages(chatId, limit = 50, before = null) {
    let queryText = `
      SELECT
        m.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'phone', u.phone,
          'avatarUrl', u.avatar_url
        ) as sender,
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

    const params = [chatId];

    if (before) {
      queryText += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $2)`;
      params.push(before);
    }

    queryText += ` GROUP BY m.id, u.id, u.name, u.phone, u.avatar_url`;
    queryText += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(queryText, params);
    return keysToCamel(result.rows.reverse());
  },

  // Create message receipt
  async createReceipt(messageId, userId) {
    const result = await query(
      'INSERT INTO message_receipts (message_id, user_id) VALUES ($1, $2) ON CONFLICT (message_id, user_id) DO NOTHING RETURNING *',
      [messageId, userId]
    );
    return keysToCamel(result.rows[0]);
  },

  // Mark message as delivered
  async markDelivered(messageId, userId) {
    const result = await query(
      `UPDATE message_receipts
      SET delivered_at = CURRENT_TIMESTAMP
      WHERE message_id = $1 AND user_id = $2 AND delivered_at IS NULL
      RETURNING *`,
      [messageId, userId]
    );
    return keysToCamel(result.rows[0]);
  },

  // Mark message as read
  async markRead(messageId, userId) {
    const result = await query(
      `UPDATE message_receipts
      SET read_at = CURRENT_TIMESTAMP, delivered_at = COALESCE(delivered_at, CURRENT_TIMESTAMP)
      WHERE message_id = $1 AND user_id = $2
      RETURNING *`,
      [messageId, userId]
    );
    return keysToCamel(result.rows[0]);
  },

  // Get unread count for chat
  async getUnreadCount(chatId, userId) {
    const result = await query(
      `SELECT COUNT(*) as count
      FROM messages m
      LEFT JOIN message_receipts mr ON m.id = mr.message_id AND mr.user_id = $2
      WHERE m.chat_id = $1 AND m.sender_id != $2 AND m.deleted_at IS NULL
      AND (mr.read_at IS NULL OR mr.read_at IS NULL)`,
      [chatId, userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Soft delete message
  async delete(id) {
    const result = await query(
      'UPDATE messages SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return keysToCamel(result.rows[0]);
  },
};

