# System Architecture

## Overview

Preṣaka follows a **client-server architecture** with real-time communication capabilities. The system is designed to be simple initially but scalable as the user base grows.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  Web Client  │              │ Mobile Client│            │
│  │   (React)    │              │(React Native)│            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
           │                              │
           │ REST API (Auth, History)     │
           │ WebSocket (Real-time Chat)   │
           ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Node.js + Express Server                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Auth Service │  │ Chat Service │  │Socket.IO    │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │                              │
           │                              │
           ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  PostgreSQL  │              │    Redis     │            │
│  │  (Persistent)│              │   (Cache)    │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Client Layer

#### Web Client (React + Vite)
- **Responsibilities:**
  - User interface rendering
  - Form validation
  - WebSocket connection management
  - Local state management
  - Optimistic UI updates

#### Mobile Client (React Native)
- **Responsibilities:**
  - Native mobile experience
  - Push notification handling
  - Background sync
  - Offline message queue

---

### 2. Application Layer

#### API Server (Node.js + Express)
- **REST Endpoints:**
  - `/api/auth/*` - Authentication endpoints
  - `/api/users/*` - User management
  - `/api/chats/*` - Chat history and metadata
  - `/api/messages/*` - Message retrieval

#### WebSocket Server (Socket.IO)
- **Real-time Events:**
  - Message sending/receiving
  - Typing indicators
  - Presence updates
  - Read receipts

#### Services

**Auth Service**
- Phone number validation
- OTP generation and verification
- JWT token management
- Session handling

**Chat Service**
- Message persistence
- Chat room management
- Message delivery tracking
- Offline message queuing

**Presence Service**
- Online/offline status
- Last seen tracking
- Socket connection mapping

---

### 3. Data Layer

#### PostgreSQL (Primary Database)
- **Purpose:** Persistent data storage
- **Stores:**
  - User profiles
  - Chat metadata
  - Message history
  - Relationships

#### Redis (Cache & Session Store)
- **Purpose:** High-speed temporary data
- **Stores:**
  - OTP codes (with TTL)
  - User presence status
  - Socket ID mappings
  - Rate limiting counters
  - Session tokens

---

## Communication Patterns

### REST API Flow
```
Client → HTTP Request → Express Router → Controller → Service → Database
                                                              ↓
Client ← HTTP Response ← Express Router ← Controller ← Service
```

### WebSocket Flow
```
Client → Socket Event → Socket.IO → Event Handler → Service → Database
                                                           ↓
Client ← Socket Event ← Socket.IO ← Event Handler ← Service
```

---

## Scalability Phases

### Phase 1: MVP (Single Server)
```
Load Balancer
     │
     ▼
Single Node.js Instance
     │
     ├─→ PostgreSQL
     └─→ Redis
```

**Characteristics:**
- Vertical scaling
- Simple deployment
- Cost-effective
- Suitable for 0-10K users

---

### Phase 2: Horizontal Scaling
```
Load Balancer
     │
     ├─→ Node.js Instance 1 ─┐
     ├─→ Node.js Instance 2 ─┼─→ PostgreSQL (Primary)
     └─→ Node.js Instance 3 ─┘       │
              │                       └─→ PostgreSQL (Replica)
              │
              └─→ Redis Cluster
```

**Characteristics:**
- Horizontal scaling
- Redis adapter for Socket.IO
- Database replication
- Suitable for 10K-100K users

---

### Phase 3: Microservices
```
API Gateway
     │
     ├─→ Auth Service ────→ Auth DB
     ├─→ Chat Service ────→ Chat DB
     ├─→ Presence Service ─→ Redis
     └─→ Notification Service
              │
              └─→ Message Queue (Kafka/RabbitMQ)
```

**Characteristics:**
- Service isolation
- Independent scaling
- Event-driven architecture
- Suitable for 100K+ users

---

## Security Architecture

### Network Security
- HTTPS/TLS encryption
- CORS configuration
- Rate limiting
- DDoS protection

### Application Security
- JWT authentication
- Input validation
- SQL injection prevention
- XSS protection

### Data Security
- Encrypted data at rest
- Encrypted data in transit
- Regular backups
- Access control

---

## Monitoring & Observability

### Metrics (Future)
- Request latency
- Error rates
- Active connections
- Message throughput

### Logging
- Application logs
- Error logs
- Audit logs
- Access logs

### Alerting
- Server health
- Database performance
- Error thresholds
- Security incidents

---

## Technology Decisions

| Requirement | Technology | Rationale |
|------------|------------|-----------|
| Real-time communication | Socket.IO | Easy to use, fallback support |
| Database | PostgreSQL | ACID compliance, reliability |
| Cache | Redis | Speed, pub/sub support |
| Authentication | JWT | Stateless, scalable |
| API Framework | Express | Mature, extensive ecosystem |

---

## Future Enhancements

1. **CDN Integration** - Static asset delivery
2. **Message Queue** - Asynchronous processing
3. **Service Mesh** - Inter-service communication
4. **GraphQL** - Flexible data fetching
5. **Edge Computing** - Reduced latency

