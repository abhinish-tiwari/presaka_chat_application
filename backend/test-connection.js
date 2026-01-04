import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('Testing database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  const client = await pool.connect();
  console.log('✅ Connected successfully!');
  const result = await client.query('SELECT NOW()');
  console.log('Current time from DB:', result.rows[0]);
  client.release();
  await pool.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}

