#!/bin/bash

# ============================================
# Database Setup Script for SESAMA Platform
# ============================================

set -e  # Exit on error

echo "🔧 Setting up PostgreSQL database for SESAMA Platform..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database credentials from .env
DB_USER="postgres"
DB_PASSWORD="arkan2006"
DB_NAME="kita_bisa"

echo -e "${YELLOW}Step 1: Setting PostgreSQL password for user 'postgres'${NC}"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$DB_PASSWORD';"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Password set successfully${NC}"
else
    echo -e "${RED}✗ Failed to set password${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 2: Creating database '$DB_NAME'${NC}"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database might already exist"
sudo -u postgres psql -c "\l" | grep $DB_NAME
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database '$DB_NAME' is ready${NC}"
else
    echo -e "${RED}✗ Database creation failed${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 3: Granting privileges${NC}"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo -e "${GREEN}✓ Privileges granted${NC}"
echo ""

echo -e "${GREEN}✅ PostgreSQL setup completed!${NC}"
echo ""
echo "Next steps:"
echo "  1. cd backend"
echo "  2. source ~/.nvm/nvm.sh"
echo "  3. npx prisma migrate deploy"
echo "  4. npx prisma db seed"
echo ""
