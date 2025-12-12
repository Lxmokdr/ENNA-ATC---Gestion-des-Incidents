#!/bin/bash

# ENNA ATC - Startup Script
# This script starts all necessary services for the ENNA incident management system

echo "🚀 Starting ENNA ATC - Incident Management System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to kill process on port
kill_port() {
    echo -e "${YELLOW}🔄 Killing process on port $1...${NC}"
    lsof -ti:$1 | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.8+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python $(python3 --version) detected${NC}"

# Check if Node.js is installed (for frontend)
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"

# Install dependencies if needed
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}🔄 Installing frontend dependencies...${NC}"
    npm install
fi

# Setup Django backend if needed
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}🔄 Setting up Django backend...${NC}"
    cd backend
    bash setup_django.sh
    cd ..
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"

# Kill existing processes on required ports
echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"
kill_port 8000  # Backend
kill_port 8080  # Frontend

# Start Django Backend
echo -e "${BLUE}🔧 Starting Django Backend Server...${NC}"

# Load environment variables from .env BEFORE changing directory
if [ -f "backend/.env" ]; then
    # Source the .env file properly (handle comments and empty lines)
    set -a
    source <(grep -v '^#' backend/.env | grep -v '^$' | sed 's/^/export /')
    set +a
fi

# Check database authentication method
DB_PASSWORD=${DB_PASSWORD:-}
# Check if password is empty, default, or just whitespace
if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "enna_password" ] || [ -z "${DB_PASSWORD// }" ]; then
    # Using peer authentication - try to run as postgres user
    echo -e "${YELLOW}⚠️  Database password not configured. Attempting peer authentication...${NC}"
    echo -e "${YELLOW}   This requires sudo access.${NC}"
    
    # Change to backend directory first
    cd backend
    
    # Determine Python command
    if [ -d "venv" ]; then
        PYTHON_CMD="$(pwd)/venv/bin/python"
    else
        PYTHON_CMD=python3
    fi
    
    # Check if Django is set up
    if [ ! -f "manage.py" ]; then
        echo -e "${YELLOW}🔄 Django backend not set up, running setup...${NC}"
        bash setup_django.sh
    fi
    
    # Try to run with sudo (test if passwordless sudo works for postgres user)
    if sudo -n -u postgres true 2>/dev/null; then
        # Passwordless sudo available
        echo -e "${GREEN}✅ Using passwordless sudo for peer authentication${NC}"
        # Use absolute path and ensure PATH is set correctly
        sudo -E -u postgres env PATH="$PATH" "$PYTHON_CMD" manage.py runserver 8000 &
        BACKEND_PID=$!
    else
        # Try running anyway - might work with passwordless sudo configured
        echo -e "${YELLOW}⚠️  Attempting to use sudo (passwordless sudo may be configured)...${NC}"
        sudo -E -u postgres env PATH="$PATH" "$PYTHON_CMD" manage.py runserver 8000 &
        BACKEND_PID=$!
        # Give it a moment to see if it starts
        sleep 2
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            echo -e "${RED}❌ Sudo failed. Please configure passwordless sudo:${NC}"
            echo -e "${YELLOW}   echo \"$USER ALL=(postgres) NOPASSWD: ALL\" | sudo tee /etc/sudoers.d/postgres-enna${NC}"
            echo ""
            echo -e "${YELLOW}Or set up password authentication:${NC}"
            echo -e "${GREEN}   cd backend && sudo ./setup_db_password.sh${NC}"
            cd ..
            exit 1
        fi
    fi
    cd ..
else
    # Using password authentication, run as current user
    echo -e "${GREEN}✅ Using password authentication${NC}"
    cd backend
    
    # Determine Python command
    if [ -d "venv" ]; then
        PYTHON_CMD="$(pwd)/venv/bin/python"
    else
        PYTHON_CMD=python3
    fi
    
    # Check if Django is set up
    if [ ! -f "manage.py" ]; then
        echo -e "${YELLOW}🔄 Django backend not set up, running setup...${NC}"
        bash setup_django.sh
    fi
    
    # Export environment variables for Django
    export DB_PASSWORD DB_USER DB_NAME DB_HOST DB_PORT
    
    $PYTHON_CMD manage.py runserver 8000 &
    BACKEND_PID=$!
    cd ..
fi

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/api/health/ > /dev/null; then
    echo -e "${GREEN}✅ Backend running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start Frontend
echo -e "${BLUE}⚛️  Starting Frontend Development Server...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 5

# Check if frontend is running
if curl -s http://localhost:8080 > /dev/null; then
    echo -e "${GREEN}✅ Frontend running on http://localhost:8080${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    kill $DB_VIEWER_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 ENNA ATC is now running!${NC}"
echo "=================================================="
echo -e "${BLUE}📱 Frontend:${NC}     http://localhost:8080"
echo -e "${BLUE}🔧 Backend API:${NC}   http://localhost:8000 (Django)"
echo ""
echo -e "${YELLOW}👥 Default Users (Password: 01010101):${NC}"
echo "   • technicien1, technicien2"
echo "   • ingenieur1, ingenieur2" 
echo "   • chefdep1, superuser1, admin"
echo ""
echo -e "${YELLOW}🛑 To stop all services:${NC}"
echo "   Press Ctrl+C or run: ./stop.sh"
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping ENNA ATC services...${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    kill $DB_VIEWER_PID 2>/dev/null || true
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo -e "${GREEN}✨ All services are running. Press Ctrl+C to stop.${NC}"
wait
