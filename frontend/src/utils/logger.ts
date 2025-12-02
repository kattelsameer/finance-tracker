/**
 * Simple logger utility that respects environment settings.
 * In production, errors are still logged but other levels are suppressed.
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, ...args);
  },

  warn: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};
