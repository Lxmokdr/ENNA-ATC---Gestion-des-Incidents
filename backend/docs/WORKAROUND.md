# Workaround: Using postgres user temporarily

Since password authentication for `enna_user` is having issues, you can temporarily use the `postgres` superuser to get Django working.

## Current Status

Your `.env` file is already configured to use `postgres` user:
```
DB_USER=postgres
DB_PASSWORD=
```

## Test if Django works now

Run these commands:

```bash
cd /home/lxmix/data/ENNA/backend

# Test database connection
python manage.py check --database default

# Run migrations
python manage.py migrate

# Create default users
python manage.py create_default_users

# Start the server
python manage.py runserver 8000
```

## Why this works

The `postgres` superuser can connect using "peer" authentication (matching your system user), so no password is needed for local connections.

## Fix password authentication later

Once Django is working, you can fix the `enna_user` password issue:

```bash
bash fix_password_final.sh
```

Then update `.env` back to:
```
DB_USER=enna_user
DB_PASSWORD=ennadatabase
```

## Security Note

Using the `postgres` superuser is fine for development, but for production you should:
1. Fix the password authentication for `enna_user`
2. Remove superuser privileges from `enna_user`
3. Use `enna_user` for Django connections

