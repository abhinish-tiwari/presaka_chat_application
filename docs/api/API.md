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

Get list of user's chats.

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
      "id": "chat_123",
      "type": "private",
      "name": null,
      "avatarUrl": null,
      "lastMessage": {
        "content": "Hello!",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      "unreadCount": 3,
      "updatedAt": "2024-01-15T10:30:00Z",
      "members": [
        {
          "id": "user_456",
          "name": "Jane Doe",
          "avatarUrl": "https://cdn.presaka.app/avatars/user_456.jpg"
        }
      ]
    }
  ],
  "total": 15
}
```

---

#### 2. Create Private Chat

Create or get existing private chat.

**Endpoint:** `POST /chats/private`

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "recipientId": "user_456"
}
```

**Response:** `200 OK` or `201 Created`
```json
{
  "success": true,
  "chat": {
    "id": "chat_123",
    "type": "private",
    "createdAt": "2024-01-15T10:30:00Z",
    "members": [
      {
        "id": "user_123",
        "name": "John Doe"
      },
      {
        "id": "user_456",
        "name": "Jane Doe"
      }
    ]
  }
}
```

---

#### 3. Get Chat Details

Get details of a specific chat.

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
    "id": "chat_123",
    "type": "private",
    "name": null,
    "avatarUrl": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "members": [
      {
        "id": "user_456",
        "name": "Jane Doe",
        "avatarUrl": "https://cdn.presaka.app/avatars/user_456.jpg",
        "role": "member"
      }
    ]
  }
}
```

---

### Messages

#### 1. Get Chat Messages

Get messages from a chat.

**Endpoint:** `GET /chats/:chatId/messages`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (optional) - Number of messages (default: 50)
- `before` (optional) - Get messages before this message ID
- `after` (optional) - Get messages after this message ID

**Response:** `200 OK`
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_123",
      "chatId": "chat_123",
      "senderId": "user_456",
      "content": "Hello!",
      "type": "text",
      "status": "read",
      "createdAt": "2024-01-15T10:30:00Z",
      "sender": {
        "id": "user_456",
        "name": "Jane Doe",
        "avatarUrl": "https://cdn.presaka.app/avatars/user_456.jpg"
      }
    }
  ],
  "hasMore": true
}
```

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

