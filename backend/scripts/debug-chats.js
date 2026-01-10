import pg from 'pg';
import dotenv from 'dotenv';
import { keysToCamel } from '../src/utils/caseConverter.js';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'presaka',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function debugChats() {
  try {
    // Get first user
    const userResult = await pool.query('SELECT id, phone, name FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('No users found');
      await pool.end();
      return;
    }

    const userId = userResult.rows[0].id;
    console.log('\n🔍 Debugging chats for user:');
    console.log(`   ID: ${userId}`);
    console.log(`   Phone: ${userResult.rows[0].phone}`);
    console.log(`   Name: ${userResult.rows[0].name}`);

    // Get chats
    const result = await pool.query(
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
        0 as unread_count
      FROM chats c
      INNER JOIN chat_members cm ON c.id = cm.chat_id
      WHERE cm.user_id = $1 AND cm.left_at IS NULL
      ORDER BY c.updated_at DESC
      LIMIT 5`,
      [userId]
    );

    console.log('\n📊 Chats found:', result.rows.length);
    console.log('================\n');

    const camelChats = keysToCamel(result.rows);

    camelChats.forEach((chat, index) => {
      console.log(`${index + 1}. Chat ID: ${chat.id}`);
      console.log(`   Type: ${chat.type}`);
      console.log(`   Participants:`, JSON.stringify(chat.participants, null, 2));
      console.log(`   Last Message:`, JSON.stringify(chat.lastMessage, null, 2));
      console.log(`   Unread Count: ${chat.unreadCount}`);
      console.log(`   Message Count: ${chat.messageCount}`);
      console.log('');
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

debugChats();

