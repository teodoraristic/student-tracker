/**
 * Simple error logging utility
 * In development, logs to console; in production, can be extended to send to logging service
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logs an error with context
 * @param {string} context - Context/module where error occurred
 * @param {string} message - Error message
 * @param {Error|any} error - Error object
 */
export const logError = (context, message, error = null) => {
  const timestamp = new Date().toISOString();
  const errorData = error instanceof Error ? error.message : String(error);

  if (isDevelopment) {
    // In development, log details to console
    console.group(`❌ [${context}] ${message}`);
    console.log(`Time: ${timestamp}`);
    if (errorData) {
      console.error('Details:', errorData);
    }
    if (error?.stack) {
      console.log('Stack:', error.stack);
    }
    console.groupEnd();
  } else {
    // In production, you could send to a logging service
    // Example: sendToSentry({ context, message, error: errorData, timestamp });
    // For now, silently log in production
  }
};

/**
 * Logs a message with context (for debugging)
 * Only logs in development mode
 * @param {string} context - Context/module
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
export const logDebug = (context, message, data = null) => {
  if (isDevelopment) {
    console.log(`📝 [${context}] ${message}`, data ? data : '');
  }
};

export default {
  logError,
  logDebug,
};
