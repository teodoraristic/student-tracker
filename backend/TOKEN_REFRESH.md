# JWT Token Refresh & Rotation Guide

## Overview

Secure token management system with automatic refresh and rotation:

- **Access Token:** 7 days expiration (short-lived, in JWT)
- **Refresh Token:** 30 days expiration (long-lived, in database)
- **Token Rotation:** Old refresh tokens are revoked when new ones are issued
- **Invalidation:** Logout increments tokenVersion to invalidate all old access tokens

## Architecture

### Components

1. **JwtService** - Generates access tokens
   - Method: `generateToken(User)` → JWT with 7-day expiration
   - Includes: email, role, tokenVersion in claims
   - Used for: Access control on protected endpoints

2. **RefreshTokenService** - Manages refresh tokens
   - `createToken(User)` → New refresh token in database
   - `validateToken(String)` → Validates and returns User
   - `rotateToken(String)` → Implements secure rotation
   - `revokeToken(String)` → Revokes single token
   - `revokeAllUserTokens(User)` → Revokes all tokens (logout)

3. **RefreshToken Entity** - Database persistence
   - Properties: id, user, token, expiresAt, createdAt, revokedAt
   - Methods: isExpired(), isRevoked(), isValid()
   - Unique constraint: token (no duplicates)

4. **AuthService** - Orchestrates authentication
   - `register()` → Issues access + refresh tokens
   - `login()` → Issues access + refresh tokens
   - `logout()` → Invalidates all tokens (version + revoke)
   - `generateAccessToken(User)` → For refresh endpoint

5. **AuthController** - HTTP endpoints
   - POST /api/auth/login → Returns { accessToken, refreshToken }
   - POST /api/auth/register → Returns { accessToken, refreshToken }
   - POST /api/auth/refresh → Returns new token pair
   - POST /api/auth/logout → Invalidates tokens

### Token Rotation Mechanism

**Secure implementation prevents token replay attacks:**

```java
public RefreshToken rotateToken(String oldTokenValue) {
    // 1. Validate old token (checks expiration and revocation status)
    User user = validateToken(oldTokenValue);

    // 2. Create new token immediately
    RefreshToken newToken = createToken(user);

    // 3. Revoke old token (set revokedAt timestamp)
    oldToken.setRevokedAt(Instant.now());
    refreshTokenRepository.save(oldToken);

    return newToken;
}
```

**Attack scenario prevented:**

```
Attacker steals refresh token
    ↓
Attacker uses it at /auth/refresh
    ↓
Server issues new tokens, revokes old one
    ↓
Legitimate user tries to use stolen token
    ↓
Server checks: revokedAt is not null
    ↓
Request rejected - attack detected!
```

## Database Schema

```sql
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL REFERENCES users(id),
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    UNIQUE KEY idx_token (token)
);
```

## API Endpoints

### POST /api/auth/login
```
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}

Error (401):
{
  "status": 401,
  "message": "Authentication failed. Please try again."
}
```

### POST /api/auth/register
```
Request:
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}

Error (409):
{
  "status": 409,
  "message": "This action conflicts with existing data. Please try again."
}
```

### POST /api/auth/refresh
```
Request:
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "660e8400-e29b-41d4-a716-446655440111"  // NEW token (rotated)
}

Error (401):
{
  "status": 401,
  "message": "Authentication failed. Please try again."
}
```

### POST /api/auth/logout
```
Request: (authenticated)

Response (200): (no body)

Side effects:
- user.tokenVersion incremented
- All refresh tokens for user revoked
- All old access tokens now invalid
```

## Token Validation Flow

### Access Token Validation
```
Request comes in
    ↓
JwtAuthFilter extracts JWT from Authorization header
    ↓
JwtService.parseJwt(token)
    ↓
Verify signature using secret key
    ↓
Check expiration
    ↓
Extract email, role, tokenVersion
    ↓
Load User from database
    ↓
Compare stored tokenVersion with token's tokenVersion
    ↓
If match: Grant access
If mismatch: Token was invalidated by logout
    ↓
Continue to controller
```

### Refresh Token Validation
```
POST /auth/refresh with refresh token
    ↓
RefreshTokenService.validateToken(token)
    ↓
Query database: SELECT * FROM refresh_tokens WHERE token = ?
    ↓
Check: token not found → Throw exception
Check: revokedAt is not null → Throw exception
Check: Instant.now() > expiresAt → Throw exception
    ↓
All checks pass: Return associated User
```

## Implementation Details

### Token Version Invalidation

**Problem:** Can't invalidate JWT in database (it's stateless)

**Solution:** Store version number in both JWT and User entity

```java
// On login
int tokenVersion = user.getTokenVersion();  // e.g., 0
String token = jwtService.generateToken(user);  // JWT includes version 0

// On logout
user.incrementTokenVersion();  // Now version = 1
userRepository.save(user);

// On protected request
int tokenVersion = jwtService.extractTokenVersion(token);  // Gets 0 from JWT
int userVersion = user.getTokenVersion();  // Gets 1 from database
if (tokenVersion != userVersion) {
    // Token was invalidated by logout
    throw new UnauthorizedException("Token is invalid");
}
```

Benefits:
- Immediate logout (no waiting for token expiration)
- All tokens from that session become invalid
- Supports multiple devices (logout from all)

### Refresh Token Queue Prevention

Frontend handles this - prevents multiple refresh calls:

