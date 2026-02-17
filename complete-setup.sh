#!/bin/bash

# ============================================
# Complete Setup Script - Run After Database Setup
# ============================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  SobatBantu Platform - Complete Setup${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if node is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js via NVM.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"
echo -e "${GREEN}✓ npm $(npm --version) detected${NC}"
echo ""

# Navigate to backend
cd "$(dirname "$0")/backend"

echo -e "${YELLOW}Step 1: Testing database connection...${NC}"
if npx prisma db execute --stdin < /dev/null 2>&1 | grep -q "error\|Error\|ERROR"; then
    echo -e "${RED}✗ Database connection failed${NC}"
    echo ""
    echo "Please run the database setup first:"
    echo "  ./setup-database.sh"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ Database connection successful${NC}"
fi
echo ""

echo -e "${YELLOW}Step 2: Running database migrations...${NC}"
npx prisma migrate deploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${RED}✗ Migration failed${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 3: Seeding database with initial data...${NC}"
npx prisma db seed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded successfully${NC}"
else
    echo -e "${RED}✗ Seeding failed${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo "Demo Accounts Created:"
echo "  - Super Admin: syh.arkan@gmail.com / password"
echo "  - Manager: manager@sobatbantu.org / password"
echo "  - Content Manager: content@sobatbantu.org / password"
echo "  - Supervisor: supervisor@sobatbantu.org / password"
echo "  - Pengusul: pengusul1@example.com / password"
echo ""
echo "Next Steps:"
echo ""
echo "  ${YELLOW}Terminal 1 - Start Backend:${NC}"
echo "    cd backend"
echo "    npm run start:dev"
echo "    ${BLUE}→ http://localhost:3001${NC}"
echo ""
echo "  ${YELLOW}Terminal 2 - Start Frontend:${NC}"
echo "    cd frontend"
echo "    npm run dev"
echo "    ${BLUE}→ http://localhost:3000${NC}"
echo ""
echo "Ready to code! 🚀"
echo ""
