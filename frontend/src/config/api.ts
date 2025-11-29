// Use empty string for Docker (nginx proxy) or localhost:8080 for local development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : 'http://localhost:8080';
export const API_VERSION = '/api/v1';
export const API_URL = `${API_BASE_URL}${API_VERSION}`;

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    CSRF_TOKEN: '/auth/csrf-token',
  },
  // Accounts
  ACCOUNTS: '/accounts',
  ACCOUNT_TYPES: '/accounts/types',
  // Categories
  CATEGORIES: '/categories',
  // Transactions
  TRANSACTIONS: '/transactions',
  // Tags
  TAGS: '/tags',
  // Budgets
  BUDGETS: '/budgets',
} as const;
