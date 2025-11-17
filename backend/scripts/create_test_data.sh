#!/bin/bash

# Create test data for the dashboard

cd "$(dirname "$0")/.."

PYTHON_CMD="/home/lxmix/data/anaconda3/bin/python3.13"

echo "🔧 Creating test data..."
echo ""

sudo -E -u postgres env \
    PATH="/home/lxmix/data/anaconda3/bin:$PATH" \
    PYTHONPATH="/home/lxmix/.local/lib/python3.13/site-packages:/home/lxmix/data/anaconda3/lib/python3.13/site-packages" \
    "$PYTHON_CMD" manage.py create_test_data "$@"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test data created successfully!"
    echo ""
    echo "You can now:"
    echo "  1. Start the server: ./run_django.sh runserver 8000"
    echo "  2. View the dashboard with test data"
    echo "  3. Click the History button on Equipment page to see equipment history"
else
    echo ""
    echo "❌ Failed to create test data"
    exit 1
fi

