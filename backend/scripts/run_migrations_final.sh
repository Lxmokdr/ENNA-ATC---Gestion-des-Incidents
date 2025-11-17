#!/bin/bash

# Final migration script with proper Python path

cd "$(dirname "$0")/.."

PYTHON_CMD="/home/lxmix/data/anaconda3/bin/python3.13"

# Set PYTHONPATH to include user's local site-packages and anaconda
export PYTHONPATH="/home/lxmix/.local/lib/python3.13/site-packages:/home/lxmix/data/anaconda3/lib/python3.13/site-packages:$PYTHONPATH"

echo "🔧 Running PostgreSQL migrations..."
echo "Using Python: $PYTHON_CMD"
echo ""
echo "Note: Using Unix socket connection (peer authentication)"
echo "      Socket: /var/run/postgresql, Port: 5433"
echo ""

# Run migrations
echo "Running migrations..."
sudo -E -u postgres env \
    PATH="/home/lxmix/data/anaconda3/bin:$PATH" \
    PYTHONPATH="/home/lxmix/.local/lib/python3.13/site-packages:/home/lxmix/data/anaconda3/lib/python3.13/site-packages" \
    "$PYTHON_CMD" manage.py migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations completed!"
    echo ""
    echo "Creating default users..."
    sudo -E -u postgres env \
        PATH="/home/lxmix/data/anaconda3/bin:$PATH" \
        PYTHONPATH="/home/lxmix/.local/lib/python3.13/site-packages:/home/lxmix/data/anaconda3/lib/python3.13/site-packages" \
        "$PYTHON_CMD" manage.py create_default_users
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Default users created!"
        echo ""
        echo "🎉 Database migration to PostgreSQL is COMPLETE!"
        echo ""
        echo "To start the server:"
        echo "  sudo -E -u postgres env PATH=\"/home/lxmix/data/anaconda3/bin:\$PATH\" PYTHONPATH=\"/home/lxmix/.local/lib/python3.13/site-packages:/home/lxmix/data/anaconda3/lib/python3.13/site-packages\" $PYTHON_CMD manage.py runserver 8000"
    fi
else
    echo ""
    echo "❌ Migrations failed"
    exit 1
fi

