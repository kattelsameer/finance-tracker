import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login if not authenticated
    await page.waitForURL(/\/(login|dashboard)/, { timeout: 10000 });
    
    // Check that the page loaded
    expect(page.url()).toMatch(/\/(login|dashboard)/);
  });

  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for login form elements
    const usernameInput = page.locator('input#username');
    const passwordInput = page.locator('input#password');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should load register page', async ({ page }) => {
    await page.goto('/register');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for register form elements
    const usernameInput = page.locator('input[name="username"]');
    const emailInput = page.locator('input[name="email"]');
    
    await expect(usernameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });
});
