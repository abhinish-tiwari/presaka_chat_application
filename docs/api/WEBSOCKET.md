# WebSocket Events Documentation

## Overview

Preṣaka uses **Socket.IO** for real-time bidirectional communication. This document describes all WebSocket events used in the application.

---

## Connection

### Client Connection

```javascript
import io from 'socket.io-client';

const socket = io('https://api.presaka.app', {
  auth: {
    token: accessToken
  },
  transports: ['websocket', 'polling']
});
```

### Server Authentication

Server validates JWT token on connection:

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify token
  // Attach user to socket
  next();
});
```

---

## Events Reference

### Connection Events

#### 1. `connect`

Emitted when client successfully connects to server.

**Client Listener:**
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
  console.log('Socket ID:', socket.id);
});
```

---

#### 2. `disconnect`

Emitted when client disconnects from server.

**Client Listener:**
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Reasons: 'io server disconnect', 'io client disconnect', 'ping timeout', 'transport close'
});
```

---

#### 3. `connect_error`

Emitted when connection fails.

**Client Listener:**
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

---

### Presence Events

#### 1. `user:online`

Emitted when a user comes online.

**Server → Client:**
```javascript
socket.on('user:online', (data) => {
  console.log('User online:', data);
  // data: { userId: 'user_123', timestamp: '2024-01-15T10:30:00Z' }
});
```

---

#### 2. `user:offline`

Emitted when a user goes offline.

**Server → Client:**
```javascript
socket.on('user:offline', (data) => {
  console.log('User offline:', data);
  // data: { userId: 'user_123', lastSeen: '2024-01-15T10:30:00Z' }
});
```

---

#### 3. `presence:update`

Request presence status of specific users.

**Client → Server:**
```javascript
socket.emit('presence:update', {
  userIds: ['user_123', 'user_456']
});
```

**Server → Client:**
```javascript
socket.on('presence:status', (data) => {
  console.log('Presence status:', data);
  // data: [
  //   { userId: 'user_123', status: 'online', lastSeen: null },
  //   { userId: 'user_456', status: 'offline', lastSeen: '2024-01-15T10:00:00Z' }
  // ]
});
```

---

### Messaging Events

#### 1. `message:send`

Send a new message.

**Client → Server:**
```javascript
socket.emit('message:send', {
  chatId: 'chat_123',
  content: 'Hello!',
  type: 'text',
  tempId: 'temp_abc123' // Client-generated temporary ID
});
```

**Server → Client (Acknowledgment):**
```javascript
socket.on('message:sent', (data) => {
  console.log('Message sent:', data);
  // data: {
  //   tempId: 'temp_abc123',
  //   message: {
  //     id: 'msg_123',
  //     chatId: 'chat_123',
  //     senderId: 'user_123',
  //     content: 'Hello!',
  //     type: 'text',
  //     status: 'sent',
  //     createdAt: '2024-01-15T10:30:00Z'
  //   }
  // }
});
```

---

#### 2. `message:receive`

Receive a new message.

**Server → Client:**
```javascript
socket.on('message:receive', (data) => {
  console.log('New message:', data);
  // data: {
  //   id: 'msg_123',
  //   chatId: 'chat_123',
  //   senderId: 'user_456',
  //   content: 'Hi there!',
  //   type: 'text',
  //   status: 'sent',
  //   createdAt: '2024-01-15T10:30:00Z',
  //   sender: {
  //     id: 'user_456',
  //     name: 'Jane Doe',
  //     avatarUrl: 'https://cdn.presaka.app/avatars/user_456.jpg'
  //   }
  // }
});
```

---

#### 3. `message:delivered`

Mark message as delivered.

**Client → Server:**
```javascript
socket.emit('message:delivered', {
  messageId: 'msg_123',
  chatId: 'chat_123'
});
```

**Server → Client (to sender):**
```javascript
socket.on('message:status', (data) => {
  console.log('Message status updated:', data);
  // data: {
  //   messageId: 'msg_123',
  //   status: 'delivered',
  //   timestamp: '2024-01-15T10:30:00Z'
  // }
});
```

---

#### 4. `message:read`

Mark message as read.

**Client → Server:**
```javascript
socket.emit('message:read', {
  messageId: 'msg_123',
  chatId: 'chat_123'
});
```

**Server → Client (to sender):**
```javascript
socket.on('message:status', (data) => {
  console.log('Message read:', data);
  // data: {
  //   messageId: 'msg_123',
  //   status: 'read',
  //   timestamp: '2026-02-12T10:30:00Z'
  // }
});
```

---

#### 5. `message:edit`

Edit a previously sent message (within 15-minute window).

**Client → Server:**
```javascript
socket.emit('message:edit', {
  messageId: 'msg_123',
  chatId: 'chat_123',
  content: 'Updated message content'
});
```

**Server → Client (Broadcast to chat room):**
```javascript
socket.on('message:edited', (data) => {
  console.log('Message edited:', data);
  // data: {
  //   messageId: 'msg_123',
  //   chatId: 'chat_123',
  //   content: 'Updated message content',
  //   isEdited: true,
  //   updatedAt: '2026-02-12T10:35:00Z'
  // }
});
```

**Errors:**
- `TIME_EXPIRED`: Edit window expired (> 15 minutes)
- `FORBIDDEN`: Only the author can edit their message

---

#### 6. `message:delete`

Delete a message for everyone in the conversation.

**Client → Server:**
```javascript
socket.emit('message:delete', {
  messageId: 'msg_123',
  chatId: 'chat_123'
});
```

**Server → Client (Broadcast to chat room):**
```javascript
socket.on('message:deleted', (data) => {
  console.log('Message deleted:', data);
  // data: {
  //   messageId: 'msg_123',
  //   chatId: 'chat_123',
  //   timestamp: '2026-02-12T10:36:00Z'
  // }
});
```

---

#### 7. `message:reaction:add`

Add an emoji reaction to a message.

**Client → Server:**
```javascript
socket.emit('message:reaction:add', {
  messageId: 'msg_123',
  chatId: 'chat_123',
  emoji: '❤️'
});
```

**Server → Client (Broadcast to chat room):**
```javascript
socket.on('message:reaction:added', (data) => {
  console.log('Reaction added:', data);
  // data: {
  //   messageId: 'msg_123',
  //   chatId: 'chat_123',
  //   userId: 'user_456',
  //   emoji: '❤️'
  // }
});
```

---

#### 8. `message:reaction:remove`

Remove an emoji reaction from a message.

**Client → Server:**
```javascript
socket.emit('message:reaction:remove', {
  messageId: 'msg_123',
  chatId: 'chat_123',
  emoji: '❤️'
});
```

**Server → Client (Broadcast to chat room):**
```javascript
socket.on('message:reaction:removed', (data) => {
  console.log('Reaction removed:', data);
  // data: {
  //   messageId: 'msg_123',
  //   chatId: 'chat_123',
  //   userId: 'user_456',
  //   emoji: '❤️'
  // }
});
```

---

### Typing Events

#### 1. `typing:start`

Indicate user is typing.

**Client → Server:**
```javascript
socket.emit('typing:start', {
  chatId: 'chat_123'
});
```

**Server → Client (to other chat members):**
```javascript
socket.on('user:typing', (data) => {
  console.log('User typing:', data);
  // data: {
  //   chatId: 'chat_123',
  //   userId: 'user_456',
  //   userName: 'Jane Doe'
  // }
});
```

---

#### 2. `typing:stop`

Indicate user stopped typing.

**Client → Server:**
```javascript
socket.emit('typing:stop', {
  chatId: 'chat_123'
});
```

**Server → Client (to other chat members):**
```javascript
socket.on('user:stopped-typing', (data) => {
  console.log('User stopped typing:', data);
  // data: {
  //   chatId: 'chat_123',
  //   userId: 'user_456'
  // }
});
```

---

### Chat Events

#### 1. `chat:join`

Join a chat room.

**Client → Server:**
```javascript
socket.emit('chat:join', {
  chatId: 'chat_123'
});
```

---

#### 2. `chat:leave`

Leave a chat room.

**Client → Server:**
```javascript
socket.emit('chat:leave', {
  chatId: 'chat_123'
});
```

---

### Error Events

#### 1. `error`

Emitted when an error occurs.

**Server → Client:**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // error: {
  //   code: 'UNAUTHORIZED',
  //   message: 'Invalid token'
  // }
});
```

