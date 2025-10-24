#!/bin/bash

# ENNA ATC - Start Backend Only
echo "🔧 Starting ENNA Backend..."

# Kill any existing backend process
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend
echo "🚀 Backend starting on http://localhost:8000"
node server.js
