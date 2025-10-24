#!/bin/bash

# ENNA ATC - Stop Script
# This script stops all ENNA services

echo "🛑 Stopping ENNA ATC - Incident Management System"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to kill process on port
kill_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}🔄 Stopping service on port $1...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 1
        if ! lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
            echo -e "${GREEN}✅ Port $1 freed${NC}"
        else
            echo -e "${RED}❌ Failed to free port $1${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  Port $1 is already free${NC}"
    fi
}

# Stop all services
echo -e "${BLUE}🧹 Cleaning up ENNA services...${NC}"

# Stop Frontend (port 8080)
kill_port 8080

# Stop Backend (port 8000)
kill_port 8000

# Stop DB Viewer (port 3001)
kill_port 3001

# Kill any remaining Node.js processes related to ENNA
echo -e "${YELLOW}🔄 Killing any remaining ENNA processes...${NC}"
pkill -f "node server.js" 2>/dev/null || true
pkill -f "node db-web-viewer.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

sleep 2

echo ""
echo -e "${GREEN}✅ All ENNA ATC services have been stopped${NC}"
echo -e "${BLUE}💡 To start again, run: ./start.sh${NC}"
echo ""