---

## Event Flow Examples

### Sending a Message

```
Client A                    Server                    Client B
   │                          │                          │
   │  message:send            │                          │
   ├─────────────────────────>│                          │
   │                          │                          │
   │  message:sent (ack)      │                          │
   │<─────────────────────────┤                          │
   │                          │                          │
   │                          │  message:receive         │
   │                          ├─────────────────────────>│
   │                          │                          │
   │                          │  message:delivered       │
   │                          │<─────────────────────────┤
   │                          │                          │
   │  message:status          │                          │
   │<─────────────────────────┤                          │
   │                          │                          │
```

---

### Typing Indicator

```
Client A                    Server                    Client B
   │                          │                          │
   │  typing:start            │                          │
   ├─────────────────────────>│                          │
   │                          │                          │
   │                          │  user:typing             │
   │                          ├─────────────────────────>│
   │                          │                          │
   │  (3 seconds later)       │                          │
   │  typing:stop             │                          │
   ├─────────────────────────>│                          │
   │                          │                          │
   │                          │  user:stopped-typing     │
   │                          ├─────────────────────────>│
   │                          │                          │
```

---

## Best Practices

### 1. Reconnection Strategy

```javascript
const socket = io('https://api.presaka.app', {
  auth: { token: accessToken },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

socket.on('disconnect', () => {
  // Show "Connecting..." UI
});

socket.on('connect', () => {
  // Hide "Connecting..." UI
  // Rejoin active chats
  activeChats.forEach(chatId => {
    socket.emit('chat:join', { chatId });
  });
});
```

---

### 2. Optimistic UI Updates

```javascript
// Add message to UI immediately
addMessageToUI({
  tempId: 'temp_123',
  content: 'Hello!',
  status: 'sending'
});

// Send to server
socket.emit('message:send', {
  chatId: 'chat_123',
  content: 'Hello!',
  tempId: 'temp_123'
});

// Update when confirmed
socket.on('message:sent', (data) => {
  updateMessageInUI(data.tempId, {
    id: data.message.id,
    status: 'sent'
  });
});
```

---

### 3. Typing Debounce

```javascript
let typingTimeout;

function handleTyping() {
  if (!typingTimeout) {
    socket.emit('typing:start', { chatId });
  }
  
  clearTimeout(typingTimeout);
  
  typingTimeout = setTimeout(() => {
    socket.emit('typing:stop', { chatId });
    typingTimeout = null;
  }, 3000);
}
```

---

## Security Considerations

1. **Authentication:** Always validate JWT on connection
2. **Authorization:** Verify user has access to chat before emitting events
3. **Rate Limiting:** Limit events per user per second
4. **Input Validation:** Validate all incoming event data
5. **Room Isolation:** Users can only receive events from their chats

