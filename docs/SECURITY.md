# Security Practices

## Overview

Security is a top priority for Preṣaka. This document outlines all security measures implemented in the application.

---

## Authentication Security

### 1. Phone Number + OTP

**Benefits:**
- No password to steal or crack
- Familiar to users
- Reduces phishing risk

**Implementation:**
- OTP length: 6 digits (1,000,000 combinations)
- OTP expiry: 5 minutes
- OTP stored as bcrypt hash (cost factor: 10)
- Constant-time comparison to prevent timing attacks

```javascript
// Secure OTP verification
const isValid = await bcrypt.compare(userOTP, storedHash);
```

---

### 2. JWT Tokens

**Access Token:**
- Lifetime: 15 minutes
- Algorithm: HS256 (HMAC-SHA256)
- Stored in memory (not localStorage)
- Contains minimal claims

**Refresh Token:**
- Lifetime: 7 days
- Stored in httpOnly cookie
- Rotated on each use
- Can be revoked server-side

**Token Structure:**
```javascript
{
  "userId": "user_123",
  "type": "access",
  "iat": 1642243800,
  "exp": 1642244700
}
```

---

### 3. Token Security Measures

**Secret Key Management:**
```javascript
// Use strong, random secret
const JWT_SECRET = process.env.JWT_SECRET; // 256-bit random string
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Rotate secrets periodically (every 90 days)
```

**Token Validation:**
```javascript
// Verify signature
jwt.verify(token, JWT_SECRET);

// Check expiration
if (decoded.exp < Date.now() / 1000) {
  throw new Error('Token expired');
}

// Check token type
if (decoded.type !== 'access') {
  throw new Error('Invalid token type');
}
```

---

## Rate Limiting

### 1. OTP Request Limiting

**Rules:**
- Max 3 OTP requests per 10 minutes per phone number
- Max 3 verification attempts per OTP
- Account lockout after 5 failed attempts in 1 hour

**Implementation:**
```javascript
const key = `ratelimit:otp:${phone}`;
const count = await redis.incr(key);

if (count === 1) {
  await redis.expire(key, 600); // 10 minutes
}

if (count > 3) {
  throw new Error('Rate limit exceeded');
}
```

---

### 2. API Rate Limiting

**Rules:**
- 100 requests per minute per user
- 30 messages per minute per user
- 1000 requests per hour per IP

**Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests'
});

app.use('/api/', apiLimiter);
```

---

### 3. WebSocket Rate Limiting

**Rules:**
- Max 10 events per second per socket
- Max 30 messages per minute per user

**Implementation:**
```javascript
const socketRateLimiter = new Map();

socket.on('message:send', async (data) => {
  const key = `socket:${socket.userId}`;
  const count = socketRateLimiter.get(key) || 0;
  
  if (count > 10) {
    socket.emit('error', { code: 'RATE_LIMIT' });
    return;
  }
  
  socketRateLimiter.set(key, count + 1);
  setTimeout(() => socketRateLimiter.delete(key), 1000);
});
```

---

## Input Validation

### 1. Phone Number Validation

```javascript
const phoneRegex = /^\+[1-9]\d{1,14}$/; // E.164 format

function validatePhone(phone) {
  if (!phoneRegex.test(phone)) {
    throw new Error('Invalid phone number');
  }
  return phone;
}
```

---

### 2. Message Content Validation

```javascript
function validateMessage(content) {
  // Max length
  if (content.length > 10000) {
    throw new Error('Message too long');
  }
  
  // Sanitize HTML
  const sanitized = DOMPurify.sanitize(content);
  
  // Check for malicious patterns
  if (containsMaliciousContent(sanitized)) {
    throw new Error('Invalid content');
  }
  
  return sanitized;
}
```

---

### 3. Request Validation

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/auth/verify-otp',
  body('phone').matches(/^\+[1-9]\d{1,14}$/),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

---

## SQL Injection Prevention

### 1. Parameterized Queries

**Always use parameterized queries:**
```javascript
// ✅ GOOD - Parameterized query
const result = await db.query(
  'SELECT * FROM users WHERE phone = $1',
  [phone]
);

