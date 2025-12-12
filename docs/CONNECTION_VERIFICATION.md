# Connection Verification: Vercel Frontend ↔ Render Backend

## Architecture Overview

- **Frontend**: Vercel (`https://enna-atc-gestion-des-incidents.vercel.app`)
- **Backend**: Render (`https://enna-atc-gestion-des-incidents.onrender.com`)
- **Database**: Render PostgreSQL (`enna-db`)

## Configuration Status

### ✅ Frontend Configuration (Vercel)

**File**: `vercel.json`
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://enna-atc-gestion-des-incidents.onrender.com/api"
  }
}
```

**File**: `src/services/api.ts`
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

✅ Frontend is configured to use Render backend URL in production.

### ✅ Backend Configuration (Render)

**File**: `backend/enna_backend/settings.py`

**CORS Settings**:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:5173',  # Vite dev server
    'https://enna-atc-gestion-des-incidents.vercel.app',  # ✅ Vercel frontend
    'https://enna-atc-gestion-des-incidents.onrender.com',
]

CORS_ALLOW_CREDENTIALS = True
```

✅ Backend allows requests from Vercel frontend.

### ✅ Database Configuration (Render)

**File**: `render.yaml`
- Database service: `enna-db`
- Database variables automatically injected via `fromDatabase`
- Connection uses TCP/IP with password authentication

## Testing the Connection

### 1. Test Backend Health

```bash
curl https://enna-atc-gestion-des-incidents.onrender.com/api/health/
```

Expected: Should return a response (if health endpoint exists) or 404 (which is normal if endpoint doesn't exist).

### 2. Test CORS from Frontend

Open browser console on Vercel frontend and check:
- No CORS errors in console
- API requests succeed
- Authentication works

### 3. Test Login Flow

1. Go to `https://enna-atc-gestion-des-incidents.vercel.app`
2. Try to login with test credentials
3. Check browser Network tab:
   - Request to `https://enna-atc-gestion-des-incidents.onrender.com/api/auth/login/`
   - Response should be 200 with JWT tokens
   - No CORS errors

## Troubleshooting

### Issue: CORS Errors

**Symptoms**: Browser console shows CORS errors like:
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Solution**:
1. Verify `CORS_ALLOWED_ORIGINS` includes your Vercel URL
2. Check `DEBUG=False` in Render (CORS_ALLOW_ALL_ORIGINS should be False)
3. Ensure `CORS_ALLOW_CREDENTIALS = True`

### Issue: 404 Errors

**Symptoms**: API requests return 404

**Solution**:
1. Verify backend URL in `vercel.json` ends with `/api`
2. Check backend routes in `backend/api/urls.py`
3. Ensure backend service is running on Render

### Issue: Database Connection Errors

**Symptoms**: Backend logs show database connection errors

**Solution**:
1. Verify database is linked to web service in Render dashboard
2. Check environment variables are set correctly
3. Ensure `DB_PASSWORD` is set in Render environment

## Environment Variables Summary

### Render (Backend)
- `DB_NAME` - fromDatabase (enna-db)
- `DB_USER` - fromDatabase (enna-db)
- `DB_PASSWORD` - fromDatabase (enna-db)
- `DB_HOST` - fromDatabase (enna-db)
- `DB_PORT` - fromDatabase (enna-db)
- `SECRET_KEY` - generateValue: true
- `DEBUG` - "False"
- `ALLOWED_HOSTS` - "enna-atc-gestion-des-incidents.onrender.com,enna-atc-gestion-des-incidents.vercel.app"
- `RENDER` - "true"

### Vercel (Frontend)
- `VITE_API_BASE_URL` - "https://enna-atc-gestion-des-incidents.onrender.com/api"

## Next Steps

1. ✅ Verify frontend can reach backend (test login)
2. ✅ Verify CORS is working (no console errors)
3. ✅ Test all API endpoints from frontend
4. ✅ Verify database operations work (create incidents, etc.)

## Status

✅ **Configuration Complete** - All settings are properly configured for Vercel ↔ Render connection.
