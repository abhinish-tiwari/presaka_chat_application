# Preṣaka - Project Overview

## What is Preṣaka?

**Preṣaka (प्रेषक)** - meaning "The Messenger" in Sanskrit - is a modern, real-time chat application designed with an **India-first, global-ready** vision. It combines the simplicity of WhatsApp with the reliability of enterprise messaging platforms.

---

## Core Philosophy

> "Build the simplest thing that works — but design it so it can grow."

### Principles

1. **Simplicity First** - Start with essential features, add complexity only when needed
2. **India-First** - Designed for Indian users, optimized for Indian infrastructure
3. **Security by Design** - Security is not an afterthought
4. **Scale When Needed** - Don't over-engineer, but be ready to scale
5. **User Trust** - Reliability and privacy are paramount

---

## Why Preṣaka?

### Problem Statement

Existing messaging apps either:
- Lack privacy (data mining, ads)
- Are too complex (feature bloat)
- Don't work well in India (poor network handling)
- Require passwords (friction, security risk)

### Our Solution

Preṣaka offers:
- **Passwordless Authentication** - Phone + OTP only
- **Real-time Messaging** - Instant delivery with WebSocket
- **Offline Support** - Messages delivered when back online
- **Privacy Focused** - No ads, no data mining
- **India-Optimized** - Works on slow networks

---

## Target Audience

### Primary Users (Phase 1)
- **Age:** 18-45 years
- **Location:** India (Tier 1, 2, 3 cities)
- **Tech Savvy:** Moderate to high
- **Use Case:** Personal communication

### Secondary Users (Phase 2+)
- Small businesses
- Teams and organizations
- International users
- Enterprise customers

---

## Key Differentiators

| Feature | Preṣaka | WhatsApp | Telegram | Signal |
|---------|---------|----------|----------|--------|
| Phone-based Auth | ✅ | ✅ | ✅ | ✅ |
| No Password | ✅ | ✅ | ❌ | ❌ |
| E2E Encryption | 🚧 Phase 3 | ✅ | Optional | ✅ |
| Open Source | ✅ | ❌ | Partial | ✅ |
| India-First | ✅ | ❌ | ❌ | ❌ |
| No Ads | ✅ | ✅ | ✅ | ✅ |
| Self-Hostable | 🚧 Future | ❌ | ❌ | ❌ |

---

## Technical Architecture

### Technology Choices

**Frontend:**
- **React** - Component-based UI
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication

**Backend:**
- **Node.js + Express** - JavaScript everywhere
- **Socket.IO** - WebSocket with fallbacks
- **JWT** - Stateless authentication

**Database:**
- **PostgreSQL** - Reliable, ACID compliant
- **Redis** - High-speed caching

**Infrastructure:**
- **Nginx** - Reverse proxy
- **Docker** - Containerization
- **AWS/GCP** - Cloud hosting

### Why These Choices?

1. **JavaScript Everywhere** - Same language for frontend and backend
2. **Proven Technologies** - Battle-tested in production
3. **Developer Friendly** - Large community, good documentation
4. **Scalable** - Can grow from 100 to 100K+ users
5. **Cost Effective** - Open source, no licensing fees

---

## Architecture Patterns

### Phase 1: Monolith
```
Client → Load Balancer → Single Server → Database
                                       → Redis
```
- Simple to develop and deploy
- Easy to debug
- Cost-effective
- Suitable for MVP

### Phase 2: Horizontal Scaling
```
Client → Load Balancer → Server 1 ┐
                       → Server 2 ├→ Database (Primary + Replica)
                       → Server 3 ┘→ Redis Cluster
```
- Multiple server instances
- Load distribution
- High availability
- Suitable for growth phase

### Phase 3: Microservices
```
Client → API Gateway → Auth Service → Auth DB
                    → Chat Service → Chat DB
                    → Presence Service → Redis
                    → Notification Service
```
- Service isolation
- Independent scaling
- Technology flexibility
- Suitable for scale

---

## Development Approach

### Agile Methodology

- **Sprints:** 2-week cycles
- **Daily Standups:** 15-minute sync
- **Sprint Planning:** Define goals
- **Sprint Review:** Demo features
- **Retrospective:** Continuous improvement

### Version Control

- **Git Flow:** Feature branches, main branch
- **Code Review:** All PRs reviewed
- **CI/CD:** Automated testing and deployment

### Quality Assurance

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Critical paths
- **E2E Tests:** User journeys
- **Manual Testing:** Before each release

---

## Security Approach

### Defense in Depth

1. **Network Layer** - HTTPS, WSS, Firewall
2. **Application Layer** - Input validation, rate limiting
3. **Data Layer** - Encryption at rest, encrypted backups
4. **Authentication** - JWT, OTP, token rotation
5. **Monitoring** - Logging, alerting, audit trails

### Compliance

- **GDPR** - User data rights
- **IT Act 2000** - Indian regulations
- **Data Localization** - Store Indian user data in India

---

## Business Model

### Phase 1: Free (MVP)
- Build user base
- Gather feedback
- Prove concept

### Phase 2: Freemium
- Free tier: Basic features
- Premium tier: Advanced features
  - Larger file uploads
  - Extended message history
  - Custom themes
  - Priority support

### Phase 3: Enterprise
- Business accounts
- Team management
- Advanced analytics
- SLA guarantees
- Dedicated support

---

## Success Metrics

### Technical Metrics
- **Uptime:** 99.9%+
- **Message Delivery:** < 200ms
- **Error Rate:** < 1%
- **API Response Time:** < 100ms

### Business Metrics
- **User Growth:** 20% MoM
- **User Retention:** 60%+ (30-day)
- **Daily Active Users:** 40%+ of total
- **Messages per User:** 50+ per day

### User Satisfaction
- **NPS Score:** 50+
- **App Store Rating:** 4.5+
- **Support Response:** < 2 hours

---

## Risk Management

### Technical Risks
- **Scalability Issues** - Mitigation: Load testing, gradual rollout
- **Security Breaches** - Mitigation: Security audits, bug bounty
- **Data Loss** - Mitigation: Regular backups, replication

### Business Risks
- **Competition** - Mitigation: Unique features, better UX
- **User Acquisition** - Mitigation: Marketing, referrals
- **Monetization** - Mitigation: Multiple revenue streams

---

## Team Structure

### Current (MVP Phase)
- 1 Full-stack Developer
- 1 UI/UX Designer (part-time)
- 1 DevOps Engineer (part-time)

### Future (Growth Phase)
- 2 Frontend Developers
- 2 Backend Developers
- 1 Mobile Developer
- 1 DevOps Engineer
- 1 Product Manager
- 1 QA Engineer

---

## Timeline

**Q1 2024:** MVP Development
**Q2 2024:** Alpha Testing, Feedback
**Q3 2024:** Beta Launch, Mobile Apps
**Q4 2024:** Public Launch, Marketing
**2025:** Scale, Enterprise Features

---

## Resources

- **Documentation:** [docs/](.)
- **API Docs:** [API.md](API.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Contributing:** [../CONTRIBUTING.md](../CONTRIBUTING.md)

---

## Contact

- **Website:** presaka.app
- **Email:** hello@presaka.app
- **GitHub:** github.com/your-org/presaka
- **Twitter:** @presakaapp

---

**Preṣaka** — Messages. Delivered. 🚀

