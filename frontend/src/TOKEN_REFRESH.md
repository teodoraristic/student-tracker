# JWT Token Refresh & Rotation Guide

## Overview

The application implements secure token management with automatic refresh and rotation:
- **Access Token:** 7 days expiration (short-lived)
- **Refresh Token:** 30 days expiration (long-lived)
- **Token Rotation:** Old refresh tokens are revoked when new ones are issued
- **Automatic Refresh:** Tokens refresh transparently when expired

## How It Works

### Token Flow

```
User Login
    ↓
[Server issues: accessToken + refreshToken]
    ↓
[Frontend stores both tokens]
    ↓
API Request with accessToken
    ↓
[Token expires or about to expire]
    ↓
[Axios intercepts 401 response]
    ↓
[Frontend calls /auth/refresh with refreshToken]
    ↓
[Server validates refresh token & issues new pair]
    ↓
[Old refresh token is revoked (rotation)]
    ↓
[Frontend updates both tokens]
    ↓
[Original request retried with new accessToken]
    ↓
User sees no interruption
```

### Token Rotation

**Security benefit:** Prevents token replay attacks

When refresh token is used:
1. Server validates the token
2. Server creates NEW refresh token
3. Server REVOKES old refresh token
4. Client stores new tokens
5. Old token can never be used again

If attacker steals a refresh token:
- They can use it once
- After use, it's immediately revoked
- Any subsequent use is blocked
- Server detects replay attack

## Storage

Tokens are stored in **localStorage**:
```javascript
localStorage.getItem("accessToken");    // Current access token
localStorage.getItem("refreshToken");   // Refresh token for getting new access token
```

⚠️ **Note:** localStorage is vulnerable to XSS. Never store in localStorage if:
- Your app is vulnerable to XSS
- You handle highly sensitive data

### Secure Alternative: HttpOnly Cookies

For maximum security, store refresh tokens in HttpOnly cookies (not accessible to JavaScript):
```javascript
// Server sets cookie on /auth/login response
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

Backend setup: Configure SecurityConfig to use cookie-based refresh tokens.

## API Endpoints

### Login
```
POST /api/auth/login
Body: { email, password }
Response: {
  accessToken: "eyJhbG...",
  refreshToken: "550e8...",
}
```

### Register
```
POST /api/auth/register
Body: { email, password, firstName, lastName }
Response: {
  accessToken: "eyJhbG...",
  refreshToken: "550e8...",
}
```

### Refresh Token
```
POST /api/auth/refresh
Body: { refreshToken: "550e8..." }
Response: {
  accessToken: "eyJhbG...",
  refreshToken: "550e8...",  // NEW token (rotation)
}
```

### Logout
```
POST /api/auth/logout
- Invalidates access token (increments tokenVersion)
- Revokes all refresh tokens
```

## Automatic Token Refresh

The axios interceptor automatically handles token refresh:

```javascript
// 1. Request fails with 401 (token expired)
// 2. Axios interceptor detects 401
// 3. Calls POST /auth/refresh automatically
// 4. Gets new tokens
// 5. Retries original request
// 6. Returns response to component (no error)
```

**Component code** - You don't need to do anything special:

```javascript
try {
  const data = await api.get('/api/subjects');  // Works even if token expired
  setData(data);
} catch (err) {
  // Only catches if refresh fails
  // (no refresh token, or refresh token expired)
  setError(err.userMessage);
}
```

## Token Refresh Queue

Multiple simultaneous requests might trigger refresh at the same time:

```
Request 1 gets 401
    ↓
Request 2 gets 401
    ↓
Request 3 gets 401
    ↓
[All 3 wait for single refresh call to complete]
    ↓
[Single refresh request issued to /auth/refresh]
    ↓
[All 3 queued requests retry with new token]
```

Benefits:
- No race conditions
- No multiple unnecessary refresh calls
- More efficient

## Logout

```javascript
import { useAuth } from '../auth/useAuth';

export default function Profile() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();  // Revokes all tokens server-side
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

What happens on logout:
1. POST /auth/logout is called
2. Server increments user's tokenVersion (invalidates access tokens)
3. Server revokes all refresh tokens in database
4. Frontend clears localStorage
5. User redirected to login

## Token Expiration Handling

### Access Token Expires
- **Automatic:** Axios detects 401, refreshes, retries request
- **Transparent:** User doesn't see anything

### Refresh Token Expires
- **Manual:** Needs login again
- **Rare:** Only after 30 days of inactivity
- **Automatic:** Axios redirects to /login

```javascript
// In axios interceptor
if (error.response?.status === 401 && !originalRequest._retry) {
  try {
    const { accessToken, refreshToken } = await refreshToken();
    // Success - retry original request
  } catch (err) {
    // Refresh failed - redirect to login
    window.location.href = '/login';
  }
}
```

## Security Considerations

### ✅ What's Secure

- **Access Token Expiration:** 7 days = limited exposure
- **Refresh Token Rotation:** Old tokens can't be reused
- **Token Revocation:** Logout invalidates all tokens
- **Automatic Refresh:** No manual token handling needed
- **Queue System:** Prevents race conditions
- **Refresh Token Storage:** Consider using HttpOnly cookies

### ⚠️ What to Watch Out For

- **XSS Attacks:** Can steal tokens from localStorage
  - Mitigation: Content Security Policy (CSP), sanitize inputs

- **CSRF Attacks:** Can send refresh request with old cookies
  - Mitigation: CSRF tokens (framework handles this)

- **Token Theft:** If refresh token is stolen
  - Mitigation: Token rotation (already implemented)
  - Recovery: Logout from all devices invalidates all tokens

## Testing Token Refresh

### Test 1: Manual Token Expiration
```javascript
// In browser console:
localStorage.setItem("accessToken", "expired.token.here");

// Try making request
// Should automatically refresh and work
```

### Test 2: Refresh Token Expiration
```javascript
// Remove refresh token
localStorage.removeItem("refreshToken");

// Try making request
// Should redirect to login
```

### Test 3: Token Rotation
```javascript
// 1. Get initial refresh token from login
console.log(localStorage.getItem("refreshToken")); // token1

// 2. Trigger automatic refresh
// (wait 7 days or manually expire access token)

// 3. Check refresh token changed
console.log(localStorage.getItem("refreshToken")); // token2 (different!)
```

## Troubleshooting

### Stuck in Login Loop
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors
- Verify backend is running at correct URL

### Tokens Not Refreshing
- Check Network tab: Should see POST /auth/refresh
- Verify refresh token exists: `localStorage.getItem("refreshToken")`
- Check server logs for refresh endpoint errors

### Redirect to Login Unexpectedly
- Likely: Refresh token expired (30 days)
- Solution: Login again
- Or: Server couldn't find refresh token in database

## Migration from Old Token System

If upgrading from single-token system:

1. **Backend:** Deploy RefreshToken system
2. **Frontend:** Update axios to handle refreshToken
3. **Database:** Run migration to create refresh_tokens table
4. **Users:** Will automatically get new tokens on next login
5. **Old tokens:** Continue working until they expire (7 days)

No forced logout required - gradual transition.
