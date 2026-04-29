/**
 * Logger utility for environment-aware logging
 * In production, errors should be sent to error tracking service (Sentry, LogRocket, etc.)
 * In development, logs are printed to console for debugging
 */

export const logger = {
  /**
   * Log errors with environment awareness
   * @param {string} message - Error message
   * @param {Error|any} error - Error object
   * @param {object} context - Additional context data
   */
  error: (message, error = null, context = {}) => {
    const errorData = {
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || error,
      context,
      url: window.location.href,
    };

    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, error, context);
    } else {
      // Send to error tracking service
      // Example: Sentry.captureException(error, { contexts: { app: context } });
      // For now, silently log in production to avoid exposing errors
    }
  },

  /**
   * Log warnings with environment awareness
   * @param {string} message - Warning message
   * @param {object} context - Additional context data
   */
  warn: (message, context = {}) => {
    if (import.meta.env.DEV) {
      console.warn(`[WARN] ${message}`, context);
    }
  },

  /**
   * Log info messages (development only)
   * @param {string} message - Info message
   * @param {object} data - Additional data
   */
  info: (message, data = {}) => {
    if (import.meta.env.DEV) {
      console.info(`[INFO] ${message}`, data);
    }
  },

  /**
   * Log debug information (development only)
   * @param {string} message - Debug message
   * @param {any} data - Debug data
   */
  debug: (message, data = {}) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};

export default logger;
