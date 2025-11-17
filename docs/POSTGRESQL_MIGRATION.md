# PostgreSQL Migration Guide

This guide explains how to migrate the ENNA backend from SQLite to PostgreSQL.

## Prerequisites

1. **PostgreSQL installed** on your system
2. **Python dependencies** updated (psycopg v3)

## Step 1: Install PostgreSQL

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Start PostgreSQL service
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable on boot
```

## Step 2: Create Database and User

1. **Switch to postgres user**:
```bash
sudo -u postgres psql
```

2. **Create database and user**:
```sql
-- Create database
CREATE DATABASE enna_db;

-- Create user
CREATE USER enna_user WITH PASSWORD 'enna_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE enna_db TO enna_user;

-- For PostgreSQL 15+, also grant schema privileges
\c enna_db
GRANT ALL ON SCHEMA public TO enna_user;

-- Exit psql
\q
```

## Step 3: Configure Environment Variables

1. **Copy the example environment file**:
```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` file** with your PostgreSQL credentials:
```bash
# PostgreSQL Database Configuration
DB_NAME=enna_db
DB_USER=enna_user
DB_PASSWORD=your_secure_password_here
DB_HOST=localhost
DB_PORT=5432

# Django Secret Key (change in production)
SECRET_KEY=your-secret-key-here
```

**Important**: Update `DB_PASSWORD` and `SECRET_KEY` with secure values!

## Step 4: Install Python Dependencies

```bash
cd backend
source venv/bin/activate  # if using venv
pip install -r requirements.txt
```

This will install `psycopg[binary]` (version 3) which is required for PostgreSQL connectivity and has better Python 3.13 support.

### Fixing psycopg2 Conflicts (if needed)

If you encounter errors like `ImportError: undefined symbol: _PyInterpreterState_Get` or conflicts with anaconda-installed psycopg2, run:

```bash
cd backend
bash fix_psycopg.sh
```

This script will:
- Remove conflicting psycopg2 packages
- Install psycopg (v3) which is compatible with Python 3.13

## Step 5: Run Migrations

```bash
# Make sure you're in the backend directory
cd backend
source venv/bin/activate  # if using venv

# Run migrations to create tables in PostgreSQL
python manage.py migrate
```

## Step 6: Migrate Data from SQLite (Optional)

If you have existing data in SQLite that you want to migrate:

### Option A: Using Django's dumpdata/loaddata

1. **Export data from SQLite** (temporarily switch back to SQLite):
   - Edit `settings.py` temporarily to use SQLite
   - Export: `python manage.py dumpdata > data.json`
   - Switch back to PostgreSQL in `settings.py`

2. **Import data to PostgreSQL**:
   ```bash
   python manage.py loaddata data.json
   ```

### Option B: Using pgloader (Advanced)

```bash
# Install pgloader
sudo apt install pgloader

# Migrate data
pgloader sqlite:///path/to/backend-simple/enna.db postgresql://enna_user:enna_password@localhost/enna_db
```

## Step 7: Create Default Users

```bash
python manage.py create_default_users
```

## Step 8: Verify Connection

Test the connection:
```bash
python manage.py dbshell
```

You should see a PostgreSQL prompt. Type `\dt` to list tables, then `\q` to exit.

## Step 9: Start the Server

```bash
python manage.py runserver 8000
```

The application should now be using PostgreSQL!

## Troubleshooting

### Connection Refused

- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify connection settings in `.env`
- Check PostgreSQL is listening: `sudo netstat -plnt | grep 5432`

### Authentication Failed

- Verify username and password in `.env` match PostgreSQL user
- Check `pg_hba.conf` allows local connections:
  ```bash
  sudo nano /etc/postgresql/*/main/pg_hba.conf
  ```
  Ensure line: `local   all             all                                     peer` or `md5`

### Permission Denied

- Grant schema privileges (for PostgreSQL 15+):
  ```sql
  \c enna_db
  GRANT ALL ON SCHEMA public TO enna_user;
  ```

### Module Not Found: psycopg or psycopg2

- Install dependencies: `pip install -r requirements.txt`
- If using venv, make sure it's activated
- If you have conflicts with anaconda-installed psycopg2, run: `bash fix_psycopg.sh`

### ImportError: undefined symbol: _PyInterpreterState_Get

This error occurs when there's a conflict between psycopg2 and Python 3.13. Solution:

```bash
cd backend
bash fix_psycopg.sh
```

This will remove the conflicting psycopg2 and install psycopg (v3) which is compatible with Python 3.13.

## Configuration Details

The database configuration in `settings.py` uses environment variables:

- `DB_NAME`: Database name (default: `enna_db`)
- `DB_USER`: PostgreSQL username (default: `enna_user`)
- `DB_PASSWORD`: PostgreSQL password (default: `enna_password`)
- `DB_HOST`: Database host (default: `localhost`)
- `DB_PORT`: Database port (default: `5432`)

All values can be overridden via `.env` file or environment variables.

## Production Considerations

For production environments:

1. **Use strong passwords** for database user
2. **Set up SSL/TLS** for database connections
3. **Use connection pooling** (e.g., pgBouncer)
4. **Configure backups** regularly
5. **Set up monitoring** for database performance
6. **Use environment-specific `.env` files** (never commit `.env` to git)

## Rollback to SQLite

If you need to rollback to SQLite temporarily:

1. Comment out PostgreSQL config in `settings.py`
2. Uncomment SQLite config:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.sqlite3',
           'NAME': str(BASE_DIR.parent / 'backend-simple' / 'enna.db'),
       }
   }
   ```
3. Run migrations: `python manage.py migrate`

