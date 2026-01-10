import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'presaka',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, phone, name, bio FROM users ORDER BY created_at DESC LIMIT 10');

    console.log('\n📊 Recent Users:');
    console.log('================\n');

    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Name: ${user.name || '❌ NULL'}`);
      console.log(`   Bio: ${user.bio || '❌ NULL'}`);
      console.log('');
    });

    // Count users with null names
    const nullNameCount = await pool.query('SELECT COUNT(*) FROM users WHERE name IS NULL');
    console.log(`\n⚠️  Users with NULL names: ${nullNameCount.rows[0].count}`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkUsers();

