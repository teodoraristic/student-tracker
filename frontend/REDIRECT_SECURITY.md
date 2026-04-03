# Redirect Security Guide

This document explains how to safely handle URL redirects and prevent open redirect vulnerabilities in the application.

## Overview

An **open redirect vulnerability** occurs when an application redirects users to a URL provided by user input without proper validation. Attackers can exploit this to:
- Phish users by redirecting them to malicious sites
- Create deceptive URLs that appear to come from your app
- Bypass security checks

## Protection Mechanism

The application includes a `redirectValidator` utility that validates all redirect URLs against an **allowlist** of safe internal routes.

### Allowed Routes

By default, only these routes are permitted:
- `/` - Landing page
- `/home` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/subjects` - Subjects list
- `/calendar` - Calendar view
- `/planner` - Weekly planner
- `/study` - Study room
- `/profile` - User profile
- `/subjects/:id` - Subject details (dynamic)

**External URLs are always blocked** - users can only be redirected within the application.

## Implementation

### Option 1: Using the Custom Hook (Recommended)

For React components, use the `useSafeNavigate` hook:

```jsx
import { useSafeNavigate } from '../hooks/useSafeNavigate';

function MyComponent() {
  const navigate = useSafeNavigate();

  const handleClick = () => {
    navigate('/home'); // ✅ Safe - internal route
  };

  return <button onClick={handleClick}>Go Home</button>;
}
```

### Option 2: Direct Validation

For non-React code or when you need more control:

```javascript
import { isValidRedirectUrl, safeNavigate } from '../utils/redirectValidator';

// Just validate
if (isValidRedirectUrl(url)) {
  navigate(url);
}

// Or use the safe wrapper
try {
  safeNavigate(url, navigate);
} catch (error) {
  console.error('Invalid redirect:', error.message);
}
```

## Usage Examples

### Safe Redirects (Allowed)
```javascript
navigate('/home');
navigate('/subjects/42');
navigate('/profile');
```

### Blocked Redirects (Prevented)
```javascript
navigate('https://evil.com');              // ❌ External URL
navigate('javascript:alert("xss")');       // ❌ JavaScript protocol
navigate('data:text/html,...');            // ❌ Data URL
navigate('/admin');                        // ❌ Not in allowlist
```

## Dynamic Redirects from Query Parameters

If you need to redirect based on a query parameter (e.g., `?redirect=/home`):

```javascript
import { useSearchParams } from 'react-router-dom';
import { isValidRedirectUrl } from '../utils/redirectValidator';
import { useSafeNavigate } from '../hooks/useSafeNavigate';

function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useSafeNavigate();

  const handleLoginSuccess = () => {
    const redirectUrl = searchParams.get('redirect');

    if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
      navigate(redirectUrl);
    } else {
      navigate('/home'); // Default fallback
    }
  };

  return <div>...</div>;
}
```

## Adding New Routes

When adding new routes to the application:

1. **Add the route to the router** in `src/App.jsx`
2. **Update the allowlist** in `src/utils/redirectValidator.js`:

```javascript
const ALLOWED_INTERNAL_ROUTES = [
  '/',
  '/home',
  '/login',
  '/register',
  '/subjects',
  '/calendar',
  '/planner',
  '/study',
  '/profile',
  '/subjects/:id',
  '/new-page',  // ← Add your new route here
];
```

## Custom Allowlist

For specific components that need a different allowlist:

```javascript
import { useSafeNavigate } from '../hooks/useSafeNavigate';

function SpecialComponent() {
  const customAllowlist = ['/home', '/login'];
  const navigate = useSafeNavigate(customAllowlist);

  navigate('/home');  // ✅ Allowed
  navigate('/profile'); // ❌ Blocked (not in custom list)
}
```

## Testing

Run the test suite to verify redirect validation:

```bash
npm test -- redirectValidator.test.js
```

Tests verify:
- ✅ Valid internal routes are allowed
- ✅ Dynamic routes with parameters work
- ❌ External URLs are blocked
- ❌ JavaScript and data URLs are blocked
- ❌ Routes not in allowlist are rejected

## Migration Guide

If you're converting existing code to use safe redirects:

### Before
```javascript
const navigate = useNavigate();
navigate(userProvidedUrl);  // ❌ Vulnerable
```

### After
```javascript
import { useSafeNavigate } from '../hooks/useSafeNavigate';

const navigate = useSafeNavigate();
navigate(userProvidedUrl);  // ✅ Safe - will only allow whitelisted routes
```

## Debugging

If a redirect is blocked, you'll see an error in the browser console:

```
Navigation blocked: Redirect to 'https://evil.com' is not allowed
```

This indicates:
1. The URL is not in the allowlist, or
2. The URL is external (which is always blocked)

Check `redirectValidator.js` to verify the route is in `ALLOWED_INTERNAL_ROUTES`.

## References

- [OWASP - Open Redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- [CWE-601: URL Redirection to Untrusted Site](https://cwe.mitre.org/data/definitions/601.html)
