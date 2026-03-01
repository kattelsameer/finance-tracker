import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage, testUsers, createTestAccount } from './fixtures/auth';

// Run tests serially to avoid data-race issues between create/read/delete tests
test.describe.configure({ mode: 'serial' });

test.describe('Recurring Transactions', () => {
  test.beforeAll(async ({ browser }) => {
    // Ensure the test user exists and has at least one account
    const page = await browser.newPage();
    try {
      await setupAuthenticatedPage(page, testUsers.regular);
      // Wait for the React app to finish its initial API calls so the XSRF-TOKEN
      // cookie is issued by the server before we make any write request.
      await page.waitForLoadState('networkidle');
      await createTestAccount(page, 'Recurring E2E Account');
      // Create a second account so TRANSFER tests have a valid "Transfer To" option
      await createTestAccount(page, 'Recurring E2E Account 2');
    } catch (e) {
      console.error('beforeAll createTestAccount failed:', e);
    } finally {
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page, testUsers.regular);
    await page.goto('/recurring-transactions');
    await page.waitForLoadState('networkidle');
  });

  test('should create a monthly recurring transaction', async ({ page }) => {
    // Click "New Recurring" button
    await page.click('button:has-text("New Recurring")');
    
    // Wait for RecurringTransactionForm modal
    await expect(page.locator('text=/Add Recurring Transaction|Create Recurring/i')).toBeVisible();
    
    // Select EXPENSE type
    await page.click('button:has-text("EXPENSE")');
    
    // Fill in form
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '500.00');
    await page.fill('input#start-date', '2025-12-01');
    await page.selectOption('select#category', { index: 1 });
    await page.selectOption('select#frequency', 'MONTHLY');
    await page.fill('input#day-of-month', '1'); // 1st of each month
    await page.fill('input#description', 'Monthly rent');
    
    // Check auto-post
    await page.check('input#auto-post');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for modal to close
    await expect(page.locator('text=/Add Recurring Transaction/i')).not.toBeVisible({ timeout: 3000 });
    
    // Verify recurring transaction appears
    await expect(page.locator('text=Monthly rent')).toBeVisible();
    await expect(page.getByText('Monthly', { exact: true })).toBeVisible();
  });

  test('should create a weekly recurring transaction', async ({ page }) => {
    await page.click('button:has-text("New Recurring")');
    
    await expect(page.locator('text=/Add Recurring Transaction/i')).toBeVisible();
    
    // Select INCOME type
    await page.click('button:has-text("INCOME")');
    
    // Fill in form
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '200.00');
    await page.fill('input#start-date', '2025-12-01');
    await page.selectOption('select#category', { index: 1 });
    await page.selectOption('select#frequency', 'WEEKLY');
    await page.selectOption('select#day-of-week', '1'); // Monday
    await page.fill('input#description', 'Weekly allowance');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/Add Recurring Transaction/i')).not.toBeVisible({ timeout: 3000 });
    
    // Verify recurring transaction appears
    await expect(page.locator('text=Weekly allowance')).toBeVisible();
    await expect(page.getByText('Weekly', { exact: true })).toBeVisible();
  });

  test('should create a recurring transfer', async ({ page }) => {
    await page.click('button:has-text("New Recurring")');
    
    await expect(page.locator('text=/Add Recurring Transaction/i')).toBeVisible();
    
    // Select TRANSFER type
    await page.click('button:has-text("TRANSFER")');
    
    // Fill in form
    await page.selectOption('select#account', { index: 1 });
    await page.selectOption('select#transfer-to', { index: 1 });
    await page.fill('input#amount', '100.00');
    await page.fill('input#start-date', '2025-12-01');
    await page.selectOption('select#frequency', 'MONTHLY');
    await page.fill('input#day-of-month', '15');
    await page.fill('input#description', 'Monthly savings transfer');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/Add Recurring Transaction/i')).not.toBeVisible({ timeout: 3000 });
    
    // Verify recurring transaction appears
    await expect(page.locator('text=Monthly savings transfer')).toBeVisible();
  });

  test('should edit a recurring transaction', async ({ page }) => {
    // First create a recurring transaction
    await page.click('button:has-text("New Recurring")');
    await page.click('button:has-text("EXPENSE")');
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '50.00');
    await page.fill('input#start-date', '2025-12-01');
    await page.selectOption('select#category', { index: 1 });
    await page.selectOption('select#frequency', 'WEEKLY');
    await page.selectOption('select#day-of-week', '5'); // Friday
    await page.fill('input#description', 'Original recurring');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Find and click edit button
    const recurringCard = page.locator('div.rounded-xl', { hasText: 'Original recurring' }).first();
    await recurringCard.locator('button[aria-label="Edit"]').click();
    
    // Wait for edit modal
    await expect(page.locator('text=/Edit Recurring Transaction/i')).toBeVisible();
    
    // Update description and amount
    const descInput = page.locator('input#description');
    await descInput.clear();
    await descInput.fill('Updated recurring');
    
    const amountInput = page.locator('input#amount');
    await amountInput.clear();
    await amountInput.fill('75.00');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/Edit Recurring Transaction/i')).not.toBeVisible({ timeout: 3000 });
    
    // Verify updates
    await expect(page.locator('text=Updated recurring')).toBeVisible();
    await expect(page.locator('text=75.00')).toBeVisible();
  });

  test('should toggle recurring transaction active status', async ({ page }) => {
    // Create a recurring transaction first
    await page.click('button:has-text("New Recurring")');
    await page.click('button:has-text("EXPENSE")');
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '25.00');
    await page.fill('input#start-date', '2025-12-01');
    await page.selectOption('select#category', { index: 1 });
    await page.selectOption('select#frequency', 'MONTHLY');
    await page.fill('input#day-of-month', '10');
    await page.fill('input#description', 'Toggle test');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Dismiss the demo banner if it's overlapping buttons
    const demoBanner = page.locator('button:has-text("Got it, continue exploring")');
    if (await demoBanner.isVisible({ timeout: 1000 }).catch(() => false)) {
      await demoBanner.click();
      await page.waitForTimeout(300);
    }

    // Find the recurring card and click the Deactivate button
    const recurringCard = page.locator('div.rounded-xl', { hasText: 'Toggle test' }).first();
    await recurringCard.locator('button[title="Deactivate"]').click();

    await page.waitForTimeout(500);

    // After deactivation, the button should change to "Activate"
    await expect(recurringCard.locator('button[title="Activate"]')).toBeVisible();
  });

  test('should delete a recurring transaction', async ({ page }) => {
    // Create a recurring transaction to delete
    await page.click('button:has-text("New Recurring")');
    await page.click('button:has-text("EXPENSE")');
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '10.00');
    await page.fill('input#start-date', '2025-12-01');
    await page.selectOption('select#category', { index: 1 });
    await page.selectOption('select#frequency', 'WEEKLY');
    await page.selectOption('select#day-of-week', '3'); // Wednesday
    await page.fill('input#description', 'Delete me');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Verify it exists
    await expect(page.locator('text=Delete me')).toBeVisible();
    
    // Find delete button
    const transactionRow = page.locator('text=Delete me').locator('xpath=ancestor::tr | ancestor::div[contains(@class, "recurring")]');
    
    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    await transactionRow.locator('button[aria-label="Delete"], button:has-text("Delete")').first().click();
    
    await page.waitForTimeout(1000);
    
    // Verify deletion
    await expect(page.locator('text=Delete me')).not.toBeVisible();
  });

  test('should filter active vs all recurring transactions', async ({ page }) => {
    // Look for "Show active only" toggle or filter
    const activeOnlyToggle = page.locator('text=/Show active only/i').locator('xpath=ancestor::label | ancestor::div').locator('button, input[type="checkbox"]').first();
    
    if (await activeOnlyToggle.isVisible()) {
      // Click to toggle filter
      await activeOnlyToggle.click();
      await page.waitForTimeout(500);
      
      // Count should change or label should update
      const countBadge = page.locator('text=/\\d+ (active|total)/i');
      await expect(countBadge).toBeVisible();
    }
  });

  test('should validate frequency-specific fields', async ({ page }) => {
    await page.click('button:has-text("New Recurring")');
    
    // Select MONTHLY frequency
    await page.selectOption('select#frequency', 'MONTHLY');
    
    // Day of month field should be visible and required
    await expect(page.locator('input#day-of-month')).toBeVisible();
    
    // Change to WEEKLY
    await page.selectOption('select#frequency', 'WEEKLY');
    
    // Day of week field should be visible
    await expect(page.locator('select#day-of-week')).toBeVisible();
    
    // Day of month should not be visible or required
    const dayOfMonthVisible = await page.locator('input#day-of-month').isVisible();
    expect(dayOfMonthVisible).toBe(false);
  });

  test('should set optional end date', async ({ page }) => {
    await page.click('button:has-text("New Recurring")');
    
    await page.click('button:has-text("EXPENSE")');
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '30.00');
    await page.fill('input#start-date', '2025-12-01');
    await page.selectOption('select#category', { index: 1 });
    await page.selectOption('select#frequency', 'MONTHLY');
    await page.fill('input#day-of-month', '20');
    await page.fill('input#description', 'Limited time recurring');
    
    // Set end date
    await page.fill('input#end-date', '2026-06-01');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/Add Recurring Transaction/i')).not.toBeVisible({ timeout: 3000 });
    
    // Verify transaction created
    await expect(page.locator('text=Limited time recurring')).toBeVisible();
  });
});
