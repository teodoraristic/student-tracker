# Error Handling Guide

This document explains how error handling works in the application. All errors are caught and converted to generic user-friendly messages, while detailed errors are logged server-side only.

## Architecture

### Frontend Error Flow
1. **API Call** → Axios interceptor catches all errors
2. **Axios Interceptor** → Calls `handleRequestError()` to get user message
3. **Component** → Uses `useErrorHandler()` hook to display message
4. **Logging** → Detailed errors logged in development mode only

### Backend Error Flow
1. **Exception Thrown** → GlobalExceptionHandler catches it
2. **Logging** → Full stack trace logged with SLF4J
3. **Response** → Generic message sent to client (no sensitive details)

## Usage Patterns

### Pattern 1: Using the Hook (Recommended)

```javascript
import { useErrorHandler } from "../hooks/useErrorHandler";

export default function MyComponent() {
  const { handleError } = useErrorHandler();
  const [error, setError] = useState("");

  const handleAction = async () => {
    try {
      await someApiCall();
    } catch (err) {
      // Error is automatically converted to user-friendly message
      const userMessage = handleError(err, 'MyComponent');
      setError(userMessage);
    }
  };

  return (
    <div>
      {error && <div style={s.errorMsg}>{error}</div>}
      {/* component JSX */}
    </div>
  );
}
```

### Pattern 2: Direct Error Handler (Less Common)

```javascript
import { handleRequestError } from "../utils/errorHandler";

try {
  await someApiCall();
} catch (err) {
  const message = handleRequestError(err);
  setError(message);
}
```

### Pattern 3: Axios Interceptor (Automatic)

The axios instance automatically attaches `error.userMessage` to all rejected promises:

```javascript
try {
  await api.post('/endpoint', data);
} catch (err) {
  // err.userMessage is already set by interceptor
  setError(err.userMessage || 'An error occurred');
}
```

## Error Messages Shown to Users

These are the only messages users see:

| Status | Message |
|--------|---------|
| 400 | Invalid request. Please check your input and try again. |
| 401 | Your session has expired. Please log in again. |
| 403 | You do not have permission to perform this action. |
| 404 | The requested resource was not found. |
| 409 | This action conflicts with existing data. Please try again. |
| 429 | Too many requests. Please wait a moment and try again. |
| 500 | An unexpected error occurred. Please try again later. |
| 503 | The service is temporarily unavailable. Please try again later. |
| Network Error | Network connection error. Please check your internet and try again. |

**Exception:** Rate limiting errors (e.g., "Too many password resets") are shown as-is because they're informational, not security-sensitive.

## Backend Error Logging

All errors are logged server-side with full details:

```
[ERROR] Unexpected error occurred
java.lang.NullPointerException: User not found
  at UserService.getUser(UserService.java:45)
  at UserController.getUserProfile(UserController.java:22)
  ...
```

Check logs in:
- **Development:** Console output or `logs/` directory
- **Production:** Application logging service (Sentry, DataDog, etc.)

## Common Scenarios

### Login Failure
```javascript
try {
  await login(email, password);
} catch (err) {
  // Shows: "Your session has expired. Please log in again." (401)
  // Or: "Invalid request..." (400)
  const message = handleError(err, 'LoginPage');
  setError(message);
}
```

### Network Error
```javascript
try {
  await fetchData();
} catch (err) {
  // Shows: "Network connection error. Please check your internet..."
  // (when no response from server)
  const message = handleError(err, 'DataFetch');
  setError(message);
}
```

### Rate Limited
```javascript
try {
  await changePassword(current, newPass);
} catch (err) {
  // Shows: "Too many password reset attempts. Try again in 58 minutes."
  // (actual message from backend - informational, not sensitive)
  const message = handleError(err, 'PasswordChange');
  setError(message);
}
```

## Updating Existing Components

When updating components to follow this pattern:

1. **Remove** `console.error()` and old error handling
2. **Import** the `useErrorHandler` hook
3. **Call** `handleError(err, 'ComponentName')` in catch blocks
4. **Display** the returned message to the user

### Before
```javascript
catch (err) {
  console.error("Failed to load data:", err);
  setError("Something went wrong");
}
```

### After
```javascript
const { handleError } = useErrorHandler();

// In catch block:
catch (err) {
  const userMessage = handleError(err, 'ComponentName');
  setError(userMessage);
}
```

## Testing Error Handling

To test error responses:

1. **Network Error:** Disconnect internet and make a request
2. **401 Unauthorized:** Token expires or is invalid
3. **Rate Limit:** Make 4+ password reset requests within 1 hour
4. **Server Error:** Check backend logs for detailed error

All should show generic messages to the user, with details in server logs.

## Security Benefits

✅ **No Information Disclosure** - Users can't identify technologies or internal structure
✅ **No SQL Injection Clues** - Database errors hidden
✅ **No Authentication Bypass** - Cryptic errors prevent account enumeration
✅ **No Path Disclosure** - File paths never shown
✅ **Rate Limit Visibility** - Users informed when hitting limits (necessary for UX)

## Logging in Development

To see detailed errors in development:
- Browser DevTools Console (error.userMessage attached)
- Browser Network tab (response body)
- Server logs (full stack traces)

Never expose server logs to production!
