# Deployment Setup Guide

This guide explains how to configure ENNA for deployment on Render (backend) and Vercel (frontend).

## Architecture

- **Frontend**: Vercel (`https://enna-atc-gestion-des-incidents.vercel.app`)
- **Backend**: Render (`https://enna-atc-gestion-des-incidents.onrender.com`)
- **Database**: Render PostgreSQL (`dpg-d4u9587gi27c738kb790-a`)

## Render Backend Configuration

### Environment Variables

Set these in your Render web service settings:

```bash
# Database (from Render PostgreSQL service)
DB_NAME=<your-database-name>
DB_USER=<your-database-user>
DB_PASSWORD=<your-database-password>
DB_HOST=dpg-d4u9587gi27c738kb790-a.oregon-postgres.render.com
DB_PORT=5432

# Django Settings
SECRET_KEY=<generate-a-strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=enna-atc-gestion-des-incidents.onrender.com,enna-atc-gestion-des-incidents.vercel.app

# Render automatically sets this
RENDER=true
```

### Build & Start Commands

**Option 1: Using start script (recommended)**
- **Build Command**: `cd backend && bash setup_django.sh`
- **Start Command**: `./start.sh` (script will detect containerized environment and use $PORT)

**Option 2: Direct Django commands**
- **Build Command**: `cd backend && bash setup_django.sh`
- **Start Command**: `cd backend && source venv/bin/activate && python manage.py migrate && python manage.py runserver 0.0.0.0:$PORT`

**Note**: Render automatically sets the `$PORT` environment variable. The start script will use it automatically.

### Notes

- Render automatically sets `PORT` environment variable
- The script detects `RENDER=true` and uses password authentication
- No `sudo` or `lsof` needed in containers

## Vercel Frontend Configuration

### Environment Variables

Set these in your Vercel project settings:

```bash
# API Base URL - Point to Render backend
VITE_API_BASE_URL=https://enna-atc-gestion-des-incidents.onrender.com/api
```

### Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Database Connection

The Render PostgreSQL service ID is: `dpg-d4u9587gi27c738kb790-a`

The full connection host will be: `dpg-d4u9587gi27c738kb790-a.oregon-postgres.render.com`

### Getting Database Credentials

1. Go to Render Dashboard
2. Select your PostgreSQL service
3. Copy the connection details:
   - Internal Database URL (for Render services)
   - External Database URL (for external connections)

## CORS Configuration

The backend is configured to allow:
- `https://enna-atc-gestion-des-incidents.vercel.app`
- `https://enna-atc-gestion-des-incidents.onrender.com`
- `http://localhost:8080` (local development)
- `http://localhost:5173` (Vite dev server)

## Testing the Connection

### Test Backend
```bash
curl https://enna-atc-gestion-des-incidents.onrender.com/api/health/
```

### Test Frontend
Visit: `https://enna-atc-gestion-des-incidents.vercel.app`

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_BASE_URL` is set correctly in Vercel
- Verify CORS settings in backend
- Check backend is running on Render

### Database connection errors
- Verify all database environment variables are set
- Check database host includes full domain (not just service ID)
- Ensure `DB_PASSWORD` is set (required in containers)

### CORS errors
- Verify `ALLOWED_HOSTS` includes Vercel domain
- Check `CORS_ALLOWED_ORIGINS` includes Vercel domain
- Ensure backend is accessible from internet
