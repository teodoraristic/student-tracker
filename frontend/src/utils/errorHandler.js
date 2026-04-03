/**
 * Error handler utility
 * Returns generic user-friendly error messages while logging detailed errors
 *
 * Error messages are centralized in errorMessages.js to maintain sync with backend
 */

import { logError } from './logger';
import { ERROR_MESSAGES, DEFAULT_ERROR_MESSAGE, USER_FRIENDLY_ERROR_KEYWORDS } from './errorMessages';

/**
 * Get a generic error message for the user
 * Logs detailed error information server-side
 *
 * @param {Error|AxiosError} error - The error object
 * @param {string} context - Context where error occurred (for logging)
 * @returns {string} Generic user-friendly error message
 */
export const getUserFriendlyError = (error, context = 'Unknown') => {
  let statusCode = null;
  let errorData = null;

  // Handle axios errors
  if (error.response) {
    statusCode = error.response.status;
    errorData = error.response.data;
  } else if (error.status) {
    statusCode = error.status;
  }

  // Log detailed error server-side
  logError(context, `HTTP ${statusCode || 'Unknown'}`, {
    message: error.message,
    data: errorData,
    stack: error.stack,
  });

  // Return generic message based on status code
  if (statusCode && ERROR_MESSAGES[statusCode]) {
    return ERROR_MESSAGES[statusCode];
  }

  // For specific error types (rate limiting, validation, etc.)
  if (errorData?.message) {
    // Still log it, but check if it's already a generic message
    const message = String(errorData.message);

    // Check if this is a user-friendly error message we can display
    const isSafeToShow = USER_FRIENDLY_ERROR_KEYWORDS.some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isSafeToShow) {
      return message;
    }

    // For other API-provided messages, use generic fallback
    return DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
};

/**
 * Handle network or request errors
 * Distinguishes between client errors, server errors, and network errors
 *
 * @param {Error} error - The error object
 * @returns {string} Appropriate error message
 */
export const handleRequestError = (error) => {
  if (!error.response) {
    // Network error - no response from server
    logError('NetworkError', 'Request failed', {
      message: error.message,
      stack: error.stack,
    });
    return 'Network connection error. Please check your internet and try again.';
  }

  // Has response - use HTTP status-based messaging
  return getUserFriendlyError(error, 'RequestError');
};

export default {
  getUserFriendlyError,
  handleRequestError,
};
