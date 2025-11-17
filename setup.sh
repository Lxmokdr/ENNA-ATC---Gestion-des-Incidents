#!/bin/bash

# ENNA ATC - Setup Script
# This script sets up the ENNA incident management system for first-time users

echo "🔧 ENNA ATC - Initial Setup"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from: https://nodejs.org/${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required.${NC}"
    echo -e "${YELLOW}Current version: $(node -v)${NC}"
    echo -e "${YELLOW}Please upgrade Node.js from: https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    echo -e "${YELLOW}Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"

# Check if git is installed
if ! command_exists git; then
    echo -e "${YELLOW}⚠️  Git is not installed (optional but recommended)${NC}"
else
    echo -e "${GREEN}✅ Git $(git --version | cut -d' ' -f3) detected${NC}"
fi

echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install frontend dependencies
echo -e "${YELLOW}🔄 Installing frontend dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

# Setup Django backend
echo -e "${YELLOW}🔄 Setting up Django backend...${NC}"
if [ -d "backend" ]; then
    cd backend
    if bash setup_django.sh; then
        echo -e "${GREEN}✅ Django backend setup completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Django setup had warnings, but continuing...${NC}"
    fi
    cd ..
else
    echo -e "${RED}❌ Backend directory not found${NC}"
    exit 1
fi

echo ""

# Test the installation
echo -e "${BLUE}🧪 Testing installation...${NC}"

# Test backend (Django)
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
    PYTHON_CMD=python
else
    PYTHON_CMD=python3
fi

$PYTHON_CMD manage.py runserver 8000 &
BACKEND_PID=$!
cd ..

sleep 5

if curl -s http://localhost:8000/api/health/ > /dev/null; then
    echo -e "${GREEN}✅ Backend test passed${NC}"
else
    echo -e "${RED}❌ Backend test failed${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

kill $BACKEND_PID 2>/dev/null || true

echo ""

# Success message
echo -e "${GREEN}🎉 ENNA ATC setup completed successfully!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "   1. Run: ./start.sh"
echo "   2. Open: http://localhost:8080"
echo "   3. Login with: technicien1 / 01010101"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   • README.md - Complete documentation"
echo "   • docs/ - Additional documentation"
echo ""
echo -e "${BLUE}🛠️  Available commands:${NC}"
echo "   • ./start.sh  - Start all services"
echo "   • ./stop.sh   - Stop all services"
echo "   • ./setup.sh  - Re-run this setup"
echo ""
echo -e "${GREEN}✨ Ready to manage incidents!${NC}"
