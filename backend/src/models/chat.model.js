import { query } from '../config/database.js';

export const ChatModel = {
  // Create new chat
  async create(type, createdBy, name = null) {
    const result = await query(
      'INSERT INTO chats (type, name, created_by) VALUES ($1, $2, $3) RETURNING *',
      [type, name, createdBy]
    );
    return result.rows[0];
  },

  // Find chat by ID
  async findById(id) {
    const result = await query(
      'SELECT * FROM chats WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Find private chat between two users
  async findPrivateChat(userId1, userId2) {
    const result = await query(
      `SELECT c.* FROM chats c
      INNER JOIN chat_members cm1 ON c.id = cm1.chat_id AND cm1.user_id = $1
      INNER JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id = $2
      WHERE c.type = 'private' AND cm1.left_at IS NULL AND cm2.left_at IS NULL
      LIMIT 1`,
      [userId1, userId2]
    );
    return result.rows[0];
  },

  // Get user's chats
  async getUserChats(userId, limit = 20, offset = 0) {
    const result = await query(
      `SELECT 
        c.*,
        (SELECT COUNT(*) FROM messages m WHERE m.chat_id = c.id AND m.deleted_at IS NULL) as message_count,
        (SELECT json_agg(json_build_object(
          'id', u.id,
          'name', u.name,
          'phone', u.phone,
          'avatarUrl', u.avatar_url
        ))
        FROM chat_members cm2
        INNER JOIN users u ON cm2.user_id = u.id
        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 AND cm2.left_at IS NULL
        ) as members
      FROM chats c
      INNER JOIN chat_members cm ON c.id = cm.chat_id
      WHERE cm.user_id = $1 AND cm.left_at IS NULL
      ORDER BY c.updated_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  // Get chat with members
  async getChatWithMembers(chatId) {
    const result = await query(
      `SELECT 
        c.*,
        json_agg(json_build_object(
          'id', u.id,
          'name', u.name,
          'phone', u.phone,
          'avatarUrl', u.avatar_url,
          'role', cm.role
        )) as members
      FROM chats c
      INNER JOIN chat_members cm ON c.id = cm.chat_id
      INNER JOIN users u ON cm.user_id = u.id
      WHERE c.id = $1 AND cm.left_at IS NULL
      GROUP BY c.id`,
      [chatId]
    );
    return result.rows[0];
  },

  // Add member to chat
  async addMember(chatId, userId, role = 'member') {
    const result = await query(
      'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [chatId, userId, role]
    );
    return result.rows[0];
  },

  // Check if user is member
  async isMember(chatId, userId) {
    const result = await query(
      'SELECT * FROM chat_members WHERE chat_id = $1 AND user_id = $2 AND left_at IS NULL',
      [chatId, userId]
    );
    return result.rows.length > 0;
  },

  // Update chat
  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(data[key]);
      paramCount++;
    });

    values.push(id);

    const result = await query(
      `UPDATE chats SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },
};

