# Quick Fix for PostgreSQL Authentication

The connection is failing because PostgreSQL's `pg_hba.conf` is likely configured to use "peer" authentication instead of password authentication.

## Quick Solution

Run these commands in your terminal:

```bash
cd /home/lxmix/data/ENNA/backend

# Option 1: Use the automated script (recommended)
bash fix_pg_hba.sh

# Option 2: Manual fix
```

## Manual Fix (if script doesn't work)

1. **Find and edit pg_hba.conf:**
   ```bash
   sudo nano /etc/postgresql/16/main/pg_hba.conf
   ```

2. **Find the line for localhost connections** (look for a line starting with `host` and containing `127.0.0.1/32`)

3. **Change the authentication method** to `scram-sha-256` or `md5`:
   ```
   # Change from:
   host    all             all             127.0.0.1/32            peer
   
   # To:
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
   
   If the line doesn't exist, add it:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```

4. **Save the file** (Ctrl+X, then Y, then Enter in nano)

5. **Restart PostgreSQL:**
   ```bash
   sudo systemctl restart postgresql
   ```

6. **Test the connection:**
   ```bash
   bash test_db_connection.sh
   ```

7. **Run migrations:**
   ```bash
   python manage.py migrate
   python manage.py create_default_users
   ```

## Why This Happens

PostgreSQL uses `pg_hba.conf` to determine how users authenticate. By default, local connections often use "peer" authentication, which matches the system username with the PostgreSQL username. Since your system user is "lxmix" but the database user is "enna_user", it fails.

Changing to `scram-sha-256` or `md5` allows password-based authentication, which is what Django needs.

