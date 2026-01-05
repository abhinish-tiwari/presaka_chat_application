# 🏗️ Architecture & Design Documentation

This folder contains all architecture, design, and technical specification documentation for Preṣaka.

---

## 📋 Contents

### System Architecture

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - High-level system design
  - System overview
  - Component architecture
  - Technology stack
  - Data flow diagrams
  - WebSocket architecture
  - Scalability considerations

### Database Design

- **[DATABASE.md](DATABASE.md)** - Database schema and design
  - PostgreSQL schema
  - Redis data structures
  - Relationships and indexes
  - Migration strategy
  - Query optimization

### Technical Specifications

- **[TECHNICAL_SPEC.md](TECHNICAL_SPEC.md)** - Detailed technical requirements
  - Functional requirements
  - Non-functional requirements
  - Performance requirements
  - API specifications
  - Technology choices

### Security

- **[SECURITY.md](SECURITY.md)** - Security measures and best practices
  - Authentication security
  - Data encryption
  - Input validation
  - Rate limiting
  - Security headers
  - Vulnerability prevention

---

## 🎯 Quick Navigation

### I want to...

**...understand the system architecture**  
→ Start with [ARCHITECTURE.md](ARCHITECTURE.md)

**...understand the database design**  
→ See [DATABASE.md](DATABASE.md)

**...review technical requirements**  
→ Check [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md)

**...review security measures**  
→ See [SECURITY.md](SECURITY.md)

---

## 🏛️ Architecture Overview

### High-Level Architecture

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│   (Port     │
│   5173)     │
└──────┬──────┘
       │
       │ HTTP/WebSocket
       │
┌──────▼──────┐
│   Backend   │ (Node.js + Express)
│   (Port     │
│   5000)     │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
┌──────▼──────┐ ┌───▼────┐
│ PostgreSQL  │ │ Redis  │
│ (Port 5432) │ │ (6379) │
└─────────────┘ └────────┘
```

### Technology Stack

**Frontend:**
- React 18+
- Vite
- Tailwind CSS
- Socket.IO Client
- Axios

**Backend:**
- Node.js 18+
- Express.js
- Socket.IO
- JWT Authentication
- Multer (file uploads)

**Database:**
- PostgreSQL 14+ (primary database)
- Redis 7+ (caching & sessions)

**DevOps:**
- Docker
- Docker Compose
- GitHub Actions (CI/CD)

---

## 📊 Key Design Decisions

### Why PostgreSQL?
- ACID compliance for message integrity
- Rich query capabilities
- JSON support for flexible data
- Excellent performance
- Strong community support

### Why Redis?
- Fast session storage
- Real-time presence tracking
- Pub/Sub for WebSocket scaling
- Caching layer

### Why Socket.IO?
- Automatic reconnection
- Fallback to HTTP long-polling
- Room-based messaging
- Easy to scale with Redis adapter

### Why JWT?
- Stateless authentication
- Easy to scale horizontally
- Standard format
- Secure when implemented correctly

---

## 🔒 Security Architecture

### Authentication Flow
1. User enters phone number
2. Server sends OTP via SMS
3. User enters OTP
4. Server verifies OTP
5. Server issues JWT token
6. Client stores token securely
7. Client sends token with each request

### Data Security
- Passwords hashed with bcrypt
- JWT tokens signed with secret
- HTTPS in production
- Input validation on all endpoints
- SQL injection prevention
- XSS prevention
- CSRF protection

---

## 📈 Scalability Considerations

### Current Architecture
- Single server deployment
- Suitable for 1,000-10,000 users
- Vertical scaling possible

### Future Scaling
- Horizontal scaling with load balancer
- Redis adapter for Socket.IO
- Database read replicas
- CDN for static assets
- Microservices architecture (if needed)

---

## 🔗 Related Documentation

- [API Documentation](../api/API.md) - API endpoints
- [Setup Guide](../setup/QUICK_START.md) - Development setup
- [Deployment Guide](../setup/DEPLOYMENT.md) - Production deployment
- [Technical Improvements](../features/TECHNICAL_IMPROVEMENTS.md) - Future enhancements

---

**Need help?** Check the [main documentation](../README.md) or open an issue on GitHub.

