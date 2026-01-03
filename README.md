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

### Installation

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

### Configuration

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your configuration
```

### Running Locally

```bash
# Terminal 1 - Start Redis
redis-server

# Terminal 2 - Start PostgreSQL
# (or use your existing PostgreSQL service)

# Terminal 3 - Start Backend
cd backend
npm run dev

# Terminal 4 - Start Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the application.

---

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Authentication Flow](docs/AUTHENTICATION.md)
- [Database Schema](docs/DATABASE.md)
- [API Documentation](docs/API.md)
- [WebSocket Events](docs/WEBSOCKET.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Practices](docs/SECURITY.md)
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

