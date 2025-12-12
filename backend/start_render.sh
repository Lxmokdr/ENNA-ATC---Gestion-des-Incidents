#!/bin/bash

# Render.com startup script for Django backend
# This script is optimized for containerized environments

set -e  # Exit on error

echo "🚀 Starting ENNA Backend on Render..."

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    PYTHON_CMD="venv/bin/python"
else
    PYTHON_CMD="python3"
fi

# Export all database environment variables
export DB_PASSWORD DB_USER DB_NAME DB_HOST DB_PORT

# Run migrations
echo "🔄 Running database migrations..."
$PYTHON_CMD manage.py migrate --no-input || {
    echo "⚠️  Migration failed, but continuing..."
}

# Create default users (only if they don't exist)
echo "👥 Checking default users..."
$PYTHON_CMD manage.py create_default_users 2>/dev/null || {
    echo "⚠️  User creation skipped (may already exist)"
}

# Start server
echo "✅ Starting Django server on port ${PORT:-8000}..."
exec $PYTHON_CMD manage.py runserver 0.0.0.0:${PORT:-8000}