```javascript
// axios interceptor
let refreshPromise = null;

if (!refreshPromise) {
    refreshPromise = callRefreshEndpoint();
}
// Wait for existing refresh
await refreshPromise;
refreshPromise = null;
```

Backend doesn't need special handling (idempotent).

## Security Considerations

### ✅ What's Secure

- **Short-lived Access Token (7 days):** Limited exposure window
- **Token Rotation:** Old tokens can't be reused
- **Revocation:** Logout immediately invalidates tokens
- **Database-backed Refresh Token:** Can be revoked anytime
- **Token Version:** Prevents old tokens after logout
- **Unique Constraints:** No duplicate tokens
- **Instant timestamps:** Prevents timezone issues

### ⚠️ What to Implement

1. **HTTPS Only**
   ```java
   @Configuration
   public class SecurityConfig {
       // All tokens must be transmitted over HTTPS in production
       // Set secure cookie flag if using cookies
       httpOnly = true;
       secure = true;  // HTTPS only
   }
   ```

2. **HttpOnly Cookies (Recommended)**
   ```java
   // Instead of returning token in JSON:
   // Set as HttpOnly cookie
   response.addCookie(refreshTokenCookie);
   // JavaScript can't access it (prevents XSS theft)
   ```

3. **Rate Limiting on Refresh Endpoint**
   ```java
   // Prevent brute force attacks
   // Already implemented for password reset
   // Could apply same pattern to refresh endpoint
   ```

4. **Token Signing Secret**
   ```properties
   # Keep JWT_SECRET strong and rotate periodically
   jwt.secret=${JWT_SECRET}  # Must be 32+ characters
   ```

5. **CORS Configuration**
   ```
   // Already configured in SecurityConfig
   // Only allows from allowed domains
   ```

6. **CSRF Protection**
   ```java
   // Already enabled in SecurityConfig
   // Protects refresh endpoint from CSRF
   ```

## Cleanup & Maintenance

### Expired Refresh Tokens
Expired tokens accumulate in database over time.

**Cleanup strategy:**

```java
@Scheduled(cron = "0 0 2 * * ?")  // Daily at 2 AM
public void deleteExpiredTokens() {
    refreshTokenRepository.deleteByExpiresAtBefore(Instant.now());
}
```

### Revoked Tokens
Revoked tokens should eventually be deleted to save space.

```java
@Scheduled(cron = "0 0 3 * * ?")  // Daily at 3 AM
public void deleteRevokedOldTokens() {
    // Delete tokens revoked more than 7 days ago
    Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);
    refreshTokenRepository.deleteByRevokedAtBefore(cutoff);
}
```

## Monitoring & Logging

### What to Log

```java
// Successful refresh
logger.info("Token refreshed for user: {}", userId);

// Refresh failures
logger.warn("Refresh failed - expired token for user: {}", userId);
logger.warn("Refresh failed - revoked token attempted for user: {}", userId);

// Suspicious activity
logger.warn("Multiple failed refresh attempts from user: {}", userId);
logger.warn("Old refresh token reused after rotation for user: {}", userId);
```

### Alerts

Set up alerts for:
- Multiple failed refresh attempts from same user
- Refresh tokens being revoked rapidly
- Expired refresh token accumulation (cleanup not working)

## Migration from Old System

If upgrading from single-token system:

1. **Add RefreshToken entity** ✓
2. **Create refresh_tokens table** ✓
3. **Add RefreshTokenService** ✓
4. **Update AuthResponse DTO** ✓
5. **Update JwtService (7 days)** ✓
6. **Add refresh endpoint** ✓
7. **Update login/register to issue both tokens** ✓
8. **Deploy backend**
9. **Update frontend to handle refresh tokens**
10. **Test token refresh flow**

**Backward compatibility:** Old access tokens continue to work until they expire (7 days). No forced logout required.

## Testing

### Unit Tests
```java
@Test
public void testRefreshTokenRotation() {
    User user = createTestUser();
    RefreshToken token1 = refreshTokenService.createToken(user);

    RefreshToken token2 = refreshTokenService.rotateToken(token1.getToken());

    assertThat(token1.isRevoked()).isTrue();
    assertThat(token2.isValid()).isTrue();
    assertThat(token1.getToken()).isNotEqualTo(token2.getToken());
}

@Test
public void testRefreshTokenExpiration() {
    RefreshToken expiredToken = new RefreshToken(
        user, UUID.randomUUID().toString(),
        Instant.now().minusSeconds(1)  // Expired
    );

    assertThrows(UnauthorizedException.class,
        () -> refreshTokenService.validateToken(expiredToken.getToken()));
}

@Test
public void testTokenRevocation() {
    RefreshToken token = refreshTokenService.createToken(user);
    refreshTokenService.revokeToken(token.getToken());

    assertThrows(UnauthorizedException.class,
        () -> refreshTokenService.validateToken(token.getToken()));
}
```

### Integration Tests
```java
@Test
public void testRefreshEndpoint() {
    // 1. Login
    AuthResponse auth = loginUser();

    // 2. Refresh
    TokenRefreshResponse refreshed = refreshToken(auth.refreshToken);

    // 3. Verify new tokens work
    assertThat(refreshed.accessToken).isNotBlank();
    assertThat(refreshed.refreshToken).isNotEqualTo(auth.refreshToken);  // Rotated
}
```
