#!/bin/bash
set -e

echo "🚀 Setting up local development environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
command -v docker &> /dev/null || { echo "❌ Docker not found"; exit 1; }
command -v terraform &> /dev/null || { echo "❌ Terraform not found"; exit 1; }
command -v node &> /dev/null || { echo "❌ Node.js not found"; exit 1; }
echo -e "${GREEN}✓ All prerequisites found${NC}"
echo ""

# Step 1: Start Docker/Ministack
echo -e "${BLUE}1️⃣  Starting Ministack (Moto)...${NC}"
docker-compose up -d
sleep 3
echo -e "${GREEN}✓ Ministack running on http://localhost:5000${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}2️⃣  Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
  pnpm install || npm install
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Build backend Lambda
echo -e "${BLUE}3️⃣  Building backend code...${NC}"
cd packages/backend
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run build 2>/dev/null || echo "ℹ️  No build script (using TypeScript directly)"
cd - > /dev/null
echo -e "${GREEN}✓ Backend ready${NC}"
echo ""

# Step 4: Install frontend dependencies
echo -e "${BLUE}4️⃣  Preparing frontend...${NC}"
cd packages/frontend
if [ ! -d "node_modules" ]; then
  npm install
fi
cd - > /dev/null
echo -e "${GREEN}✓ Frontend ready (run: npm run dev)${NC}"
echo ""

# Step 5: Initialize and apply Terraform (backend only - no S3/CloudFront)
echo -e "${BLUE}5️⃣  Deploying backend infrastructure (Terraform)...${NC}"
cd infra/local
terraform init -upgrade
terraform apply -auto-approve
cd - > /dev/null
echo -e "${GREEN}✓ Backend infrastructure deployed${NC}"
echo ""

# Step 6: Get outputs
echo -e "${BLUE}6️⃣  Infrastructure Endpoints:${NC}"
cd infra/local
terraform output -raw instructions 2>/dev/null || terraform output
cd - > /dev/null
echo ""

# Success summary
echo -e "${GREEN}✅ Local development environment ready!${NC}"
echo ""
echo -e "${YELLOW}🚀 Next: Start backend and frontend in separate terminals${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "   cd packages/backend"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "   cd packages/frontend"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}Then open: http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}📍 Endpoints:${NC}"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3000"
echo "   API:       http://localhost:3000/api"
echo "   Ministack: http://localhost:5000"
echo ""
echo -e "${YELLOW}🛑 To tear down:${NC}"
echo "   docker-compose down"
echo "   cd infra/local && terraform destroy"
echo ""
