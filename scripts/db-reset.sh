#!/bin/bash

# Reset database - drop and recreate with schema

set -e

echo "🗄️  Preṣaka Database Reset"
echo "========================="
echo ""
echo "⚠️  WARNING: This will DELETE ALL DATA in the database!"
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
read -p "Enter database name (default: presaka): " DB_NAME
DB_NAME=${DB_NAME:-presaka}

echo ""
echo "Dropping database '$DB_NAME'..."
dropdb "$DB_NAME" 2>/dev/null || echo -e "${YELLOW}⚠️  Database may not exist or already dropped${NC}"

echo "Creating database '$DB_NAME'..."
createdb "$DB_NAME"
echo -e "${GREEN}✅ Database created${NC}"

echo ""
echo "Running database schema..."
psql -d "$DB_NAME" -f backend/src/database/schema.sql
echo -e "${GREEN}✅ Schema created${NC}"

echo ""
echo -e "${GREEN}✨ Database Reset Complete!${NC}"
echo ""
echo "Database '$DB_NAME' has been reset with fresh schema."
echo ""

