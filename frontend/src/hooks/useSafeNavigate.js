import { useNavigate } from 'react-router-dom';
import { safeNavigate, ALLOWED_INTERNAL_ROUTES } from '../utils/redirectValidator';
import { logError } from '../utils/logger';

/**
 * Custom hook that provides safe navigation with redirect URL validation
 * Prevents open redirect vulnerabilities by validating URLs against an allowlist
 *
 * @param {string[]} allowlist - Optional custom allowlist (defaults to ALLOWED_INTERNAL_ROUTES)
 * @returns {Function} Safe navigate function
 *
 * @example
 * const navigate = useSafeNavigate();
 * // Safe - internal route
 * navigate('/home');
 *
 * // Unsafe - will throw error
 * navigate('https://evil.com');
 */
export const useSafeNavigate = (allowlist = ALLOWED_INTERNAL_ROUTES) => {
  const navigateFn = useNavigate();

  return (url) => {
    try {
      safeNavigate(url, navigateFn, allowlist);
    } catch (error) {
      logError('Navigation', 'Blocked unsafe redirect', error.message);
      // Don't navigate - silently fail to prevent user confusion
      // Optionally show an error toast/notification here
    }
  };
};

export default useSafeNavigate;
