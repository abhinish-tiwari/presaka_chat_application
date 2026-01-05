# Authentication Flow

## Overview

Preṣaka uses **phone number + OTP (One-Time Password)** authentication, eliminating the need for passwords. This approach is:
- **User-friendly** - No password to remember
- **Secure** - OTP expires quickly
- **India-first** - Familiar to Indian users
- **Scalable** - Easy to implement and maintain

---

## Authentication Architecture

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│  Client │         │  Server │         │  Redis  │         │   SMS   │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │                   │
     │  1. Send Phone    │                   │                   │
     ├──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │  2. Generate OTP  │                   │
     │                   ├──────────────────>│                   │
     │                   │                   │                   │
     │                   │  3. Send OTP      │                   │
     │                   ├───────────────────────────────────────>│
     │                   │                   │                   │
     │  4. OTP Sent      │                   │                   │
     │<──────────────────┤                   │                   │
     │                   │                   │                   │
     │  5. Submit OTP    │                   │                   │
     ├──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │  6. Verify OTP    │                   │
     │                   ├──────────────────>│                   │
     │                   │                   │                   │
     │                   │  7. OTP Valid     │                   │
     │                   │<──────────────────┤                   │
     │                   │                   │                   │
     │  8. JWT Tokens    │                   │                   │
     │<──────────────────┤                   │                   │
     │                   │                   │                   │
```

---

## Step-by-Step Flow

### Step 1: Request OTP

**Client Request:**
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Server Actions:**
1. Validate phone number format
2. Check rate limiting (max 3 requests per 10 minutes)
3. Generate 6-digit OTP
4. Hash OTP before storing
5. Store in Redis with 5-minute TTL
6. Send OTP via SMS provider

**Server Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300,
  "requestId": "req_abc123"
}
```

---

### Step 2: Verify OTP

**Client Request:**
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456",
  "requestId": "req_abc123"
}
```

**Server Actions:**
1. Retrieve OTP from Redis
2. Verify OTP matches (constant-time comparison)
3. Check if OTP is expired
4. Check retry attempts (max 3 attempts)
5. Create or update user in PostgreSQL
6. Generate JWT access token (15 minutes)
7. Generate JWT refresh token (7 days)
8. Delete OTP from Redis
9. Store refresh token in Redis

**Server Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "phone": "+919876543210",
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

---

## JWT Token Structure

### Access Token (Short-lived: 15 minutes)

**Payload:**
```json
{
  "userId": "user_123",
  "phone": "+919876543210",
  "type": "access",
  "iat": 1642243800,
  "exp": 1642244700
}
```

**Usage:**
- Sent with every API request
- Used for WebSocket authentication
- Stored in memory (not localStorage)

---

### Refresh Token (Long-lived: 7 days)

**Payload:**
```json
{
  "userId": "user_123",
  "tokenId": "token_xyz789",
  "type": "refresh",
  "iat": 1642243800,
  "exp": 1642848600
}
```

**Usage:**
- Stored in httpOnly cookie
- Used to obtain new access tokens
- Can be revoked server-side

---

## Token Refresh Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│  Client │         │  Server │         │  Redis  │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     │  1. Refresh Token │                   │
     ├──────────────────>│                   │
     │                   │                   │
     │                   │  2. Verify Token  │
     │                   ├──────────────────>│
     │                   │                   │
     │                   │  3. Token Valid   │
     │                   │<──────────────────┤
     │                   │                   │
     │  4. New Tokens    │                   │
     │<──────────────────┤                   │
     │                   │                   │
```

**Endpoint:**
```http
POST /api/auth/refresh
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...
```

**Response:**
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

---

## Security Measures

### OTP Security
- **Hashing:** OTP stored as bcrypt hash
- **Expiration:** 5-minute TTL
- **Rate Limiting:** Max 3 OTP requests per 10 minutes
- **Retry Limit:** Max 3 verification attempts
- **Length:** 6 digits (1 million combinations)

### Token Security
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Secret Rotation:** Periodic secret key rotation
- **Refresh Token Rotation:** New refresh token on each use
- **Token Revocation:** Blacklist in Redis
- **httpOnly Cookies:** Prevents XSS attacks

### Additional Security
- **HTTPS Only:** All communication encrypted
- **CORS:** Restricted origins
- **Input Validation:** Phone number format validation
- **Brute Force Protection:** Account lockout after failed attempts

---

## Error Handling

### Common Error Responses

**Invalid Phone Number:**
```json
{
  "success": false,
  "error": "INVALID_PHONE",
  "message": "Please enter a valid phone number"
}
```

**Rate Limit Exceeded:**
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 10 minutes",
  "retryAfter": 600
}
```

**Invalid OTP:**
```json
{
  "success": false,
  "error": "INVALID_OTP",
  "message": "Invalid OTP. Please try again",
  "attemptsRemaining": 2
}
```

**Expired OTP:**
```json
{
  "success": false,
  "error": "OTP_EXPIRED",
  "message": "OTP has expired. Please request a new one"
}
```

---

## SMS Provider Integration

### Supported Providers
- **Twilio** (International)
- **MSG91** (India-focused)
- **AWS SNS** (Scalable)

### Configuration
```javascript
// config/sms.js
module.exports = {
  provider: process.env.SMS_PROVIDER || 'msg91',
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY,
    senderId: process.env.MSG91_SENDER_ID,
    route: '4' // Transactional
  }
};
```

---

## Best Practices

1. **Never log OTPs** - Security risk
2. **Use constant-time comparison** - Prevent timing attacks
3. **Implement rate limiting** - Prevent abuse
4. **Rotate secrets regularly** - Enhanced security
5. **Monitor failed attempts** - Detect attacks
6. **Use secure random generation** - Cryptographically secure OTPs

---

## Future Enhancements

- **Biometric authentication** - Fingerprint/Face ID
- **Email as backup** - Alternative verification
- **Social login** - Google/Apple Sign-In
- **2FA for sensitive actions** - Additional security layer

