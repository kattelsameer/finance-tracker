import { Page, expect } from '@playwright/test';

export interface TestUser {
  username: string;
  email: string;
  password: string;
}

export const testUsers = {
  regular: {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'Test123456789',
  },
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin123456789',
  },
} as const;

/**
 * Register a new user
 */
export async function registerUser(page: Page, user: TestUser) {
  await page.goto('/register');
  
  await page.fill('input[name="username"]', user.username);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirmPassword"]', user.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard or login
  await page.waitForURL(/\/(dashboard|login)/);
}

/**
 * Login with credentials
 */
export async function login(page: Page, usernameOrEmail: string, password: string) {
  await page.goto('/login');
  
  await page.fill('input#username', usernameOrEmail);
  await page.fill('input#password', password);
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard');
  
  // Verify JWT cookie is set
  const cookies = await page.context().cookies();
  const jwtCookie = cookies.find(c => c.name === 'jwt');
  expect(jwtCookie).toBeDefined();
  
  return jwtCookie;
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
  const jwtCookie = cookies.find(c => c.name === 'jwt');
  expect(jwtCookie).toBeUndefined();
}

/**
 * Setup authenticated page with existing user
 */
export async function setupAuthenticatedPage(page: Page, user: TestUser = testUsers.regular) {
  // Try to login, if it fails, register first
  await page.goto('/login');
  await page.fill('input#username', user.username);
  await page.fill('input#password', user.password);
  await page.click('button[type="submit"]');
  
  // Check if login succeeded or if we need to register
  try {
    await page.waitForURL('/dashboard', { timeout: 3000 });
  } catch {
    // Login failed, try to register
    await registerUser(page, user);
    // Now login again
    await login(page, user.email, user.password);
  }
  
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
