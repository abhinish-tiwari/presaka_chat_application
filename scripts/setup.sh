#!/bin/bash

# Preṣaka Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 Preṣaka Setup Script"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js >= 18.0.0 from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be >= 18.0.0${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL command-line tools not found${NC}"
    echo "Please ensure PostgreSQL is installed and accessible"
else
    echo -e "${GREEN}✅ PostgreSQL found${NC}"
fi

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis command-line tools not found${NC}"
    echo "Please ensure Redis is installed and accessible"
else
    echo -e "${GREEN}✅ Redis found${NC}"
fi

echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Setup environment files
cd ..
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists, skipping${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env already exists, skipping${NC}"
fi

echo ""

# Database setup
echo "🗄️  Database setup..."
echo "Would you like to create the database now? (y/n)"
read -r CREATE_DB

if [ "$CREATE_DB" = "y" ] || [ "$CREATE_DB" = "Y" ]; then
    echo "Enter database name (default: presaka):"
    read -r DB_NAME
    DB_NAME=${DB_NAME:-presaka}
    
    echo "Creating database '$DB_NAME'..."
    createdb "$DB_NAME" 2>/dev/null || echo -e "${YELLOW}⚠️  Database may already exist${NC}"
    
    echo "Running database schema..."
    psql -d "$DB_NAME" -f backend/src/database/schema.sql
    echo -e "${GREEN}✅ Database schema created${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping database creation${NC}"
    echo "Run manually: createdb presaka && psql -d presaka -f backend/src/database/schema.sql"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Ensure PostgreSQL is running"
echo "3. Ensure Redis is running"
echo "4. Start the backend: cd backend && npm run dev"
echo "5. Start the frontend: cd frontend && npm run dev"
echo ""
echo "📚 For detailed instructions, see SETUP_GUIDE.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"

