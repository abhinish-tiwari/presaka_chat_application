import { query } from '../config/database.js';
import { keysToSnake } from '../utils/caseConverter.js';

export const UserModel = {
	/**
	 * Create new user with a default name
	 */
	async create(phone) {
		const defaultName = `User ${phone.slice(-4)}`;

		const result = await query(
			'INSERT INTO users (phone, name, is_verified) VALUES ($1, $2, $3) RETURNING *',
			[phone, defaultName, true]
		);
		return result.rows[0];
	},

	/**
	 * Find user by unique ID
	 */
	async findById(id) {
		const result = await query(
			'SELECT * FROM users WHERE id = $1',
			[id]
		);
		return result.rows[0];
	},

	/**
	 * Find user by phone number
	 */
	async findByPhone(phone) {
		const result = await query(
			'SELECT * FROM users WHERE phone = $1',
			[phone]
		);
		return result.rows[0];
	},

	/**
	 * Update user profile fields dynamically
	 */
	async update(id, data) {
		// Ensure keys are snake_case for DB
		const snakeData = keysToSnake(data);
		const fields = [];
		const values = [];
		let paramCount = 1;

		Object.keys(snakeData).forEach(key => {
			fields.push(`${key} = $${paramCount}`);
			values.push(snakeData[key]);
			paramCount++;
		});

		values.push(id);

		const result = await query(
			`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
			values
		);
		return result.rows[0];
	},

	/**
	 * Update user's heart-beat / last seen status
	 */
	async updateLastSeen(id) {
		const result = await query(
			'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
			[id]
		);
		return result.rows[0];
	},

	/**
	 * Search for users by phone prefix
	 */
	async searchByPhone(phone) {
		const result = await query(
			'SELECT id, phone, name, avatar_url FROM users WHERE phone LIKE $1 LIMIT 10',
			[`%${phone}%`]
		);
		return result.rows;
	},

	/**
	 * Get comprehensive user profile with basic stats
	 */
	async getUserWithStats(id) {
		const result = await query(
			`SELECT
				u.*,
				COUNT(DISTINCT cm.chat_id) as chat_count
			FROM users u
			LEFT JOIN chat_members cm ON u.id = cm.user_id AND cm.left_at IS NULL
			WHERE u.id = $1
			GROUP BY u.id`,
			[id]
		);
		return result.rows[0];
	},
};
