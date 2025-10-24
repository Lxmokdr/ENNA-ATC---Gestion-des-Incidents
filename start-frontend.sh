#!/bin/bash

# ENNA ATC - Start Frontend Only
echo "🎨 Starting ENNA Frontend..."

# Kill any existing frontend process
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🚀 Frontend starting on http://localhost:8080"
npm run dev
