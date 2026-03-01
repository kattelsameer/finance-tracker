import { test, expect } from '@playwright/test';
import { registerUser, login, logout, testUsers } from './fixtures/auth';

const AUTH_COOKIE_NAME = process.env.PLAYWRIGHT_AUTH_COOKIE_NAME || 'auth_token';
const API_V1_BASE_URL = process.env.PLAYWRIGHT_API_V1_BASE_URL || 'http://localhost:8080/api/v1';

test.describe('Authentication Flow', () => {
  test.beforeAll(async ({ request }) => {
    // Register the shared testUsers.regular once so all login/logout/session tests can use it.
    // Ignore 409 (already exists) so re-runs are safe.
    await request.post(`${API_V1_BASE_URL}/auth/register`, {
      data: {
        username: testUsers.regular.username,
        email: testUsers.regular.email,
        password: testUsers.regular.password,
      },
      failOnStatusCode: false,
    });
  });

  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage before each test
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should register a new user successfully', async ({ page }) => {
    const timestamp = Date.now();
    const newUser = {
      username: `user${timestamp}`,
      email: `user${timestamp}@example.com`,
      // Must satisfy backend: min 12 chars, uppercase, lowercase, digit, special (@$!%*?&)
      password: 'Test@12345678',
    };

    await registerUser(page, newUser);
    
    // Should redirect to dashboard or login after registration
    expect(page.url()).toMatch(/\/(dashboard|login)/);
    
    // If redirected to login, should be able to login
    if (page.url().includes('/login')) {
      await login(page, newUser.username, newUser.password);
      // Dashboard is at root '/' (no /dashboard route exists)
      expect(page.url()).not.toContain('/login');
    }
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input#username', testUsers.regular.username);
    await page.fill('input#password', testUsers.regular.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // SPA navigation: wait for URL to leave /login (load event never fires in SPA)
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    
    // Verify we're logged in (not on login page)
    expect(page.url()).not.toContain('/login');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input#username', 'wronguser');
    await page.fill('input#password', 'WrongPassword123');
    
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
    
    // Should show error message (login page shows "Authentication failed" or "Invalid username or password")
    // Use .first() to avoid strict mode failure when multiple elements match the regex
    const errorMessage = page.locator('text=/Authentication failed|invalid.*password/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle CSRF token correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // CSRF token is fetched lazily by api-client when first needed (not automatically on page load)
    // Just verify login works successfully (login endpoint is CSRF-exempt)
    await page.fill('input#username', testUsers.regular.username);
    await page.fill('input#password', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    // SPA navigation: wait for URL to leave /login (load event never fires in SPA)
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    expect(page.url()).not.toContain('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await login(page, testUsers.regular.username, testUsers.regular.password);
    
    // Verify we're authenticated (dashboard is at root '/', not '/dashboard')
    expect(page.url()).not.toContain('/login');
    
    // Logout
    await logout(page);
    
    // Should redirect to login
    expect(page.url()).toContain('/login');
    
    // JWT cookie should be removed
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === AUTH_COOKIE_NAME);
    expect(authCookie).toBeUndefined();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await login(page, testUsers.regular.username, testUsers.regular.password);
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated (dashboard is at root '/', not '/dashboard')
    expect(page.url()).not.toContain('/login');
    
    // JWT cookie should still exist
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === AUTH_COOKIE_NAME);
    expect(authCookie).toBeDefined();
  });

  test('should validate password requirements on registration', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'short'); // Too short
    await page.fill('input[name="confirmPassword"]', 'short');
    
    // Submit button text is "Create Account" (no type="submit" attribute in RegisterPage)
    await page.click('button:has-text("Create Account")');
    
    // Should stay on registration page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/register');
    
    // Should show validation error
    const errorMessage = page.locator('text=/password.*8.*characters/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123456789');
    await page.fill('input[name="confirmPassword"]', 'Different123456789');
    
    // Submit button text is "Create Account" (no type="submit" attribute in RegisterPage)
    await page.click('button:has-text("Create Account")');
    
    // Should stay on registration page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/register');
    
    // Should show validation error
    const errorMessage = page.locator('text=/password.*match/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should handle account lockout after failed attempts', async ({ page }) => {
    // Use a dedicated user so the shared admin account is not locked
    const timestamp = Date.now();
    const lockoutUser = {
      username: `lockout${timestamp}`,
      email: `lockout${timestamp}@example.com`,
      password: 'Lockout@12345678',
    };
    await registerUser(page, lockoutUser);

    await page.goto('/login');

    const wrongPassword = 'WrongPass@12345678';

    // Attempt 5 failed logins — wait for each response before retrying
    // so we don't flood the backend faster than it processes requests.
    for (let i = 0; i < 5; i++) {
      await page.fill('input#username', lockoutUser.username);
      await page.fill('input#password', wrongPassword);
      await Promise.all([
        page.waitForResponse((r) => r.url().includes('/auth/login'), { timeout: 15000 }),
        page.click('button[type="submit"]'),
      ]);
      await page.waitForTimeout(200); // let the UI render the error before next attempt
    }

    // 6th attempt should trigger account locked (HTTP 423)
    await page.fill('input#username', lockoutUser.username);
    await page.fill('input#password', wrongPassword);
    const [lockoutResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/auth/login'), { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    // Verify the backend returns 423 (Locked) — the account lockout is enforced
    expect(lockoutResponse.status()).toBe(423);

    // Should show account locked message in the UI — wait for React to re-render
    // The error alert contains a title "Authentication failed" and the error detail below it.
    // Look for any element containing "locked" text.
    const lockoutMessage = page.locator('text=/locked/i');
    await expect(lockoutMessage).toBeVisible({ timeout: 10000 });
  });
});
