# Database Schema

## Overview

Preṣaka uses **PostgreSQL** for persistent data storage and **Redis** for caching and real-time data. This document outlines the complete database schema.

---

## PostgreSQL Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    users    │         │    chats    │         │  messages   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │         │ id (PK)     │
│ phone       │◄───┐    │ type        │◄───┐    │ chat_id (FK)│
│ name        │    │    │ created_at  │    │    │ sender_id   │
│ avatar_url  │    │    │ updated_at  │    │    │ content     │
│ is_verified │    │    └─────────────┘    │    │ type        │
│ last_seen   │    │                       │    │ status      │
│ created_at  │    │                       │    │ created_at  │
│ updated_at  │    │                       │    │ updated_at  │
└─────────────┘    │                       │    │ deleted_at  │
                   │                       │    └─────────────┘
                   │    ┌─────────────┐    │
                   └────┤chat_members │────┘
                        ├─────────────┤
                        │ id (PK)     │
                        │ chat_id (FK)│
                        │ user_id (FK)│
                        │ role        │
                        │ joined_at   │
                        │ left_at     │
                        └─────────────┘
```

---

## Table Definitions

### 1. users

Stores user profile information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Columns:**
- `id` - Unique user identifier (UUID)
- `phone` - Phone number with country code (unique)
- `name` - User's display name (optional)
- `avatar_url` - Profile picture URL (optional)
- `bio` - User bio/status (optional)
- `is_verified` - Phone verification status
- `last_seen` - Last activity timestamp
- `created_at` - Account creation timestamp
- `updated_at` - Last profile update timestamp

---

### 2. chats

Stores chat room metadata.

```sql
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('private', 'group')),
    name VARCHAR(100),
    avatar_url TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_chats_type ON chats(type);
CREATE INDEX idx_chats_created_at ON chats(created_at);
```

**Columns:**
- `id` - Unique chat identifier (UUID)
- `type` - Chat type: 'private' or 'group'
- `name` - Group name (null for private chats)
- `avatar_url` - Group avatar (null for private chats)
- `created_by` - User who created the chat
- `created_at` - Chat creation timestamp
- `updated_at` - Last activity timestamp

---

### 3. chat_members

Maps users to chats (many-to-many relationship).

```sql
CREATE TABLE chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(chat_id, user_id)
);

-- Indexes
CREATE INDEX idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX idx_chat_members_active ON chat_members(chat_id, user_id) 
    WHERE left_at IS NULL;
```

**Columns:**
- `id` - Unique membership identifier
- `chat_id` - Reference to chat
- `user_id` - Reference to user
- `role` - Member role: 'admin' or 'member'
- `joined_at` - When user joined the chat
- `left_at` - When user left (null if active)

---

### 4. messages

Stores all chat messages.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_status ON messages(status) WHERE deleted_at IS NULL;
```

**Columns:**
- `id` - Unique message identifier
- `chat_id` - Reference to chat
- `sender_id` - Reference to sender
- `content` - Message content (text or file URL)
- `type` - Message type: text, image, video, audio, file
- `status` - Delivery status: sent, delivered, read
- `reply_to` - Reference to replied message (optional)
- `metadata` - Additional data (file size, duration, etc.)
- `created_at` - Message sent timestamp
- `updated_at` - Last edit timestamp
- `deleted_at` - Soft delete timestamp

---

### 5. message_receipts

Tracks message delivery and read status per user.

```sql
CREATE TABLE message_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(message_id, user_id)
);

-- Indexes
CREATE INDEX idx_receipts_message_id ON message_receipts(message_id);
CREATE INDEX idx_receipts_user_id ON message_receipts(user_id);
```

**Columns:**
- `id` - Unique receipt identifier
- `message_id` - Reference to message
- `user_id` - Reference to recipient
- `delivered_at` - When message was delivered
- `read_at` - When message was read

---

## Redis Schema

Redis is used for temporary, high-speed data storage.

### Key Patterns

#### 1. OTP Storage
```
Key: otp:{phone}
Value: {hash: "bcrypt_hash", attempts: 0, requestId: "req_123"}
TTL: 300 seconds (5 minutes)
```

#### 2. User Presence
```
Key: presence:{userId}
Value: {status: "online", lastSeen: timestamp, socketId: "socket_123"}
TTL: 3600 seconds (1 hour, refreshed on activity)
```

#### 3. Socket Mapping
```
Key: socket:{userId}
Value: ["socket_123", "socket_456"]
TTL: None (removed on disconnect)
```

#### 4. Typing Indicators
```
Key: typing:{chatId}:{userId}
Value: "1"
TTL: 5 seconds
```

#### 5. Rate Limiting
```
Key: ratelimit:otp:{phone}
Value: 3
TTL: 600 seconds (10 minutes)
```

#### 6. Refresh Tokens
```
Key: refresh:{tokenId}
Value: {userId: "user_123", issuedAt: timestamp}
TTL: 604800 seconds (7 days)
```

---

## Database Queries

### Common Queries

#### Get User Chats
```sql
SELECT c.*, 
       COUNT(m.id) FILTER (WHERE m.status != 'read' AND m.sender_id != $1) as unread_count,
       (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
FROM chats c
JOIN chat_members cm ON c.id = cm.chat_id
LEFT JOIN messages m ON c.id = m.chat_id
WHERE cm.user_id = $1 AND cm.left_at IS NULL
GROUP BY c.id
ORDER BY c.updated_at DESC;
```

#### Get Chat Messages
```sql
SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE m.chat_id = $1 AND m.deleted_at IS NULL
ORDER BY m.created_at DESC
LIMIT $2 OFFSET $3;
```

#### Create Private Chat
```sql
-- Check if chat already exists
SELECT c.id FROM chats c
JOIN chat_members cm1 ON c.id = cm1.chat_id
JOIN chat_members cm2 ON c.id = cm2.chat_id
WHERE c.type = 'private'
  AND cm1.user_id = $1
  AND cm2.user_id = $2
  AND cm1.left_at IS NULL
  AND cm2.left_at IS NULL;
```

---

## Migrations

Use a migration tool like **node-pg-migrate** or **Knex.js**.

```bash
# Create migration
npm run migrate create initial-schema

# Run migrations
npm run migrate up

# Rollback
npm run migrate down
```

---

## Backup Strategy

1. **Daily automated backups** - Full database backup
2. **Point-in-time recovery** - WAL archiving
3. **Retention policy** - Keep 30 days of backups
4. **Test restores** - Monthly restore testing

---

## Performance Optimization

1. **Indexes** - On frequently queried columns
2. **Partitioning** - Messages table by date (future)
3. **Connection pooling** - Reuse database connections
4. **Query optimization** - Use EXPLAIN ANALYZE
5. **Caching** - Redis for hot data

