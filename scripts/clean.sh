#!/bin/bash

# Clean all node_modules and reinstall dependencies

set -e

echo "🧹 Preṣaka Clean Script"
echo "======================="
echo ""
echo "This will remove all node_modules and package-lock.json files"
echo "and reinstall all dependencies."
echo ""
echo "⚠️  WARNING: This may take several minutes!"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Confirm
read -p "Are you sure you want to continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""

# Clean backend
echo "🧹 Cleaning backend..."
cd backend
if [ -d "node_modules" ]; then
    echo "Removing backend/node_modules..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "Removing backend/package-lock.json..."
    rm package-lock.json
fi
echo -e "${GREEN}✅ Backend cleaned${NC}"
echo ""

# Clean frontend
echo "🧹 Cleaning frontend..."
cd ../frontend
if [ -d "node_modules" ]; then
    echo "Removing frontend/node_modules..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "Removing frontend/package-lock.json..."
    rm package-lock.json
fi
echo -e "${GREEN}✅ Frontend cleaned${NC}"
echo ""

cd ..

# Reinstall backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Reinstall frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

cd ..

echo ""
echo -e "${GREEN}✨ Clean Complete!${NC}"
echo ""
echo "All dependencies have been reinstalled."
echo "You can now start the application."
echo ""