// ❌ BAD - String concatenation
const result = await db.query(
  `SELECT * FROM users WHERE phone = '${phone}'`
);
```

---

### 2. ORM Usage

```javascript
// Using an ORM like Sequelize
const user = await User.findOne({
  where: { phone: phone }
});
```

---

## XSS Prevention

### 1. Content Security Policy

```javascript
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "wss:", "https:"]
  }
}));
```

---

### 2. Output Encoding

```javascript
// Sanitize user input before rendering
import DOMPurify from 'dompurify';

const cleanContent = DOMPurify.sanitize(userInput);
```

---

### 3. httpOnly Cookies

```javascript
res.cookie('refreshToken', token, {
  httpOnly: true,  // Prevents JavaScript access
  secure: true,    // HTTPS only
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

---

## CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## HTTPS/TLS

### 1. Force HTTPS

```javascript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

### 2. HSTS Header

```javascript
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true
}));
```

---

## Data Encryption

### 1. Data at Rest

**Database Encryption:**
- PostgreSQL: Transparent Data Encryption (TDE)
- Redis: Encryption at rest enabled

---

### 2. Data in Transit

**All communication encrypted:**
- HTTPS for REST API
- WSS (WebSocket Secure) for real-time communication
- TLS 1.3 minimum

---

### 3. Sensitive Data Hashing

```javascript
const bcrypt = require('bcrypt');

// Hash OTP before storing
const hashedOTP = await bcrypt.hash(otp, 10);

// Hash sensitive user data
const hashedPhone = crypto
  .createHash('sha256')
  .update(phone)
  .digest('hex');
```

---

## Session Management

### 1. Session Security

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

---

### 2. Token Revocation

```javascript
// Blacklist tokens in Redis
async function revokeToken(tokenId) {
  await redis.set(
    `blacklist:${tokenId}`,
    '1',
    'EX',
    7 * 24 * 60 * 60 // 7 days
  );
}

// Check if token is revoked
async function isTokenRevoked(tokenId) {
  const revoked = await redis.get(`blacklist:${tokenId}`);
  return revoked === '1';
}
```

---

## File Upload Security

### 1. File Validation

```javascript
const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
    } else {
      cb(null, true);
    }
  }
});
```

---

### 2. File Storage

```javascript
// Store files with random names
const filename = `${uuid.v4()}.${ext}`;

// Store in separate domain (CDN)
const url = `https://cdn.presaka.app/uploads/${filename}`;
```

---

## Logging & Monitoring

### 1. Security Logging

```javascript
// Log security events
logger.warn('Failed login attempt', {
  phone: phone,
  ip: req.ip,
  timestamp: new Date()
});

// Log suspicious activity
logger.error('Rate limit exceeded', {
  userId: userId,
  endpoint: req.path,
  ip: req.ip
});
```

---

### 2. Audit Trail

```javascript
// Track important actions
await db.query(
  'INSERT INTO audit_log (user_id, action, ip, timestamp) VALUES ($1, $2, $3, $4)',
  [userId, 'LOGIN', req.ip, new Date()]
);
```

---

## Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());
```

---

## Dependency Security

### 1. Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

---

### 2. Automated Scanning

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Snyk
        uses: snyk/actions/node@master
```

---

## Incident Response

### 1. Security Breach Protocol

1. **Detect:** Monitor logs and alerts
2. **Contain:** Isolate affected systems
3. **Investigate:** Determine scope and impact
4. **Remediate:** Fix vulnerabilities
5. **Notify:** Inform affected users
6. **Review:** Post-mortem analysis

---

### 2. Emergency Contacts

- Security Team: security@presaka.app
- On-call Engineer: +91-XXXX-XXXX-XX

---

## Compliance

- **GDPR:** User data privacy and right to deletion
- **IT Act 2000:** Indian data protection laws
- **PCI DSS:** If payment processing is added

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] JWT secrets rotated
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CORS configured
- [ ] Security headers set
- [ ] Dependencies updated
- [ ] Logging enabled
- [ ] Backups configured
- [ ] Incident response plan

