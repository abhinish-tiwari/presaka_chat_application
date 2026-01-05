# Preṣaka (प्रेषक)

### *The Trusted Messenger*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org/)

Preṣaka is a modern, real-time chat application built with an **India-first, global-ready** vision. It uses **phone number + OTP authentication**, focuses on **speed, security, and simplicity**, and is designed the way **real startups build scalable products**.

---

## 📌 Quick Links

- [Vision & Philosophy](#vision--philosophy)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🎯 Vision & Philosophy

> "Build the simplest thing that works — but design it so it can grow."

- **India-first, then global** - Designed for Indian users with global scalability
- **Phone-based identity** - No passwords, just your phone number
- **Minimal UI, maximum reliability** - Clean, fast, and dependable
- **Scale only when needed** - Start simple, grow smart

---

## ✨ Key Features

### MVP Features (Phase 1)

- 📱 **Phone number login with OTP** - Secure, passwordless authentication
- ⚡ **Real-time 1-to-1 chat** - Instant message delivery
- 🟢 **Online / Offline presence** - Know when your contacts are available
- 📜 **Message history** - Never lose your conversations
- 🔁 **Automatic reconnect** - Seamless experience even with network issues

### Advanced Features (Phase 2)

- ✔ **Delivery & read receipts** - Know when messages are delivered and read
- ✍️ **Typing indicators** - See when someone is typing
- 🔄 **Token refresh** - Secure session management
- 🔔 **Push notifications** - Stay updated even when offline

### Future Features (Phase 3+)

- 👥 **Group chats** - Connect with multiple people
- 🔐 **End-to-End Encryption (E2EE)** - Military-grade security
- 📞 **Voice & video calls** - Complete communication suite
- 🤖 **AI-powered features** - Smart replies, translations
- 🧑‍💼 **Business accounts** - Professional communication tools

---

## 🛠 Tech Stack

### Frontend
- **React** / React Native - Modern UI framework
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool

### Backend
- **Node.js + Express** - Robust server framework
- **Socket.IO** - WebSocket implementation
- **JWT** - Secure authentication

### Data Layer
- **PostgreSQL** - Reliable relational database (users, chats, messages)
- **Redis** - High-speed cache (OTP, presence, sessions)

### Infrastructure
- **Nginx** - Reverse proxy & load balancing
- **Docker** - Containerization
- **Kubernetes** - Orchestration (future)

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6.0
- npm or yarn

### Quick Setup (Recommended)

**Windows:**
```cmd
# Clone the repository
git clone https://github.com/your-org/presaka.git
cd presaka

# Run automated setup script
.\scripts\setup.bat
```

**Linux/macOS:**
```bash
# Clone the repository
git clone https://github.com/your-org/presaka.git
cd presaka

# Make scripts executable
chmod +x scripts/*.sh

# Run automated setup script
./scripts/setup.sh
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/your-org/presaka.git
cd presaka

# Install dependencies for backend
cd backend
npm install

# Install dependencies for frontend
cd ../frontend
npm install
```

### Database Setup

```bash
# Create PostgreSQL database
createdb presaka

# Run database schema
psql -d presaka -f backend/src/database/schema.sql
```

### Configuration

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration (database, Redis, JWT secrets, SMS provider)

# Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env with API and WebSocket URLs (default values work for local development)
```

### Running Locally

**Quick Start (Windows):**
```cmd
# Start both servers at once
.\scripts\start-all.bat
```

**Quick Start (Linux/macOS):**
```bash
# Start both servers at once
./scripts/start-all.sh
```

**Manual Start:**
```bash
# Terminal 1 - Start Redis
redis-server

# Terminal 2 - Start PostgreSQL (if not running as service)
# PostgreSQL should be running on port 5432

# Terminal 3 - Start Backend
cd backend
npm run dev
# Backend will run on http://localhost:5000

# Terminal 4 - Start Frontend
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

Visit `http://localhost:5173` to see the application.

**Note:** In development mode, OTP codes are logged to the backend console instead of being sent via SMS.

### Useful Scripts

All scripts are located in the `scripts/` folder:

- **`setup.bat/sh`** - Complete project setup
- **`start-all.bat/sh`** - Start both servers
- **`start-backend.bat`** - Start backend only
- **`start-frontend.bat`** - Start frontend only
- **`clean.bat/sh`** - Clean and reinstall dependencies
- **`db-reset.bat/sh`** - Reset database with fresh schema

See [scripts/README.md](scripts/README.md) for detailed documentation.

---

## 📚 Documentation

### Quick Links
- **[Documentation Index](docs/README.md)** - Complete documentation overview
- **[Quick Start Guide](docs/setup/QUICK_START.md)** - Detailed setup instructions
- **[Scripts Documentation](scripts/README.md)** - All available scripts

### By Category
- **Setup & Deployment**
  - [Quick Start](docs/setup/QUICK_START.md)
  - [Deployment Guide](docs/setup/DEPLOYMENT.md)
  - [SMS Setup](docs/setup/SMS_SETUP_GUIDE.md)

- **API & Integration**
  - [REST API](docs/api/API.md)
  - [WebSocket Events](docs/api/WEBSOCKET.md)
  - [Authentication Flow](docs/api/AUTHENTICATION.md)

- **Architecture & Design**
  - [System Architecture](docs/architecture/ARCHITECTURE.md)
  - [Database Schema](docs/architecture/DATABASE.md)
  - [Security Practices](docs/architecture/SECURITY.md)
  - [Technical Specification](docs/architecture/TECHNICAL_SPEC.md)

- **Features & Planning**
  - [Feature Roadmap](docs/features/REMAINING_FEATURES.md)
  - [Technical Improvements](docs/features/TECHNICAL_IMPROVEMENTS.md)
  - [Product Roadmap](docs/guides/ROADMAP.md)

- **Contributing**
  - [Contributing Guide](CONTRIBUTING.md)

---

## 🎨 Branding & Identity

**Name:** Preṣaka (प्रेषक)

**Meaning:** The messenger (Sanskrit)

**Tagline:** *Messages. Delivered.*

**Colors:** Indigo primary / Saffron accents

**Domain:** presaka.app / presaka.in

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Preṣaka** — built with trust, rooted in culture, ready for scale 🚀

