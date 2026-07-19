# 🐳 Running Phase 2 Auth System with Docker

## Quick Start

### 1. Stop Current Containers (if running)
```bash
docker compose down
```

### 2. Rebuild Backend (includes new dependencies)
```bash
docker compose build backend --no-cache
```

### 3. Start Everything
```bash
docker compose up -d
```

### 4. Check Logs
```bash
# Watch all services
docker compose logs -f

# Watch just backend
docker compose logs -f backend

# Watch just database
docker compose logs -f db
```

## ✅ What's New in Phase 2

### Enhanced Authentication
- **Refresh Tokens**: 15-min access tokens + 7-day refresh tokens
- **MFA Support**: TOTP with Google Authenticator/Authy
- **Account Lockout**: 5 failed attempts = 30-minute lockout
- **Session Management**: Track all user sessions and devices
- **Login Audit**: Complete log of all login attempts

### New Environment Variables Added
```bash
REFRESH_EXPIRES_IN=7d
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=30
```

### Database Updates
The system will automatically create these new tables:
- `refresh_tokens` - Secure refresh token storage
- `user_sessions` - Active session tracking
- `login_attempts` - Complete login audit trail
- `user_mfa` - MFA secrets and backup codes
- Updated `users` table with security fields

## 🎯 Testing the New Features

### 1. Basic Login (Enhanced)
```bash
# Test login with new response format
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}' \
  -c cookies.txt

# Response includes:
# - access_token (JWT, 15min expiry)
# - user data with mfa_enabled flag
# - session info
# - HttpOnly refresh token cookie
```

### 2. Token Refresh
```bash
# Use the saved cookie to refresh token
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt
```

### 3. MFA Setup
```bash
# Setup MFA (requires valid access token)
curl -X POST http://localhost:5000/api/auth/mfa/setup \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt

# Returns:
# - QR code (base64 image)
# - Manual entry key
# - 10 backup codes
```

### 4. MFA Verification
```bash
# Verify TOTP and enable MFA
curl -X POST http://localhost:5000/api/auth/mfa/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"totp_token":"123456"}' \
  -b cookies.txt
```

### 5. Login with MFA
```bash
# Login when MFA is enabled
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123","totp_token":"654321"}' \
  -c cookies.txt
```

### 6. Session Management
```bash
# Get all active sessions
curl -X GET http://localhost:5000/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt

# Revoke a specific session
curl -X DELETE http://localhost:5000/api/auth/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt

# Revoke all other sessions (keep current)
curl -X POST http://localhost:5000/api/auth/sessions/revoke-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

## 🖥️ Frontend Access

### 1. Main Application
- **URL**: http://localhost:5174
- **Login**: Enhanced with MFA support
- **Features**: All existing functionality plus new security features

### 2. Security Settings Page
- **URL**: http://localhost:5174/security
- **Features**:
  - Enable/Disable MFA with QR code
  - View active sessions from all devices
  - Revoke individual sessions
  - Download backup codes

### 3. Enhanced Login Experience
- Automatic MFA prompt when enabled
- Account lockout notifications
- "Remember device" option
- Real-time validation

## 📊 Database Inspection

### Check New Tables
```bash
# Connect to database
docker compose exec db psql -U hr_user -d hr_database

# Check new tables
\dt

# View refresh tokens
SELECT user_id, expires_at, device_info->>'browser'->>'name' as browser, ip_address, is_revoked 
FROM refresh_tokens 
ORDER BY created_at DESC 
LIMIT 10;

# View active sessions
SELECT u.email, s.device_name, s.browser_name, s.ip_address, s.is_current, s.last_activity_at
FROM user_sessions s 
JOIN users u ON s.user_id = u.id 
WHERE s.terminated_at IS NULL 
ORDER BY s.last_activity_at DESC;

# View recent login attempts
SELECT email, ip_address, success, failure_reason, attempted_at 
FROM login_attempts 
ORDER BY attempted_at DESC 
LIMIT 20;

# Check MFA enabled users
SELECT u.email, u.mfa_enabled, m.is_enabled, m.enabled_at
FROM users u 
LEFT JOIN user_mfa m ON u.id = m.user_id 
WHERE u.mfa_enabled = true;
```

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Check backend logs
docker compose logs backend

# Common issues:
# 1. Database not ready - wait a bit more
# 2. Migration failed - check database connection
# 3. New dependencies not installed - rebuild image
```

### Database Migration Issues
```bash
# Manually run migration
docker compose exec backend npm run migrate

# Or reset database (CAREFUL - loses data)
docker compose down -v
docker compose up -d
```

### MFA Setup Issues
```bash
# Check backend logs for MFA errors
docker compose logs backend | grep -i mfa

# Common issues:
# 1. Time synchronization (check system time)
# 2. QR code not scanning (try manual entry)
# 3. Invalid TOTP token (check app time)
```

### Session/Cookie Issues
```bash
# Check CORS configuration
# Ensure frontend and backend URLs match
# Verify withCredentials: true in API calls
```

## 🚀 Production Deployment

### 1. Security Checklist
```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env with production values
JWT_SECRET=your_generated_64_char_hex_secret
MAX_LOGIN_ATTEMPTS=3
LOCKOUT_DURATION=60
```

### 2. Enable Rate Limiting
Uncomment in `server.js`:
```javascript
// Uncomment for production
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
```

### 3. HTTPS Configuration
- Use reverse proxy (nginx)
- Proper SSL certificates
- Secure cookie settings

## 📈 Monitoring

### Login Activity
```sql
-- Failed login trends
SELECT DATE(attempted_at) as date, 
       COUNT(*) as total_attempts,
       COUNT(CASE WHEN success = false THEN 1 END) as failed_attempts
FROM login_attempts 
WHERE attempted_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(attempted_at)
ORDER BY date DESC;

-- Suspicious IPs
SELECT ip_address, 
       COUNT(*) as attempts,
       COUNT(DISTINCT email) as unique_emails
FROM login_attempts 
WHERE attempted_at > NOW() - INTERVAL '24 hours'
  AND success = false
GROUP BY ip_address
HAVING COUNT(*) > 10
ORDER BY attempts DESC;
```

### Session Analytics
```sql
-- Active sessions by device type
SELECT device_type, COUNT(*) as sessions
FROM user_sessions 
WHERE terminated_at IS NULL 
  AND expires_at > NOW()
GROUP BY device_type;

-- MFA adoption rate
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN mfa_enabled = true THEN 1 END) as mfa_enabled,
  ROUND(COUNT(CASE WHEN mfa_enabled = true THEN 1 END) * 100.0 / COUNT(*), 2) as adoption_rate
FROM users 
WHERE status = 'active';
```

## 🎉 Success Indicators

You'll know Phase 2 is working when:

✅ **Backend starts successfully** with new auth endpoints
✅ **Database tables** are created automatically
✅ **Login returns** both access_token and sets refresh cookie
✅ **MFA setup** shows QR code and backup codes
✅ **Security page** shows active sessions
✅ **Account lockout** works after failed attempts
✅ **Automatic token refresh** works seamlessly

## 🔄 Next Steps

Phase 2 is now complete! Ready for:
- **Phase 3**: Enhanced Employee Management
- **Phase 4**: Advanced Attendance with Geofencing  
- **Phase 5**: Policy-Driven Leave Management

The enterprise authentication foundation is solid and ready for production use!