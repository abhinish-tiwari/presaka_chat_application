# Quick Start Guide

Get Preṣaka up and running in 10 minutes!

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/))
- **Redis** >= 6.0 ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))
- **Code Editor** (VS Code recommended)

---

## Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/presaka.git

# Navigate to project directory
cd presaka
```

---

## Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configure Environment Variables

Edit `backend/.env`:

```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/presaka

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# SMS Provider (for development, use console)
SMS_PROVIDER=console
```

### Setup Database

```bash
# Create database
createdb presaka

# Or using psql
psql -U postgres
CREATE DATABASE presaka;
\q

# Run migrations
npm run migrate
```

### Start Backend Server

```bash
npm run dev
```

You should see:
```
✓ Server running on http://localhost:3000
✓ Database connected
✓ Redis connected
```

---

## Step 3: Setup Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configure Environment Variables

Edit `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

### Start Frontend Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 4: Test the Application

1. **Open Browser:** Navigate to `http://localhost:5173`

2. **Test Authentication:**
   - Enter phone number: `+919876543210`
   - Click "Send OTP"
   - Check backend console for OTP (in development mode)
   - Enter OTP and verify

3. **Test Messaging:**
   - Open another browser window (incognito)
   - Login with different phone number
   - Send messages between users

---

## Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Useful Commands

**Backend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
npm run migrate      # Run database migrations
```

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run lint         # Run ESLint
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (backend)
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
# Windows
pg_ctl status

# Linux/Mac
sudo service postgresql status

# Start PostgreSQL
# Windows
pg_ctl start

# Linux/Mac
sudo service postgresql start
```

### Redis Connection Error

```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG

# Start Redis
# Windows
redis-server

# Linux/Mac
sudo service redis-server start
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **Read Documentation:**
   - [Architecture Overview](ARCHITECTURE.md)
   - [API Documentation](API.md)
   - [WebSocket Events](WEBSOCKET.md)

2. **Explore Codebase:**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`

3. **Make Changes:**
   - Follow [Contributing Guide](../CONTRIBUTING.md)
   - Create feature branch
   - Submit pull request

4. **Join Community:**
   - GitHub Discussions
   - Discord Server (coming soon)

---

## Common Development Tasks

### Add a New API Endpoint

```javascript
// backend/src/routes/example.js
router.post('/example', async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Create a New React Component

```javascript
// frontend/src/components/Example.jsx
export default function Example() {
  return (
    <div className="p-4">
      <h1>Example Component</h1>
    </div>
  );
}
```

### Add a Database Migration

```bash
# Create migration
npm run migrate create add-example-table

# Edit migration file
# migrations/XXXXXX_add_example_table.js

# Run migration
npm run migrate up
```

---

## Getting Help

- **Documentation:** Check [docs/](.) folder
- **Issues:** [GitHub Issues](https://github.com/your-org/presaka/issues)
- **Email:** dev@presaka.app

---

Happy coding! 🚀

