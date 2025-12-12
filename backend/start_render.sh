#!/bin/bash

# Render.com startup script for Django backend
# This script is optimized for containerized environments

# Don't exit on error for user creation - we want the server to start even if users fail
set +e

echo "🚀 Starting ENNA Backend on Render..."
echo "======================================"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    PYTHON_CMD="venv/bin/python"
    echo "✅ Using virtual environment"
else
    PYTHON_CMD="python3"
    echo "⚠️  No virtual environment found, using system Python"
fi

# Export all database environment variables (Render sets these automatically)
export DB_PASSWORD DB_USER DB_NAME DB_HOST DB_PORT

echo "📊 Database configuration:"
echo "   DB_HOST: ${DB_HOST:-NOT SET}"
echo "   DB_NAME: ${DB_NAME:-NOT SET}"
echo "   DB_USER: ${DB_USER:-NOT SET}"
echo "   DB_PORT: ${DB_PORT:-NOT SET}"
echo "   DB_PASSWORD: ${DB_PASSWORD:+SET (hidden)}"

# Run migrations
echo ""
echo "🔄 Running database migrations..."
$PYTHON_CMD manage.py migrate --no-input
MIGRATION_STATUS=$?
if [ $MIGRATION_STATUS -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migration failed (exit code: $MIGRATION_STATUS), but continuing..."
fi

# Create default users (CRITICAL - must succeed for app to work)
echo ""
echo "👥 Creating/updating default users..."
echo "   This is required for the application to work!"
$PYTHON_CMD manage.py create_default_users
USER_CREATION_STATUS=$?
if [ $USER_CREATION_STATUS -eq 0 ]; then
    echo "✅ Default users created/updated successfully"
    echo "   Default password for all users: 01010101"
else
    echo "❌ ERROR: User creation failed (exit code: $USER_CREATION_STATUS)"
    echo "   The application may not work correctly!"
    echo "   Users: admin, technicien1, technicien2, ingenieur1, ingenieur2, chefdep1, superuser1"
    echo "   Password: 01010101"
    echo ""
    echo "   To create users manually, use Render Shell:"
    echo "   cd backend && source venv/bin/activate && python manage.py create_default_users"
fi

# Start server on the port Render provides
echo ""
SERVER_PORT=${PORT:-8000}
echo "✅ Starting Django server on port $SERVER_PORT..."
echo "   Backend will be available at: https://enna-atc-gestion-des-incidents.onrender.com"
echo ""
set -e  # Exit on error for server startup
exec $PYTHON_CMD manage.py runserver 0.0.0.0:$SERVER_PORT
