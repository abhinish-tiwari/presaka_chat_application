import { query } from '../config/database.js';
import { keysToCamel } from '../utils/caseConverter.js';

export const UserModel = {
  // Create new user
  async create(phone) {
    // Set default name as "User" + last 4 digits of phone
    const defaultName = `User ${phone.slice(-4)}`;

    const result = await query(
      'INSERT INTO users (phone, name, is_verified) VALUES ($1, $2, $3) RETURNING *',
      [phone, defaultName, true]
    );
    return keysToCamel(result.rows[0]);
  },

  // Find user by ID
  async findById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return keysToCamel(result.rows[0]);
  },

  // Find user by phone
  async findByPhone(phone) {
    const result = await query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    return keysToCamel(result.rows[0]);
  },

  // Update user profile
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
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return keysToCamel(result.rows[0]);
  },

  // Update last seen
  async updateLastSeen(id) {
    const result = await query(
      'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return keysToCamel(result.rows[0]);
  },

  // Search users by phone
  async searchByPhone(phone) {
    const result = await query(
      'SELECT id, phone, name, avatar_url FROM users WHERE phone LIKE $1 LIMIT 10',
      [`%${phone}%`]
    );
    return keysToCamel(result.rows);
  },

  // Get user with stats
  async getUserWithStats(id) {
    const result = await query(
      `SELECT
        u.*,
        COUNT(DISTINCT cm.chat_id) as chatCount
      FROM users u
      LEFT JOIN chat_members cm ON u.id = cm.user_id AND cm.left_at IS NULL
      WHERE u.id = $1
      GROUP BY u.id`,
      [id]
    );
    return keysToCamel(result.rows[0]);
  },
};

