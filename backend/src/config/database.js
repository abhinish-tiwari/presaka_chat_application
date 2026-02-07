import pg from 'pg';
import { logger } from '../utils/logger.js';
import { keysToCamel } from '../utils/caseConverter.js';

const { Pool } = pg;

let pool;

export const connectDB = async () => {
	try {
		pool = new Pool({
			connectionString: process.env.DATABASE_URL,
			max: 30, // Increased pool size
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 10000, // Increased timeout to 10 seconds
		});

		// Test connection
		const client = await pool.connect();
		logger.info('✅ PostgreSQL connected successfully');
		client.release();

		// Handle pool errors
		pool.on('error', (err) => {
			logger.error('Unexpected error on idle PostgreSQL client', err);
		});

		return pool;
	} catch (error) {
		logger.error('❌ PostgreSQL connection failed:', error);
		throw error;
	}
};

export const getDB = () => {
	if (!pool) {
		throw new Error('Database not initialized. Call connectDB first.');
	}
	return pool;
};

export const query = async (text, params, camelCase = true) => {
	const start = Date.now();
	try {
		const result = await pool.query(text, params);
		const duration = Date.now() - start;
		logger.debug('Executed query', { text, duration, rows: result.rowCount });

		if (camelCase && result.rows && result.rows.length > 0) {
			result.rows = keysToCamel(result.rows);
		}

		return result;
	} catch (error) {
		logger.error('Query error:', { text, error: error.message });
		throw error;
	}
};

export const getClient = async () => {
	return await pool.connect();
};

