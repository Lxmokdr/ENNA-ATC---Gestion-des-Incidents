#!/bin/bash

# ENNA ATC - Start Script
echo "🚀 Starting ENNA ATC System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies if needed
if [ ! -d "backend-simple/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend-simple
    npm install
    cd ..
fi

# Kill any existing processes on ports 8000 and 8080
echo "🧹 Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend in background
echo "🔧 Starting backend server..."
cd backend-simple
node server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend development server..."
echo "📱 Frontend will be available at: http://localhost:8080"
echo "🔧 Backend API available at: http://localhost:8000"
echo ""
echo "👥 Default users (password: 01010101):"
echo "   - technicien1, technicien2"
echo "   - ingenieur1, ingenieur2" 
echo "   - chefdep1, superuser1, admin"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start frontend
npm run dev

# This will run until Ctrl+C is pressed