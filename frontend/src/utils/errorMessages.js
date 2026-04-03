/**
 * Error messages mapped by HTTP status code
 *
 * IMPORTANT: Keep these messages synchronized with backend GlobalExceptionHandler
 * Backend: backend/src/main/java/com/studenttracker/backend/exception/GlobalExceptionHandler.java
 *
 * If you modify these messages, update the backend handler as well to maintain consistency.
 */

export const ERROR_MESSAGES = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Authentication failed. Please try again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data. Please try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An unexpected error occurred. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
};

export const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again.';

/**
 * Messages that are safe to show to the user (not security-sensitive)
 * These are typically validation or business logic errors
 */
export const USER_FRIENDLY_ERROR_KEYWORDS = [
  'Too many',
  'rate',
  'already exists',
  'not found',
  'conflicts',
];
