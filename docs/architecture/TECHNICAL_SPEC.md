# Technical Specification

## Document Information

- **Project:** Preṣaka (प्रेषक)
- **Version:** 1.0.0
- **Last Updated:** January 2024
- **Status:** In Development

---

## System Requirements

### Client Requirements

**Web Application:**
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- WebSocket support
- LocalStorage support
- Minimum screen resolution: 320x568 (mobile)

**Mobile Application (Future):**
- iOS 13+ / Android 8+
- 50MB free storage
- Internet connection (WiFi or cellular)

### Server Requirements

**Development:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- OS: Linux/macOS/Windows

**Production (MVP):**
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD
- OS: Ubuntu 22.04 LTS
- Network: 100 Mbps

**Production (Scale):**
- CPU: 8+ cores
- RAM: 16GB+
- Storage: 500GB+ SSD
- OS: Ubuntu 22.04 LTS
- Network: 1 Gbps

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI Framework |
| Vite | 5.0+ | Build Tool |
| Tailwind CSS | 3.3+ | Styling |
| Socket.IO Client | 4.6+ | WebSocket |
| React Router | 6.20+ | Routing |
| Zustand | 4.4+ | State Management |
| Axios | 1.6+ | HTTP Client |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.17+ | Runtime |
| Express | 4.18+ | Web Framework |
| Socket.IO | 4.6+ | WebSocket Server |
| PostgreSQL | 14+ | Database |
| Redis | 6.0+ | Cache/Session |
| JWT | 9.0+ | Authentication |
| Bcrypt | 5.1+ | Password Hashing |

### DevOps

| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | 24.0+ | Containerization |
| Nginx | 1.24+ | Reverse Proxy |
| PM2 | 5.3+ | Process Manager |
| GitHub Actions | - | CI/CD |

---

## API Specifications

### REST API

**Base URL:** `https://api.presaka.app/api`

**Authentication:** Bearer Token (JWT)

**Content Type:** `application/json`

**Rate Limiting:**
- 100 requests/minute per user
- 1000 requests/hour per IP

**Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/request-otp | No | Request OTP |
| POST | /auth/verify-otp | No | Verify OTP |
| POST | /auth/refresh | No | Refresh token |
| POST | /auth/logout | Yes | Logout |
| GET | /users/me | Yes | Get current user |
| PATCH | /users/me | Yes | Update profile |
| GET | /users/search | Yes | Search users |
| GET | /chats | Yes | Get all chats |
| POST | /chats/private | Yes | Create private chat |
| GET | /chats/:id | Yes | Get chat details |
| GET | /chats/:id/messages | Yes | Get messages |

---

### WebSocket API

**URL:** `wss://api.presaka.app`

**Authentication:** JWT in handshake

**Events:**

| Event | Direction | Description |
|-------|-----------|-------------|
| connect | Server→Client | Connection established |
| disconnect | Server→Client | Connection closed |
| message:send | Client→Server | Send message |
| message:receive | Server→Client | Receive message |
| message:delivered | Client→Server | Mark delivered |
| message:read | Client→Server | Mark read |
| message:status | Server→Client | Status update |
| typing:start | Client→Server | Start typing |
| typing:stop | Client→Server | Stop typing |
| user:typing | Server→Client | User typing |
| user:online | Server→Client | User online |
| user:offline | Server→Client | User offline |

---

## Database Schema

### PostgreSQL Tables

**users**
```sql
id              UUID PRIMARY KEY
phone           VARCHAR(15) UNIQUE NOT NULL
name            VARCHAR(100)
avatar_url      TEXT
bio             TEXT
is_verified     BOOLEAN DEFAULT false
last_seen       TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

**chats**
```sql
id              UUID PRIMARY KEY
type            VARCHAR(20) NOT NULL
name            VARCHAR(100)
avatar_url      TEXT
created_by      UUID REFERENCES users(id)
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

**chat_members**
```sql
id              UUID PRIMARY KEY
chat_id         UUID REFERENCES chats(id)
user_id         UUID REFERENCES users(id)
role            VARCHAR(20) DEFAULT 'member'
joined_at       TIMESTAMP DEFAULT NOW()
left_at         TIMESTAMP
```

