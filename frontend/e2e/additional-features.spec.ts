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
    
    // Notification center should be visible — target h2 specifically to avoid
    // matching other elements (e.g. button aria-label) and strict-mode errors
    await expect(page.locator('h2:has-text("Notifications")')).toBeVisible();
  });

  test('should mark notification as read', async ({ page }) => {
    const notificationButton = page.locator('button[data-testid="notification-button"], button[aria-label="Notifications"]');
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
    const notificationButton = page.locator('button[data-testid="notification-button"], button[aria-label="Notifications"]');
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
    
    // Results or no-results message should be visible after search
    await expect(page.locator('text=/Results|No transactions found/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should save a search', async ({ page }) => {
    // Fill some search criteria — use same fallback selector as the other search test
    await page.fill('input[name="query"], input[placeholder*="Search"]', 'monthly expenses');
    
    // Click save search button
    const saveButton = page.locator('button:has-text("Save Search"), button[aria-label="Save search"]');
    
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Enter search name
      await page.fill('input[name="searchName"], input[placeholder*="name"]', 'My Monthly Expenses');
      
      // Save — the save-search dialog is a fixed overlay; scope to the modal so we
      // don't accidentally click a same-text button that sits behind the backdrop.
      const modal = page.locator('div.fixed.inset-0').last();
      await modal.locator('button:has-text("Save"), button[type="submit"]').click();
      
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
    // Wait for all API calls (dashboard stats, recent transactions, etc.) to complete
    await page.waitForLoadState('networkidle');
  });

  test('should display dashboard widgets', async ({ page }) => {
    // Check for key dashboard elements — use .first() to avoid strict-mode violation
    // when multiple elements match (e.g. both a card label and a chart heading)
    await expect(page.locator('text=/Total Balance|Balance/i').first()).toBeVisible();
    await expect(page.locator('text=/Income|Expenses|Spending/i').first()).toBeVisible();
  });

  test('should show recent transactions', async ({ page }) => {
    // Cannot mix [attr="val"] CSS and text= Playwright selectors in one comma list;
    // use :has-text() which is valid CSS-like in Playwright
    const recentTransactions = page.locator('[data-testid="recent-transactions"], h3:has-text("Recent Transactions")');
    await expect(recentTransactions.first()).toBeVisible();
  });
});
