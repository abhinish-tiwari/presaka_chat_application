# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.presaka.app/api
```

---

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

---

## API Endpoints

### Authentication

#### 1. Request OTP

Send OTP to user's phone number.

**Endpoint:** `POST /auth/request-otp`

**Request:**
```json
{
  "phone": "+919876543210"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300,
  "requestId": "req_abc123"
}
```

**Errors:**
- `400` - Invalid phone number
- `429` - Rate limit exceeded

---

#### 2. Verify OTP

Verify OTP and get authentication tokens.

**Endpoint:** `POST /auth/verify-otp`

**Request:**
```json
{
  "phone": "+919876543210",
  "otp": "123456",
  "requestId": "req_abc123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "phone": "+919876543210",
    "name": null,
    "avatarUrl": null,
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Errors:**
- `400` - Invalid OTP
- `401` - OTP expired
- `429` - Too many attempts

---

#### 3. Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Headers:**
```http
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...
```

**Response:** `200 OK`
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Errors:**
- `401` - Invalid or expired refresh token

---

#### 4. Logout

Invalidate refresh token.

**Endpoint:** `POST /auth/logout`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Users

#### 1. Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /users/me`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "phone": "+919876543210",
    "name": "John Doe",
    "avatarUrl": "https://cdn.presaka.app/avatars/user_123.jpg",
    "bio": "Hey there! I'm using Presaka",
    "isVerified": true,
    "lastSeen": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 2. Update Profile

Update user profile information.

**Endpoint:** `PATCH /users/me`

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "John Doe",
  "bio": "Hey there! I'm using Presaka"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "phone": "+919876543210",
    "name": "John Doe",
    "bio": "Hey there! I'm using Presaka",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 3. Upload Avatar

Upload profile picture.

**Endpoint:** `POST /users/me/avatar`

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request:**
```
FormData: avatar (file)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "avatarUrl": "https://cdn.presaka.app/avatars/user_123.jpg"
}
```

---

#### 4. Search Users

Search users by phone number.

**Endpoint:** `GET /users/search?phone=+919876543210`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "users": [
    {
      "id": "user_456",
      "phone": "+919876543210",
      "name": "Jane Doe",
      "avatarUrl": "https://cdn.presaka.app/avatars/user_456.jpg"
    }
  ]
}
```

---

### Chats

#### 1. Get All Chats

Get list of user's active chats with participants, last message, and unread count.

**Endpoint:** `GET /chats`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional) - Number of chats to return (default: 20)
- `offset` (optional) - Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "success": true,
  "chats": [
    {
      "id": "c1f73b64-8848-4389-8d7b-402867a18bb0",
      "type": "private",
      "name": null,
      "avatarUrl": null,
      "lastMessage": {
        "id": "m9a12b43-4321-4321-4321-123456789abc",
        "content": "Hey there! How are you?",
        "type": "text",
        "senderId": "u1234567-1111-2222-3333-444455556666",
        "createdAt": "2026-02-12T10:30:00Z",
        "status": "read"
      },
      "unreadCount": 0,
      "updatedAt": "2026-02-12T10:30:00Z",
      "participants": [
        {
          "id": "u1234567-1111-2222-3333-444455556666",
          "name": "Jane Doe",
          "phone": "+919876543210",
          "avatarUrl": null,
          "isOnline": true,
          "lastSeen": "2026-02-12T10:35:00Z"
        }
      ]
    }
  ],
  "total": 1
}
```

---

#### 2. Create Private Chat

Create or retrieve an existing 1-on-1 private chat.

**Endpoint:** `POST /chats/private`

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "recipientId": "u1234567-1111-2222-3333-444455556666"
}
```

**Response:** `200 OK` (Existing) or `201 Created` (New)
```json
{
  "success": true,
  "chat": {
    "id": "c1f73b64-8848-4389-8d7b-402867a18bb0",
    "type": "private",
    "createdAt": "2026-02-12T10:30:00Z",
    "participants": [
      {
        "id": "u1234567-1111-2222-3333-444455556666",
        "name": "Jane Doe",
        "phone": "+919876543210",
        "isOnline": false,
        "lastSeen": "2026-02-12T09:00:00Z"
      }
    ]
  }
}
```

**Errors:**
- `400` - Recipient ID required or cannot create chat with self
- `403` - CHAT_BLOCKED (one of the users has blocked the other)

---

#### 3. Get Chat Details

Get full details and participant list for a specific chat.

**Endpoint:** `GET /chats/:chatId`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "chat": {
    "id": "c1f73b64-8848-4389-8d7b-402867a18bb0",
    "type": "private",
    "name": null,
    "avatarUrl": null,
    "createdAt": "2026-02-12T10:30:00Z",
    "participants": [
      {
        "id": "u1234567-1111-2222-3333-444455556666",
        "name": "Jane Doe",
        "phone": "+919876543210",
        "avatarUrl": null,
        "isOnline": true,
        "lastSeen": "2026-02-12T10:35:00Z"
      }
    ]
  }
}
```

---

#### 4. Clear Chat History

Clear message history in this chat for the authenticated user only (does not clear for other participants).

**Endpoint:** `POST /chats/:chatId/clear`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation cleared",
  "clearedAt": "2026-02-12T11:00:00Z"
}
```

---

#### 5. Block User in Chat

Block the other user in a private chat and leave the conversation.

**Endpoint:** `POST /chats/:chatId/block`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User blocked successfully",
  "blockedUserId": "u1234567-1111-2222-3333-444455556666",
  "chatId": "c1f73b64-8848-4389-8d7b-402867a18bb0"
}
```

---

#### 6. Delete / Leave Chat

Delete the chat for the authenticated user (removes conversation from active feed).

**Endpoint:** `DELETE /chats/:chatId`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation deleted",
  "chatId": "c1f73b64-8848-4389-8d7b-402867a18bb0"
}
```

---

### Messages

#### 1. Get Chat Messages

Get messages from a chat (paginated with before cursor).

**Endpoint:** `GET /messages/chats/:chatId/messages`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional) - Number of messages (default: 50)
- `before` (optional) - Timestamp or message cursor to fetch older messages

**Response:** `200 OK`
```json
{
  "success": true,
  "messages": [
    {
      "id": "m9a12b43-4321-4321-4321-123456789abc",
      "chatId": "c1f73b64-8848-4389-8d7b-402867a18bb0",
      "senderId": "u1234567-1111-2222-3333-444455556666",
      "content": "Hello! How can I help you?",
      "type": "text",
      "status": "read",
      "replyToId": null,
      "createdAt": "2026-02-12T10:30:00Z",
      "updatedAt": "2026-02-12T10:30:00Z"
    }
  ],
  "hasMore": false
}
```

---

#### 2. Delete Message

Soft-delete a message (only message authors can delete their messages).

**Endpoint:** `DELETE /messages/:messageId`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

**Errors:**
- `403` - You can only delete your own messages
- `404` - Message not found

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_PHONE` | 400 | Invalid phone number format |
| `INVALID_OTP` | 400 | Incorrect OTP |
| `OTP_EXPIRED` | 401 | OTP has expired |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `NOT_FOUND` | 404 | Resource not found |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limiting

- **OTP Requests:** 3 per 10 minutes per phone number
- **API Requests:** 100 per minute per user
- **Message Sending:** 30 per minute per user

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642244700
```

---

## Pagination

List endpoints support cursor-based pagination:

```http
GET /chats?limit=20&offset=0
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```

