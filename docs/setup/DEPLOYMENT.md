# Deployment Guide

## Overview

This guide covers deploying Preṣaka to production environments. We'll cover multiple deployment strategies from simple to advanced.

---

## Prerequisites

- Domain name (presaka.app / presaka.in)
- SSL certificate (Let's Encrypt recommended)
- Cloud provider account (AWS, GCP, or DigitalOcean)
- PostgreSQL database
- Redis instance
- SMS provider account (MSG91, Twilio)

---

## Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=production
PORT=3000
API_URL=https://api.presaka.app

# Database
DATABASE_URL=postgresql://user:password@host:5432/presaka
REDIS_URL=redis://user:password@host:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-256-bits
JWT_REFRESH_SECRET=your-super-secret-refresh-key-256-bits
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SMS Provider (MSG91)
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your-msg91-auth-key
MSG91_SENDER_ID=PRESAK
MSG91_ROUTE=4

# File Upload
UPLOAD_MAX_SIZE=5242880
AWS_S3_BUCKET=presaka-uploads
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1

# CORS
ALLOWED_ORIGINS=https://presaka.app,https://www.presaka.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```bash
VITE_API_URL=https://api.presaka.app
VITE_WS_URL=wss://api.presaka.app
VITE_APP_NAME=Presaka
```

---

## Deployment Options

### Option 1: Simple VPS Deployment (DigitalOcean/Linode)

**Best for:** MVP, small scale (0-10K users)

#### 1. Server Setup

```bash
# Create droplet (Ubuntu 22.04 LTS)
# Recommended: 2 vCPU, 4GB RAM, 80GB SSD

# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Redis
apt install -y redis-server

# Install Nginx
apt install -y nginx

# Install PM2
npm install -g pm2
```

---

#### 2. Database Setup

```bash
# PostgreSQL
sudo -u postgres psql

CREATE DATABASE presaka;
CREATE USER presaka_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE presaka TO presaka_user;
\q

# Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

#### 3. Application Deployment

```bash
# Clone repository
cd /var/www
git clone https://github.com/your-org/presaka.git
cd presaka

# Backend setup
cd backend
npm install --production
cp .env.example .env
# Edit .env with production values

# Run migrations
npm run migrate

# Start with PM2
pm2 start npm --name "presaka-api" -- start
pm2 save
pm2 startup

# Frontend setup
cd ../frontend
npm install
npm run build
```

---

#### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/presaka

# API Server
server {
    listen 80;
    server_name api.presaka.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Frontend
server {
    listen 80;
    server_name presaka.app www.presaka.app;

    root /var/www/presaka/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/presaka /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

#### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificates
certbot --nginx -d presaka.app -d www.presaka.app -d api.presaka.app

# Auto-renewal
certbot renew --dry-run
```

---

### Option 2: Docker Deployment

**Best for:** Consistent environments, easy scaling

#### 1. Dockerfile (Backend)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

---

#### 2. Dockerfile (Frontend)

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

---

#### 3. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: presaka
      POSTGRES_USER: presaka_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://presaka_user:${DB_PASSWORD}@postgres:5432/presaka
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

```bash
# Deploy
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Option 3: Kubernetes Deployment

**Best for:** High scale, auto-scaling (100K+ users)

#### 1. Kubernetes Manifests

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: presaka-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: presaka-api
  template:
    metadata:
      labels:
        app: presaka-api
    spec:
      containers:
      - name: api
        image: presaka/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: presaka-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: presaka-secrets
              key: redis-url
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend && npm ci
        cd ../frontend && npm ci
    
    - name: Run tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
    
    - name: Build
      run: |
        cd frontend && npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/presaka
          git pull origin main
          cd backend && npm install --production
          pm2 restart presaka-api
          cd ../frontend && npm install && npm run build
```

---

## Monitoring & Logging

### 1. PM2 Monitoring

```bash
# View logs
pm2 logs presaka-api

# Monitor resources
pm2 monit

# Web dashboard
pm2 plus
```

---

### 2. Application Logging

```javascript
// Use Winston for logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Backup Strategy

### 1. Database Backups

```bash
# Automated daily backups
0 2 * * * pg_dump presaka > /backups/presaka_$(date +\%Y\%m\%d).sql

# Backup to S3
aws s3 cp /backups/presaka_$(date +\%Y\%m\%d).sql s3://presaka-backups/
```

---

### 2. Redis Backups

```bash
# Enable AOF persistence
redis-cli CONFIG SET appendonly yes

# Manual backup
redis-cli BGSAVE
```

---

## Scaling Checklist

- [ ] Load balancer configured
- [ ] Multiple backend instances
- [ ] Redis cluster for Socket.IO
- [ ] Database read replicas
- [ ] CDN for static assets
- [ ] Auto-scaling enabled
- [ ] Health checks configured
- [ ] Monitoring alerts set up

---

## Post-Deployment

1. **Test all endpoints**
2. **Verify WebSocket connections**
3. **Check SSL certificates**
4. **Monitor error logs**
5. **Test OTP delivery**
6. **Verify database connections**
7. **Check Redis connectivity**

---

## Rollback Plan

```bash
# Rollback to previous version
pm2 stop presaka-api
git checkout <previous-commit>
npm install
pm2 start presaka-api
```

---

## Support

For deployment issues, contact: devops@presaka.app

