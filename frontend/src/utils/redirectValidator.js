/**
 * Redirect validation utility to prevent open redirect vulnerabilities
 * Validates redirect URLs against an allowlist of safe routes
 */

import { logError } from './logger';

// Whitelist of allowed redirect paths (internal routes only)
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
  '/subjects/:id', // Dynamic route pattern
];

/**
 * Checks if a URL is an absolute external URL
 * @param {string} url - URL to check
 * @returns {boolean} true if URL is absolute/external
 */
const isAbsoluteUrl = (url) => {
  if (!url) return false;
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//');
};

/**
 * Converts a dynamic route pattern to a regex for matching
 * @param {string} pattern - Route pattern like '/subjects/:id'
 * @returns {RegExp} Regex that matches the pattern
 */
const patternToRegex = (pattern) => {
  const regexPattern = pattern
    .replace(/\//g, '\\/')
    .replace(/:[^/]+/g, '[^/]+'); // Replace :param with [^/]+ (matches anything except /)
  return new RegExp(`^${regexPattern}$`);
};

/**
 * Validates if a URL is safe to redirect to
 * Only allows internal app routes, blocks all external URLs and dangerous patterns
 *
 * @param {string} url - URL to validate
 * @param {string[]} allowlist - Optional custom allowlist of routes
 * @returns {boolean} true if URL is safe to redirect to
 */
export const isValidRedirectUrl = (url, allowlist = ALLOWED_INTERNAL_ROUTES) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmedUrl = url.trim();

  // Block absolute/external URLs
  if (isAbsoluteUrl(trimmedUrl)) {
    return false;
  }

  // Block javascript: and data: URLs
  if (trimmedUrl.toLowerCase().startsWith('javascript:') ||
      trimmedUrl.toLowerCase().startsWith('data:')) {
    return false;
  }

  // Check if URL matches any allowed route pattern
  return allowlist.some(route => {
    if (route.includes(':')) {
      // Dynamic route - use regex matching
      const regex = patternToRegex(route);
      return regex.test(trimmedUrl);
    } else {
      // Exact match for static routes
      return trimmedUrl === route;
    }
  });
};

/**
 * Safely redirects to a URL after validation
 * Throws error if redirect URL is not allowed
 *
 * @param {string} url - URL to redirect to
 * @param {Function} navigateFn - React Router navigate function
 * @param {string[]} allowlist - Optional custom allowlist
 * @throws {Error} If URL is not in allowlist
 */
export const safeNavigate = (url, navigateFn, allowlist = ALLOWED_INTERNAL_ROUTES) => {
  if (!isValidRedirectUrl(url, allowlist)) {
    logError("Redirect", "Attempted redirect to unauthorized URL", url);
    throw new Error(`Redirect to '${url}' is not allowed`);
  }
  navigateFn(url);
};

export default {
  isValidRedirectUrl,
  safeNavigate,
  ALLOWED_INTERNAL_ROUTES,
};
