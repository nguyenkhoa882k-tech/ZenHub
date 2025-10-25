/**
 * Debug Configuration
 * Centralized control for logging across the app
 */

export const DEBUG_CONFIG = {
  // General app debugging
  ENABLE_CONSOLE_LOGS: __DEV__,

  // Service-specific debugging
  ENABLE_DATABASE_LOGS: false,
  ENABLE_ADS_LOGS: false,
  ENABLE_STORAGE_LOGS: false,
  ENABLE_NOTES_LOGS: false,

  // Network and API debugging
  ENABLE_NETWORK_LOGS: __DEV__,

  // Performance debugging
  ENABLE_PERFORMANCE_LOGS: false,

  // Error logging (always enabled in dev)
  ENABLE_ERROR_LOGS: true,
};

/**
 * Conditional logger wrapper
 */
export const logger = {
  log: (category, ...args) => {
    if (!DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) return;

    switch (category) {
      case 'DATABASE':
        DEBUG_CONFIG.ENABLE_DATABASE_LOGS && console.log('[DB]', ...args);
        break;
      case 'ADS':
        DEBUG_CONFIG.ENABLE_ADS_LOGS && console.log('[ADS]', ...args);
        break;
      case 'STORAGE':
        DEBUG_CONFIG.ENABLE_STORAGE_LOGS && console.log('[STORAGE]', ...args);
        break;
      case 'NOTES':
        DEBUG_CONFIG.ENABLE_NOTES_LOGS && console.log('[NOTES]', ...args);
        break;
      case 'NETWORK':
        DEBUG_CONFIG.ENABLE_NETWORK_LOGS && console.log('[NET]', ...args);
        break;
      case 'PERFORMANCE':
        DEBUG_CONFIG.ENABLE_PERFORMANCE_LOGS && console.log('[PERF]', ...args);
        break;
      default:
        console.log('[APP]', ...args);
    }
  },

  error: (...args) => {
    if (DEBUG_CONFIG.ENABLE_ERROR_LOGS) {
      console.error('[ERROR]', ...args);
    }
  },

  warn: (...args) => {
    if (DEBUG_CONFIG.ENABLE_CONSOLE_LOGS) {
      console.warn('[WARN]', ...args);
    }
  },
};

export default DEBUG_CONFIG;
