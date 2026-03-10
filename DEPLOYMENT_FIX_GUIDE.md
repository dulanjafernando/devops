# Food Application API Fix - Deployment Guide

## Issues Fixed

### 1. **API URL Mismatch (CRITICAL)**
**Problem:** Frontend was using different API URLs for different operations
- `addFoods()`: Used IP address `http://13.233.113.169:3000/food` ❌
- `handleSubmit()` (add/update): Used `http://localhost:3000/food` ❌ (BROKEN)
- `handleDelete()`: Used `http://localhost:3000/food` ❌ (BROKEN)

**Solution:** Created centralized API configuration in `frontend/src/config/api.js`
- All frontend components now use `API_BASE_URL` constant
- Environment variable support via `VITE_API_BASE_URL`
- Updated all components: `admin.jsx`, `home.jsx`, `signin.jsx`, `signup.jsx`

### 2. **Bearer Token / CORS Issues** 
The backend endpoints don't require authentication, so CORS is properly configured.
CORS headers in backend/index.js are correctly set.

### 3. **Improved Error Messages**
Updated all API calls to provide better error feedback:
```javascript
// Before
setError("Error saving food item");

// After
setError(err.response?.data?.message || "Error saving food item: " + err.message);
```

## Files Modified

### Frontend Changes:
1. **frontend/src/config/api.js** (NEW)
   - Centralized API configuration
   - Environment variable support
   - API endpoint constants

2. **frontend/src/admin.jsx**
   - Updated all fetch/POST/PUT/DELETE calls
   - Added better error handling
   - Uses API_BASE_URL constant

3. **frontend/src/home.jsx**
   - Updated fetch and logout calls
   - Uses API_BASE_URL constant

4. **frontend/src/signin.jsx & signup.jsx**
   - Updated authentication calls
   - Uses API_BASE_URL constant

5. **frontend/.env.example** (NEW)
   - Environment configuration template

### Backend (No Changes Needed)
Backend API endpoints are correctly implemented:
- ✅ GET /food - Fetch all foods
- ✅ GET /food/:id - Fetch single food
- ✅ POST /food - Create food item
- ✅ PUT /food/:id - Update food item
- ✅ DELETE /food/:id - Delete food item

## Deployment Instructions

### For Docker Deployment:

1. **Update compose.yml** to pass environment variables:
```yaml
services:
  frontend:
    environment:
      - VITE_API_BASE_URL=http://your-production-ip:3000
```

2. **Build Docker images**:
```bash
docker-compose build
```

3. **Run containers**:
```bash
docker-compose up -d
```

### For Production:

Update the IP address before deployment:
1. Replace `13.233.113.169` in `frontend/src/config/api.js` with your production IP/domain
   OR
2. Set environment variable: `VITE_API_BASE_URL=http://your-ip:3000`

## Testing the Fixes

### Test Add Food Item:
```bash
curl -X POST http://13.233.113.169:3000/food \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Biryani",
    "price": 300,
    "image": "data:image/...",
    "description": "Delicious biryani"
  }'
```

### Test Update Food Item:
```bash
curl -X PUT http://13.233.113.169:3000/food/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Biryani Updated",
    "price": 350,
    "image": "data:image/...",
    "description": "Updated biryani"
  }'
```

### Test Delete Food Item:
```bash
curl -X DELETE http://13.233.113.169:3000/food/{id}
```

## Key Changes Summary:

| Issue | Before | After |
|-------|--------|-------|
| Add Food URL | `localhost:3000` (BROKEN) | `13.233.113.169:3000` ✅ |
| Edit Food URL | `localhost:3000` (BROKEN) | `13.233.113.169:3000` ✅ |
| Delete Food URL | `localhost:3000` (BROKEN) | `13.233.113.169:3000` ✅ |
| Configuration | Hardcoded in each file | Centralized in `api.js` ✅ |
| Error Messages | Generic | Detailed from API ✅ |
| Environment Support | None | Full support via `.env` ✅ |

## Notes:
- Backend is working correctly - no changes needed there
- All CRUD operations should now work properly after deployment
- Image compression is handled on the frontend (50MB JSON payload limit)
- No database credentials exposed in the code
