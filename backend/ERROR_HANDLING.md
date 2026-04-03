# Backend Error Handling Guide

## Overview

All exceptions are caught by `GlobalExceptionHandler` and logged server-side with full details. Only generic messages are sent to clients to prevent information disclosure.

## Error Handling Flow

```
Exception Thrown
    ↓
@ExceptionHandler catches it
    ↓
Logs full details (stack trace, message, context)
    ↓
Returns generic error response to client
```

## Exception Types and Messages

### Custom Exceptions

#### NotFoundException (404)
**Client sees:** "The requested resource was not found."
**Server logs:** Detailed message about which resource

```java
throw new NotFoundException("User with id 123 not found");
// Client: 404 - "The requested resource was not found."
// Server: ERROR - "Not found error: User with id 123 not found"
```

#### ConflictException (409)
**Client sees:** "This action conflicts with existing data. Please try again."
**Server logs:** Details about the conflict

```java
throw new ConflictException("Email already registered");
// Client: 409 - "This action conflicts with existing data..."
// Server: WARN - "Conflict error: Email already registered"
```

#### ForbiddenException (403)
**Client sees:** "You do not have permission to perform this action."
**Server logs:** Details about why access was denied

```java
throw new ForbiddenException("User role VIEWER cannot delete subjects");
// Client: 403 - "You do not have permission..."
// Server: WARN - "Forbidden access: User role VIEWER cannot delete subjects"
```

#### UnauthorizedException (401)
**Client sees:** Generic message OR rate limit message (if applicable)
**Server logs:** Full details

```java
// Generic case
throw new UnauthorizedException("Invalid password");
// Client: 401 - "Authentication failed. Please try again."
// Server: WARN - "Unauthorized access: Invalid password"

// Rate limit case (message shown to user)
throw new UnauthorizedException("Too many password reset attempts. Try again in 58 minutes.");
// Client: 401 - "Too many password reset attempts..." (shown to user)
// Server: WARN - "Unauthorized access: Too many password reset attempts..."
```

### Standard Exceptions

#### MethodArgumentNotValidException (400)
**Client sees:** Validation error messages (safe - just field names)
**Server logs:** All validation errors

```
Client: {"status":400, "message":"Validation failed", "errors":["name is required", "email format is invalid"]}
Server: WARN - Validation failed: [name is required, email format is invalid]
```

#### IllegalArgumentException (400)
**Client sees:** "Invalid request. Please check your input and try again."
**Server logs:** Full exception message

#### Generic Exception (500)
**Client sees:** "An unexpected error occurred. Please try again later."
**Server logs:** Full stack trace

```java
try {
  // some operation that throws RuntimeException
} catch (RuntimeException e) {
  // Caught by GlobalExceptionHandler
}
// Client: 500 - "An unexpected error occurred. Please try again later."
// Server: ERROR - Full stack trace with context
```

## Logging Levels

| Level | When to Use | Example |
|-------|-----------|---------|
| **WARN** | Expected errors (not found, conflict, invalid input) | User enters wrong password |
| **ERROR** | Unexpected errors (shouldn't happen in normal operation) | Database connection drops |

```java
logger.warn("Not found error: {}", ex.getMessage());     // ✅ Expected
logger.error("Unexpected error occurred", ex);            // ✅ Unexpected
```

## Implementation

### GlobalExceptionHandler
Located at: `src/main/java/com/studenttracker/backend/exception/GlobalExceptionHandler.java`

All exception handlers follow this pattern:

```java
@ExceptionHandler(CustomException.class)
public ResponseEntity<ApiError> handleCustom(CustomException ex) {
    // 1. Log the detailed error
    logger.warn("Detailed error message: {}", ex.getMessage());

    // 2. Return generic message to client
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiError(400, "Generic user-friendly message"));
}
```

### Special Case: Rate Limiting

Rate limit errors ARE shown to the user because they're informational:

```java
@ExceptionHandler(UnauthorizedException.class)
public ResponseEntity<ApiError> handleUnauthorized(UnauthorizedException ex) {
    logger.warn("Unauthorized access: {}", ex.getMessage());

    // Special case: show rate limit messages
    if (ex.getMessage().contains("Too many") || ex.getMessage().contains("rate")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiError(401, ex.getMessage()));  // Show to user
    }

    // Generic message for other auth errors
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ApiError(401, "Authentication failed. Please try again."));
}
```

## Logging Best Practices

### ✅ Do Log These

```java
// User input errors (helpful for debugging)
logger.warn("Login attempt with non-existent email: {}", email);

// Database issues (important for operations team)
logger.error("Database connection timeout", exception);

// Rate limiting (user trying too hard)
logger.warn("Too many requests from IP: {}", ipAddress);

// Authorization failures (security relevant)
logger.warn("Unauthorized access attempt: {}", reason);
```

### ❌ Don't Log Sensitive Data

```java
// ❌ WRONG - logs password!
logger.warn("Login failed: email={}, password={}", email, password);

// ✅ RIGHT - never log passwords
logger.warn("Login failed for email: {}", email);

// ❌ WRONG - logs full query with user input
logger.warn("Query failed: {}", sqlQuery);

// ✅ RIGHT - log without sensitive data
logger.warn("Query failed for table: users");

// ❌ WRONG - logs personal info
logger.warn("User {} requested delete", user.getFullName());

// ✅ RIGHT - use IDs
logger.warn("User {} requested delete", user.getId());
```

## Error Response Format

All error responses follow this format:

```json
{
  "status": 400,
  "message": "Error message here",
  "errors": ["field-specific error 1", "field-specific error 2"]  // Optional
}
```

### Examples

```json
// Generic 404
{
  "status": 404,
  "message": "The requested resource was not found."
}

// Validation error (shows field names - safe)
{
  "status": 400,
  "message": "Validation failed",
  "errors": ["email: Email format is invalid", "password: Must be at least 6 characters"]
}

// Rate limit (message is informational)
{
  "status": 401,
  "message": "Too many password reset attempts. Please try again in 58 minutes."
}
```

## Server Logs

### Development Environment
Logs are printed to console. Full stack traces visible for debugging.

### Production Environment
Configure your logging service (Sentry, DataDog, ELK, etc.) to:
- Capture all ERROR and WARN level logs
- Alert on ERROR level
- Include context (user ID, request ID, timestamp)
- Never log sensitive data (passwords, tokens)
- Retain logs for compliance (usually 30-90 days)

Example Sentry configuration:
```yaml
sentry:
  dsn: https://xxxx@sentry.io/yyyy
  environment: production
  traces-sample-rate: 0.1
  log-level: warn  # Only capture WARN and ERROR
```

## Testing Error Handling

1. **Trigger 404:** Request non-existent resource
   - Client: Generic "not found" message
   - Logs: Full path and request details

2. **Trigger 401:** Use invalid/expired token
   - Client: Redirected to login (frontend handles)
   - Logs: "Unauthorized access" with attempt details

3. **Trigger 409:** Try to create duplicate email
   - Client: "Conflicts with existing data"
   - Logs: Which email caused conflict

4. **Trigger 500:** Call endpoint with null dependency
   - Client: "Unexpected error occurred"
   - Logs: Full NPE stack trace

## Monitoring Checklist

- [ ] No sensitive data (passwords, PII) in logs
- [ ] All exceptions mapped to generic responses
- [ ] Rate limit errors shown to users (when applicable)
- [ ] Full stack traces only in server logs
- [ ] WARN level for expected errors
- [ ] ERROR level for unexpected errors
- [ ] Logging service configured for production
- [ ] Alerts set up for ERROR level logs