**messages**
```sql
id              UUID PRIMARY KEY
chat_id         UUID REFERENCES chats(id)
sender_id       UUID REFERENCES users(id)
content         TEXT NOT NULL
type            VARCHAR(20) DEFAULT 'text'
status          VARCHAR(20) DEFAULT 'sent'
reply_to        UUID REFERENCES messages(id)
metadata        JSONB
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
deleted_at      TIMESTAMP
```

### Redis Keys

```
otp:{phone}                    - OTP data (TTL: 5 min)
presence:{userId}              - User presence (TTL: 1 hour)
socket:{userId}                - Socket IDs
typing:{chatId}:{userId}       - Typing status (TTL: 5 sec)
ratelimit:otp:{phone}          - OTP rate limit (TTL: 10 min)
refresh:{tokenId}              - Refresh token (TTL: 7 days)
blacklist:{tokenId}            - Revoked tokens (TTL: 7 days)
```

---

## Security Specifications

### Authentication

**OTP:**
- Length: 6 digits
- Expiry: 5 minutes
- Max attempts: 3
- Rate limit: 3 requests/10 minutes

**JWT:**
- Algorithm: HS256
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Token rotation: On each refresh

### Encryption

**In Transit:**
- TLS 1.3
- HTTPS for REST API
- WSS for WebSocket

**At Rest:**
- PostgreSQL: TDE (Transparent Data Encryption)
- Redis: Encryption enabled
- Backups: AES-256 encryption

### Input Validation

**Phone Number:**
- Format: E.164 (+[country][number])
- Regex: `^\+[1-9]\d{1,14}$`

**Message Content:**
- Max length: 10,000 characters
- HTML sanitization
- XSS prevention

---

## Performance Specifications

### Response Times

| Operation | Target | Maximum |
|-----------|--------|---------|
| API Request | < 100ms | 500ms |
| Message Delivery | < 200ms | 1s |
| Database Query | < 50ms | 200ms |
| Page Load | < 2s | 5s |

### Throughput

| Metric | MVP | Scale |
|--------|-----|-------|
| Concurrent Users | 1,000 | 100,000 |
| Messages/Second | 100 | 10,000 |
| API Requests/Second | 500 | 50,000 |
| WebSocket Connections | 1,000 | 100,000 |

### Availability

- **Uptime:** 99.9% (MVP), 99.99% (Scale)
- **RTO:** 1 hour (Recovery Time Objective)
- **RPO:** 15 minutes (Recovery Point Objective)

---

## Scalability Specifications

### Horizontal Scaling

**Application Servers:**
- Stateless design
- Load balancer distribution
- Auto-scaling based on CPU/memory

**Database:**
- Primary-replica setup
- Read replicas for queries
- Connection pooling

**Redis:**
- Redis Cluster for high availability
- Socket.IO Redis adapter
- Pub/Sub for cross-server communication

---

## Monitoring & Logging

### Metrics

**Application:**
- Request rate
- Error rate
- Response time
- Active connections

**Infrastructure:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

### Logging Levels

- **ERROR:** Critical issues
- **WARN:** Warning conditions
- **INFO:** Informational messages
- **DEBUG:** Debug information (dev only)

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "api",
  "message": "User logged in",
  "userId": "user_123",
  "ip": "192.168.1.1"
}
```

---

## Testing Specifications

### Test Coverage

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Critical paths
- **E2E Tests:** User journeys
- **Load Tests:** 2x expected load

### Test Types

**Unit Tests:**
- Individual functions
- Component rendering
- Utility functions

**Integration Tests:**
- API endpoints
- Database operations
- WebSocket events

**E2E Tests:**
- User registration
- Message sending
- Chat creation

---

## Deployment Specifications

### Environments

**Development:**
- Local development
- Hot reload enabled
- Debug logging

**Staging:**
- Production-like environment
- Testing before release
- Limited access

**Production:**
- Live environment
- Optimized builds
- Error logging only

### Deployment Process

1. Code review and approval
2. Automated tests pass
3. Build and package
4. Deploy to staging
5. Smoke tests
6. Deploy to production
7. Monitor for issues

---

## Compliance & Standards

- **GDPR:** User data privacy
- **IT Act 2000:** Indian regulations
- **WCAG 2.1:** Accessibility (Level AA)
- **REST API:** RESTful principles
- **Semantic Versioning:** Version numbering

---

## Future Considerations

- GraphQL API
- gRPC for microservices
- Message queue (Kafka/RabbitMQ)
- CDN integration
- Multi-region deployment
- Edge computing

---

*This is a living document and will be updated as the project evolves.*

