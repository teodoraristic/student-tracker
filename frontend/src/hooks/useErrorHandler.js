import { useCallback } from 'react';
import { getUserFriendlyError } from '../utils/errorHandler';

/**
 * Hook for consistent error handling in components
 * Automatically converts errors to user-friendly messages
 *
 * @returns {Object} Object with handleError method
 *
 * @example
 * const { handleError } = useErrorHandler();
 * try {
 *   await someApiCall();
 * } catch (err) {
 *   const message = handleError(err, 'ComponentName');
 *   setError(message);
 * }
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error, context = 'Unknown') => {
    // Extract user-friendly message from error
    const userMessage = error.userMessage || getUserFriendlyError(error, context);
    return userMessage;
  }, []);

  return { handleError };
};

export default useErrorHandler;
