import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage, testUsers } from './fixtures/auth';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page, testUsers.regular);
    await page.goto('/dashboard');
  });

  test('should open notification center', async ({ page }) => {
    // Click notification bell icon
    const notificationButton = page.locator('button[data-testid="notification-button"], button[aria-label="Notifications"]');
    await notificationButton.click();
    
    // Notification center should be visible
    await expect(page.locator('text=/Notifications/i')).toBeVisible();
  });

  test('should mark notification as read', async ({ page }) => {
    const notificationButton = page.locator('button[data-testid="notification-button"]');
    await notificationButton.click();
    
    // Find first unread notification if any
    const firstNotification = page.locator('[data-testid="notification-item"]').first();
    
    if (await firstNotification.isVisible()) {
      // Click mark as read button
      const markReadButton = firstNotification.locator('button[aria-label="Mark as read"]').first();
      
      if (await markReadButton.isVisible()) {
        await markReadButton.click();
        await page.waitForTimeout(500);
        
        // Notification should be marked as read (visual change)
        await expect(firstNotification).toHaveClass(/read|opacity/);
      }
    }
  });

  test('should mark all notifications as read', async ({ page }) => {
    const notificationButton = page.locator('button[data-testid="notification-button"]');
    await notificationButton.click();
    
    // Click "Mark all as read" button
    const markAllButton = page.locator('button:has-text("Mark all as read"), button[aria-label="Mark all as read"]');
    
    if (await markAllButton.isVisible()) {
      await markAllButton.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Advanced Search', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page, testUsers.regular);
    await page.goto('/search');
  });

  test('should perform advanced search with criteria', async ({ page }) => {
    // Fill search criteria
    await page.fill('input[name="query"], input[placeholder*="Search"]', 'test');
    
    // Select date range
    await page.fill('input[name="startDate"], input[type="date"]', '2025-01-01');
    
    // Select transaction type
    const typeSelect = page.locator('select[name="transactionType"]');
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('EXPENSE');
    }
    
    // Click search button
    await page.click('button[type="submit"], button:has-text("Search")');
    
    await page.waitForTimeout(1000);
    
    // Results should be visible
    await expect(page.locator('[data-testid="search-results"], .search-results')).toBeVisible();
  });

  test('should save a search', async ({ page }) => {
    // Fill some search criteria
    await page.fill('input[name="query"]', 'monthly expenses');
    
    // Click save search button
    const saveButton = page.locator('button:has-text("Save Search"), button[aria-label="Save search"]');
    
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Enter search name
      await page.fill('input[name="searchName"], input[placeholder*="name"]', 'My Monthly Expenses');
      
      // Save
      await page.click('button:has-text("Save"), button[type="submit"]');
      
      await page.waitForTimeout(500);
      
      // Saved search should appear in list
      await expect(page.locator('text=My Monthly Expenses')).toBeVisible();
    }
  });
});

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page, testUsers.regular);
    await page.goto('/settings');
  });

  test('should update user preferences', async ({ page }) => {
    // Change currency
    const currencySelect = page.locator('select[name="defaultCurrency"], select#currency');
    
    if (await currencySelect.isVisible()) {
      await currencySelect.selectOption('USD');
      
      // Save changes
      await page.click('button[type="submit"], button:has-text("Save")');
      
      await page.waitForTimeout(500);
      
      // Success message should appear
      await expect(page.locator('text=/saved|updated successfully/i')).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page, testUsers.regular);
    await page.goto('/dashboard');
  });

  test('should display dashboard widgets', async ({ page }) => {
    // Check for key dashboard elements
    await expect(page.locator('text=/Total Balance|Balance/i')).toBeVisible();
    await expect(page.locator('text=/Income|Expenses|Spending/i')).toBeVisible();
  });

  test('should show recent transactions', async ({ page }) => {
    const recentTransactions = page.locator('[data-testid="recent-transactions"], text=/Recent Transactions/i');
    await expect(recentTransactions).toBeVisible();
  });
});
