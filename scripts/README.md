# 🛠️ Preṣaka Scripts

This folder contains all utility scripts for setting up, running, and managing the Preṣaka application.

---

## 📋 Available Scripts

### Setup Scripts

#### `setup.bat` (Windows)
Complete setup script for Windows that:
- ✅ Checks Node.js installation
- ✅ Installs backend dependencies
- ✅ Installs frontend dependencies
- ✅ Creates environment files from examples
- ✅ Provides next steps guidance

**Usage:**
```cmd
.\scripts\setup.bat
```

#### `setup.sh` (Linux/macOS)
Complete setup script for Unix-based systems that:
- ✅ Checks Node.js, PostgreSQL, and Redis
- ✅ Installs backend dependencies
- ✅ Installs frontend dependencies
- ✅ Creates environment files from examples
- ✅ Optionally creates database and runs schema
- ✅ Provides colored output for better readability

**Usage:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

---

### Start Scripts

#### `start-backend.bat` (Windows)
Starts the backend development server.

**Usage:**
```cmd
.\scripts\start-backend.bat
```

**What it does:**
- Navigates to `backend/` folder
- Runs `npm run dev`
- Starts server on `http://localhost:5000`

#### `start-frontend.bat` (Windows)
Starts the frontend development server.

**Usage:**
```cmd
.\scripts\start-frontend.bat
```

**What it does:**
- Navigates to `frontend/` folder
- Runs `npm run dev`
- Starts server on `http://localhost:5173`

#### `start-all.bat` (Windows)
Starts both backend and frontend servers in separate windows.

**Usage:**
```cmd
.\scripts\start-all.bat
```

**What it does:**
- Opens new window for backend server
- Opens new window for frontend server
- Both servers run simultaneously

#### `start-all.sh` (Linux/macOS)
Starts both backend and frontend servers using tmux (or background processes).

**Usage:**
```bash
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

**What it does:**
- Creates tmux session with both servers (if tmux installed)
- Or runs both servers in background
- Provides easy management commands

---

### Maintenance Scripts

#### `clean.bat` (Windows)
Removes all node_modules and reinstalls dependencies.

**Usage:**
```cmd
.\scripts\clean.bat
```

**What it does:**
- Removes `backend/node_modules`
- Removes `frontend/node_modules`
- Removes package-lock.json files
- Reinstalls all dependencies

**When to use:**
- After pulling major updates
- When experiencing dependency issues
- When switching Node.js versions

#### `clean.sh` (Linux/macOS)
Removes all node_modules and reinstalls dependencies.

**Usage:**
```bash
chmod +x scripts/clean.sh
./scripts/clean.sh
```

#### `db-reset.bat` (Windows)
Drops and recreates the database with fresh schema.

**Usage:**
```cmd
.\scripts\db-reset.bat
```

**What it does:**
- Drops existing database
- Creates new database
- Runs schema.sql

**⚠️ WARNING:** This deletes all data!

#### `db-reset.sh` (Linux/macOS)
Drops and recreates the database with fresh schema.

**Usage:**
```bash
chmod +x scripts/db-reset.sh
./scripts/db-reset.sh
```

**⚠️ WARNING:** This deletes all data!

---

## 🚀 Quick Start Guide

### First Time Setup

**Windows:**
```cmd
# 1. Run setup script
.\scripts\setup.bat

# 2. Edit environment files
notepad backend\.env

# 3. Start PostgreSQL and Redis
# (Use your preferred method)

# 4. Create database
createdb presaka
psql -d presaka -f backend\src\database\schema.sql

# 5. Start backend (in one terminal)
.\scripts\start-backend.bat

# 6. Start frontend (in another terminal)
.\scripts\start-frontend.bat
```

**Linux/macOS:**
```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Run setup script
./scripts/setup.sh

# 3. Edit environment files
nano backend/.env

# 4. Start backend (in one terminal)
cd backend && npm run dev

# 5. Start frontend (in another terminal)
cd frontend && npm run dev
```

---

## 📁 Script Organization

```
scripts/
├── README.md                   # This file
│
├── setup.bat                   # Windows setup script
├── setup.sh                    # Unix setup script
│
├── start-backend.bat           # Windows backend starter
├── start-frontend.bat          # Windows frontend starter
├── start-all.bat               # Windows - start both servers
├── start-all.sh                # Unix - start both servers
│
├── clean.bat                   # Windows - clean and reinstall
├── clean.sh                    # Unix - clean and reinstall
│
├── db-reset.bat                # Windows - reset database
└── db-reset.sh                 # Unix - reset database
```

---

## 🔧 Prerequisites

Before running any scripts, ensure you have:

### Required
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Redis 7+** - [Download](https://redis.io/download/)

### Optional (for SMS)
- **Twilio Account** - [Sign up](https://www.twilio.com/try-twilio)

---

## 📝 Environment Variables

The setup scripts create `.env` files from `.env.example` templates. You need to configure:

### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/presaka

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

---

## 🐛 Troubleshooting

### Setup Script Issues

**"Node.js is not installed"**
- Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation

**"Failed to install dependencies"**
- Check your internet connection
- Try running `npm cache clean --force`
- Delete `node_modules` and try again

**"Database connection failed"**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

**"Redis connection failed"**
- Ensure Redis is running
- Check Redis URL in `.env`
- Test connection: `redis-cli ping`

### Start Script Issues

**"Port already in use"**
- Backend (5000): Another process is using port 5000
- Frontend (5173): Another process is using port 5173
- Kill the process or change the port in configuration

**"Module not found"**
- Run `npm install` in the respective folder
- Or run the setup script again

---

## 💡 Tips

### Development Workflow
1. Keep backend and frontend running in separate terminals
2. Backend auto-reloads on file changes (nodemon)
3. Frontend auto-reloads on file changes (Vite HMR)
4. Check logs in `backend/logs/` for debugging

### Windows Users
- Use Windows Terminal or PowerShell for better experience
- Consider using WSL2 for Unix-like environment
- Git Bash also works well with `.sh` scripts

### Linux/macOS Users
- Make scripts executable: `chmod +x scripts/*.sh`
- Use `tmux` or `screen` for managing multiple terminals
- Consider using `pm2` for production deployments

---

## 🔗 Related Documentation

- [Quick Start Guide](../docs/setup/QUICK_START.md) - Detailed setup instructions
- [Deployment Guide](../docs/setup/DEPLOYMENT.md) - Production deployment
- [SMS Setup](../docs/setup/SMS_SETUP_GUIDE.md) - Configure SMS/OTP
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

---

**Need help?** Check the [main documentation](../docs/README.md) or open an issue on GitHub.

