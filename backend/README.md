# Preṣaka Backend

Backend server for Preṣaka messaging application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`

4. Setup PostgreSQL database:
```bash
# Create database
createdb presaka

# Run schema
psql -d presaka -f src/database/schema.sql
```

5. Start Redis server:
```bash
redis-server
```

6. Start development server:
```bash
npm run dev
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── controllers/     # Request handlers
│   ├── database/        # Database schema
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── socket/          # WebSocket handlers
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── uploads/             # File uploads
├── logs/                # Application logs
├── .env.example         # Environment variables template
└── package.json         # Dependencies
```

## API Endpoints

See [API Documentation](../docs/API.md) for complete API reference.

## WebSocket Events

See [WebSocket Documentation](../docs/WEBSOCKET.md) for WebSocket events.

