import { Page, expect } from '@playwright/test';

export interface TestUser {
  username: string;
  email: string;
  password: string;
}

export const testUsers = {
  regular: {
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin@123',
  },
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin@123',
  },
} as const;

const API_V1_BASE_URL = process.env.PLAYWRIGHT_API_V1_BASE_URL || 'http://localhost:8080/api/v1';
const AUTH_COOKIE_NAME = process.env.PLAYWRIGHT_AUTH_COOKIE_NAME || 'auth_token';

/**
 * Register a new user via API
 */
export async function registerUser(page: Page, user: TestUser) {
  const response = await page.request.post(`${API_V1_BASE_URL}/auth/register`, {
    data: {
      username: user.username,
      email: user.email,
      password: user.password,
    },
  });
  
  // Check if registration was successful (201) or user already exists (409 conflict)
  if (response.status() !== 201 && response.status() !== 409) {
    throw new Error(`Registration failed with status ${response.status()}`);
  }
}

/**
 * Login with credentials
 */
export async function login(page: Page, usernameOrEmail: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input#username', usernameOrEmail);
  await page.fill('input#password', password);
  
  // SPA navigation: wait for URL change instead of full navigation
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard)?$/, { timeout: 15000 });
  
  // Check if we're on an authenticated page
  const currentUrl = page.url();
  if (currentUrl.endsWith('/login')) {
    // Still on login page - login failed
    throw new Error(`Login failed - still on login page after submitting credentials`);
  }
  
  // Successfully logged in - we're on dashboard or home page
  return undefined;
}

/**
 * Logout the current user
 */
export async function logout(page: Page) {
  // Click logout button (could be in different places - desktop vs mobile)
  const logoutButton = page.locator('button:has-text("Logout")').first();
  await logoutButton.click();
  
  // Wait for redirect to login
  await page.waitForURL('/login');
  
  // Verify JWT cookie is removed
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name === AUTH_COOKIE_NAME);
  expect(authCookie).toBeUndefined();
}

/**
 * Setup authenticated page with existing user
 * Registers user via API if they don't exist, then logs in via UI
 */
export async function setupAuthenticatedPage(page: Page, user: TestUser = testUsers.regular) {
  // Register user via API (ignore if already exists)
  try {
    await registerUser(page, user);
  } catch (error) {
    // User may already exist, continue to login
    console.log('Registration skipped, user may already exist');
  }
  
  // Login via UI
  await login(page, user.username, user.password);
  
  return page;
}

/**
 * Get CSRF token from cookies
 */
export async function getCsrfToken(page: Page): Promise<string | undefined> {
  const cookies = await page.context().cookies();
  const csrfCookie = cookies.find(c => c.name === 'XSRF-TOKEN');
  return csrfCookie?.value;
}

/**
 * Navigate to a protected route (requires authentication)
 */
export async function navigateToProtectedRoute(page: Page, route: string) {
  await page.goto(route);
  
  // Should not redirect to login if authenticated
  await expect(page).not.toHaveURL('/login');
}
