# 📡 API Documentation

This folder contains all API-related documentation for Preṣaka, including REST APIs, WebSocket events, and authentication flows.

---

## 📋 Contents

### REST API

- **[API.md](API.md)** - Complete REST API reference
  - Authentication endpoints
  - User management
  - Chat operations
  - Message operations
  - File uploads
  - Request/response formats
  - Error handling
  - Rate limiting

### WebSocket Communication

- **[WEBSOCKET.md](WEBSOCKET.md)** - Real-time communication documentation
  - Connection setup
  - Event types
  - Message events
  - Typing indicators
  - Presence updates
  - Read receipts
  - Error handling
  - Reconnection logic

### Authentication

- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Authentication flow documentation
  - Phone number authentication
  - OTP generation and verification
  - JWT token management
  - Session handling
  - Security best practices

---

## 🎯 Quick Navigation

### I want to...

**...understand the API endpoints**  
→ See [API.md](API.md)

**...implement real-time messaging**  
→ See [WEBSOCKET.md](WEBSOCKET.md)

**...implement authentication**  
→ See [AUTHENTICATION.md](AUTHENTICATION.md)

**...handle errors**  
→ Check error handling sections in [API.md](API.md)

---

## 🔑 API Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.presaka.com/api
```

### Authentication
All API requests (except auth endpoints) require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 📊 API Endpoints Summary

### Authentication
- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP and get JWT token
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout user

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `GET /users/:id` - Get user by ID
- `GET /users/search` - Search users

### Chats
- `GET /chats` - Get all chats for current user
- `POST /chats` - Create new chat
- `GET /chats/:id` - Get chat by ID
- `DELETE /chats/:id` - Delete chat

### Messages
- `GET /chats/:chatId/messages` - Get messages for a chat
- `POST /chats/:chatId/messages` - Send a message
- `PUT /messages/:id` - Update message
- `DELETE /messages/:id` - Delete message

---

## 🔌 WebSocket Events Summary

### Client → Server
- `message:send` - Send a message
- `message:read` - Mark message as read
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `presence:update` - Update online status

### Server → Client
- `message:new` - New message received
- `message:updated` - Message updated
- `message:deleted` - Message deleted
- `message:read` - Message read by recipient
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `presence:update` - User presence changed

---

## 🔗 Related Documentation

- [Architecture Overview](../architecture/ARCHITECTURE.md) - System design
- [Database Schema](../architecture/DATABASE.md) - Data models
- [Security Practices](../architecture/SECURITY.md) - Security guidelines
- [Quick Start](../setup/QUICK_START.md) - Setup guide

---

## 💡 Best Practices

### API Usage
- Always validate input data
- Handle errors gracefully
- Implement retry logic for failed requests
- Use pagination for large datasets
- Cache responses when appropriate

### WebSocket Usage
- Implement reconnection logic
- Handle connection errors
- Validate events before processing
- Use acknowledgments for critical events
- Implement heartbeat/ping-pong

### Authentication
- Store JWT tokens securely
- Refresh tokens before expiry
- Handle token expiration gracefully
- Never expose tokens in URLs
- Use HTTPS in production

---

**Need help?** Check the [main documentation](../README.md) or open an issue on GitHub.

