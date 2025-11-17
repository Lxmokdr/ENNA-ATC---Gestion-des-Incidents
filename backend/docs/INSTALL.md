# Installation Guide

## System Requirements

Before setting up the Django backend, you need to install Python and pip:

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### Other Linux distributions

- **Fedora**: `sudo dnf install python3 python3-pip python3-virtualenv`
- **Arch**: `sudo pacman -S python python-pip python-virtualenv`
- **CentOS/RHEL**: `sudo yum install python3 python3-pip`

## Quick Setup

Once Python and pip are installed, run:

```bash
cd backend
bash setup_django.sh
```

## Manual Setup (if setup script fails)

1. **Install dependencies**:
   ```bash
   # Option 1: With virtual environment (recommended)
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Option 2: Without virtual environment (user install)
   pip3 install --user -r requirements.txt
   ```

2. **Run migrations**:
   ```bash
   # With venv
   python manage.py makemigrations
   python manage.py migrate
   
   # Without venv
   python3 manage.py makemigrations
   python3 manage.py migrate
   ```

3. **Create default users**:
   ```bash
   python manage.py create_default_users
   # or
   python3 manage.py create_default_users
   ```

## Troubleshooting

### "pip3: command not found"

Install pip:
```bash
sudo apt install python3-pip
```

### "python3-venv: command not found"

Install venv:
```bash
sudo apt install python3.12-venv
# or for your Python version
sudo apt install python3-venv
```

### "ModuleNotFoundError: No module named 'django'"

Dependencies aren't installed. Run:
```bash
pip3 install -r requirements.txt
# or with user flag
pip3 install --user -r requirements.txt
```

### Permission errors

If you get permission errors, use `--user` flag:
```bash
pip3 install --user -r requirements.txt
```

Or use sudo (not recommended):
```bash
sudo pip3 install -r requirements.txt
```

## Verify Installation

Check if Django is installed:
```bash
python3 -c "import django; print(django.get_version())"
```

Check Django project:
```bash
cd backend
python3 manage.py check
```

## Running the Server

```bash
cd backend

# With venv
source venv/bin/activate
python manage.py runserver 8000

# Without venv
python3 manage.py runserver 8000
```

