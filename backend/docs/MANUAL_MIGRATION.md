# Manual Migration Steps (Password Auth Not Working)

Since password authentication via TCP/IP is not working, use these manual steps:

## Step 1: Run Migrations as postgres user

```bash
cd /home/lxmix/data/ENNA/backend

# Run migrations using sudo (peer authentication)
sudo -u postgres python manage.py migrate

# Create default users
sudo -u postgres python manage.py create_default_users
```

## Step 2: For Development Server

You have two options:

### Option A: Run server as postgres user (not recommended for production)
```bash
sudo -u postgres python manage.py runserver 8000
```

### Option B: Fix password authentication first

The password authentication issue needs to be resolved. It appears there might be:
1. A Docker container interfering (docker-proxy on port 5432)
2. PostgreSQL configuration issue with password hashing
3. Network/routing issue

To investigate:
```bash
# Check if there's a Docker container
docker ps | grep postgres

# Check PostgreSQL logs
sudo tail -50 /var/log/postgresql/postgresql-*-main.log

# Verify pg_hba.conf
sudo cat /etc/postgresql/16/main/pg_hba.conf | grep -v "^#" | grep -v "^$"
```

## Current Status

✅ PostgreSQL installed and running
✅ Database `enna_db` created
✅ User `enna_user` exists
✅ Peer authentication works
❌ Password authentication via TCP/IP not working

## Workaround

Your `.env` is configured to use postgres user with empty password, which triggers Unix socket connection. However, the socket path might not be accessible to your user.

**Quick fix**: Run all Django management commands with `sudo -u postgres`:

```bash
# Make an alias
alias django-admin='sudo -u postgres python manage.py'

# Then use it
django-admin migrate
django-admin createsuperuser
django-admin runserver 8000
```

Or use the wrapper script:
```bash
./run_django.sh migrate
./run_django.sh create_default_users
```

