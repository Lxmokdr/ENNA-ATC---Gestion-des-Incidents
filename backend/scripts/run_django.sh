#!/bin/bash

# Run Django commands using postgres user with peer authentication
# This works around the password authentication issue

cd "$(dirname "$0")/.."

# Find python command with full path
# Use system python3 which postgres user can access
if [ -f "/usr/bin/python3" ]; then
    PYTHON_CMD="/usr/bin/python3"
elif command -v python3 &> /dev/null; then
    PYTHON_CMD=$(command -v python3)
else
    PYTHON_CMD="/usr/bin/python3"
fi

# Preserve important environment variables
export PATH
export PYTHONPATH

# Run as postgres user with environment preserved
sudo -E -u postgres env PATH="$PATH" "$PYTHON_CMD" manage.py "$@"
