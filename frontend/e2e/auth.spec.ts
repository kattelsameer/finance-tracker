import { test, expect } from '@playwright/test';
import { registerUser, login, logout, testUsers, getCsrfToken } from './fixtures/auth';

test.describe('Authentication Flow', () => {
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
      password: 'Test123456789',
    };

    await registerUser(page, newUser);
    
    // Should redirect to dashboard or login after registration
    expect(page.url()).toMatch(/\/(dashboard|login)/);
    
    // If redirected to login, should be able to login
    if (page.url().includes('/login')) {
      await login(page, newUser.username, newUser.password);
      expect(page.url()).toContain('/dashboard');
    }
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input#username', testUsers.regular.username);
    await page.fill('input#password', testUsers.regular.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or home (root path)
    await page.waitForURL(/\/(dashboard)?$/, { timeout: 10000 });
    
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
    
    // Should show error message
    const errorMessage = page.locator('text=/invalid.*credentials/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should handle CSRF token correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Get initial CSRF token
    const csrfToken = await getCsrfToken(page);
    expect(csrfToken).toBeDefined();
    
    // Login should work with CSRF token
    await page.fill('input#username', testUsers.regular.username);
    await page.fill('input#password', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await login(page, testUsers.regular.username, testUsers.regular.password);
    
    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Logout
    await logout(page);
    
    // Should redirect to login
    expect(page.url()).toContain('/login');
    
    // JWT cookie should be removed
    const cookies = await page.context().cookies();
    const jwtCookie = cookies.find(c => c.name === 'jwt');
    expect(jwtCookie).toBeUndefined();
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
    
    // Should still be on dashboard
    expect(page.url()).toContain('/dashboard');
    
    // JWT cookie should still exist
    const cookies = await page.context().cookies();
    const jwtCookie = cookies.find(c => c.name === 'jwt');
    expect(jwtCookie).toBeDefined();
  });

  test('should validate password requirements on registration', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'short'); // Too short
    await page.fill('input[name="confirmPassword"]', 'short');
    
    await page.click('button[type="submit"]');
    
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
    
    await page.click('button[type="submit"]');
    
    // Should stay on registration page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/register');
    
    // Should show validation error
    const errorMessage = page.locator('text=/password.*match/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('should handle account lockout after failed attempts', async ({ page }) => {
    await page.goto('/login');
    
    const wrongPassword = 'WrongPassword123';
    
    // Attempt 5 failed logins
    for (let i = 0; i < 5; i++) {
      await page.fill('input#username', testUsers.regular.username);
      await page.fill('input#password', wrongPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }
    
    // 6th attempt should show account locked message
    await page.fill('input#username', testUsers.regular.username);
    await page.fill('input#password', wrongPassword);
    await page.click('button[type="submit"]');
    
    // Should show account locked message
    const lockoutMessage = page.locator('text=/account.*locked/i');
    await expect(lockoutMessage).toBeVisible({ timeout: 3000 });
  });
});
