# Preṣaka Backend (प्रेषक)

Backend API & real-time WebSocket server for the Preṣaka messaging platform.

Built with **Node.js (ES Modules)**, **Express 4.18**, **Socket.IO 4.6**, **PostgreSQL 14+**, and **Redis 6+**.

---

## 🛠 Tech Stack & Dependencies

- **Runtime**: Node.js (>= 18.0.0, ES Modules)
- **Web Framework**: Express.js with Helmet, CORS, and Compression
- **Real-Time Engine**: Socket.IO with connection heartbeats and room clustering
- **Primary Database**: PostgreSQL with connection pooling (`pg`) and UUID extension
- **In-Memory Cache**: Redis (`redis` v4.6) for OTP storage, session presence, and typing state
- **Security & Crypto**: `jsonwebtoken`, `bcryptjs`, `express-rate-limit`
- **Logging**: Winston logger with daily rotation and Morgan HTTP request streaming
- **Code Quality**: ESLint configured for Node ESM

---

## 🚀 Setup & Local Execution

### 1. Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6.0

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```
Ensure the following variables are configured in `.env`:
- `PORT` (default: `3000`)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `SMS_ENABLED` (`false` logs OTPs to terminal; `true` sends via MSG91/Twilio)

### 4. Database Setup & Migrations
```bash
# Create database
createdb presaka

# Apply base schema
psql -d presaka -f src/database/schema.sql

# Apply conversation actions migration (chat_clears, user_blocks)
psql -d presaka -f src/database/migrations/20260212_conversation_actions.sql
```

### 5. Running the Server
```bash
# Development mode (with nodemon auto-reload)
npm run dev

# Production start
npm start

# Run ESLint linter
npm run lint
```

---

## 📁 Project Directory Structure

```
backend/
├── src/
│   ├── config/              # PostgreSQL pool & Redis client connections
│   │   ├── database.js      # pg Pool initialization & query helpers
│   │   └── redis.js         # Redis client, get/set with expiry, and sets
│   ├── controllers/         # HTTP Route controllers
│   │   ├── auth.controller.js
│   │   ├── chat.controller.js
│   │   ├── message.controller.js
│   │   └── user.controller.js
│   ├── database/            # DDL schemas and database migrations
│   │   ├── migrations/      # Incremental SQL migration scripts
│   │   └── schema.sql       # Baseline table definitions and triggers
│   ├── middleware/          # Security, authentication, and validation
│   │   ├── auth.js          # JWT Bearer token authentication
│   │   ├── errorHandler.js  # Global error handler with operational codes
│   │   ├── rateLimiter.js   # IP-based rate limiting for OTP
│   │   └── validator.js     # express-validator request validation
│   ├── models/              # Database data access layer
│   │   ├── chat.model.js    # Chats, memberships, clears, blocks
│   │   ├── message.model.js # Messages, soft-delete, receipts, reactions
│   │   └── user.model.js    # Profiles, search, last_seen
│   ├── routes/              # Express API route declarations
│   │   ├── auth.routes.js
│   │   ├── chat.routes.js
│   │   ├── message.routes.js
│   │   └── user.routes.js
│   ├── services/            # Core business logic
│   │   ├── auth.service.js  # OTP generation, verification, and tokens
│   │   └── sms.service.js   # MSG91, Twilio, and console SMS transport
│   ├── socket/              # Real-time WebSocket engine
│   │   ├── handlers/        # Modular event handlers
│   │   │   ├── chatHandler.js
│   │   │   ├── messageHandler.js
│   │   │   └── presenceHandler.js
│   │   └── index.js         # Socket.IO setup and auth handshake
│   ├── utils/               # Helpers, loggers, and formatters
│   │   ├── caseConverter.js # snake_case <-> camelCase converter
│   │   ├── jwt.js           # JWT sign/verify
│   │   ├── logger.js        # Winston logging setup
│   │   └── otp.js           # OTP hashing & generation
│   └── server.js            # Server entry point & graceful shutdown
├── scripts/                 # Maintenance scripts (check-users.js, debug-chats.js)
├── .eslintrc.json           # ESLint configuration
├── .env.example             # Environment variables sample
└── package.json             # Manifest & dependencies
```

---

## 📡 Documentation References

- **REST API Reference**: [docs/api/API.md](../docs/api/API.md)
- **WebSocket Events Reference**: [docs/api/WEBSOCKET.md](../docs/api/WEBSOCKET.md)
- **Database Schema**: [docs/architecture/DATABASE.md](../docs/architecture/DATABASE.md)
- **System Architecture**: [docs/architecture/ARCHITECTURE.md](../docs/architecture/ARCHITECTURE.md)
