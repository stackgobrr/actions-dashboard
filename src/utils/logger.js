/**
 * Logger utility for consistent logging across the application
 * Only logs to console in development mode
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  /**
   * Log error messages
   * @param {string} message - Error message
   * @param {...any} args - Additional arguments to log
   */
  error: (message, ...args) => {
    if (isDevelopment) {
      console.error(message, ...args)
    }
    // Future: Add error tracking service integration here
    // e.g., Sentry, LogRocket, etc.
  },

  /**
   * Log warning messages
   * @param {string} message - Warning message
   * @param {...any} args - Additional arguments to log
   */
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(message, ...args)
    }
  },

  /**
   * Log info messages (development only)
   * @param {string} message - Info message
   * @param {...any} args - Additional arguments to log
   */
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(message, ...args)
    }
  },

  /**
   * Log debug messages (development only)
   * @param {string} message - Debug message
   * @param {...any} args - Additional arguments to log
   */
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(message, ...args)
    }
  }
}
