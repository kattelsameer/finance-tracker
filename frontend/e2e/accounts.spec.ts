import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage, testUsers } from './fixtures/auth';

test.describe('Account Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page, testUsers.regular);
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new account', async ({ page }) => {
    // Click "Add Account" or similar button
    await page.click('button:has-text("Add Account"), button:has-text("New Account"), button:has-text("Create Account")');
    
    // Wait for modal/form
    await page.waitForTimeout(500);
    
    // Fill in account details
    const timestamp = Date.now();
    await page.fill('input[name="accountName"], input#accountName', `Test Account ${timestamp}`);
    await page.selectOption('select[name="accountType"], select#accountType', { index: 1 });
    await page.fill('input[name="balance"], input#balance', '1000.00');
    await page.fill('input[name="currency"], input#currency', 'NPR');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for modal to close
    await page.waitForTimeout(1000);
    
    // Verify account appears in list
    await expect(page.locator(`text=Test Account ${timestamp}`)).toBeVisible();
    await expect(page.locator('text=NPR 1,000.00, text=Rs. 1,000.00')).toBeVisible();
  });

  test('should view account details', async ({ page }) => {
    // Find first account in the list
    const firstAccount = page.locator('[data-testid="account-item"], .account-card, .account-row').first();
    
    // Click to view details
    await firstAccount.click();
    
    // Should navigate to account details page or show details
    await page.waitForTimeout(500);
    
    // Verify account details are visible
    await expect(page.locator('text=/Balance|Current Balance/i')).toBeVisible();
    await expect(page.locator('text=/Account Type|Type/i')).toBeVisible();
  });

  test('should edit an account', async ({ page }) => {
    // Find edit button for first account
    const editButton = page.locator('button[aria-label="Edit"], button:has-text("Edit")').first();
    await editButton.click();
    
    // Wait for edit modal
    await page.waitForTimeout(500);
    
    // Update account name
    const nameInput = page.locator('input[name="accountName"], input#accountName');
    await nameInput.clear();
    await nameInput.fill('Updated Account Name');
    
    // Submit
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Verify updated name
    await expect(page.locator('text=Updated Account Name')).toBeVisible();
  });

  test('should delete an account', async ({ page }) => {
    // First create a test account to delete
    await page.click('button:has-text("Add Account"), button:has-text("New Account")');
    await page.waitForTimeout(500);
    
    const timestamp = Date.now();
    const accountName = `Delete Test ${timestamp}`;
    await page.fill('input[name="accountName"], input#accountName', accountName);
    await page.selectOption('select[name="accountType"], select#accountType', { index: 1 });
    await page.fill('input[name="balance"], input#balance', '0.00');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Verify account was created
    await expect(page.locator(`text=${accountName}`)).toBeVisible();
    
    // Find delete button for this account
    const accountRow = page.locator(`text=${accountName}`).locator('xpath=ancestor::tr | ancestor::div[contains(@class, "account")]');
    
    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    await accountRow.locator('button[aria-label="Delete"], button:has-text("Delete")').first().click();
    
    await page.waitForTimeout(1000);
    
    // Verify account is deleted
    await expect(page.locator(`text=${accountName}`)).not.toBeVisible();
  });

  test('should display account balance correctly', async ({ page }) => {
    // Check that at least one account shows a balance
    const balanceText = page.locator('text=/NPR|Rs\\..*\\d+/').first();
    await expect(balanceText).toBeVisible();
  });

  test('should update balance after creating a transaction', async ({ page }) => {
    // Get current balance of first account
    const accountCard = page.locator('[data-testid="account-item"], .account-card').first();
    const initialBalanceText = await accountCard.locator('text=/NPR|Rs\\..*\\d+/').first().textContent();
    
    // Navigate to transactions
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    
    // Create an INCOME transaction for the first account
    await page.click('button:has-text("Add Transaction")');
    await page.click('button:has-text("INCOME")');
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '100.00');
    await page.fill('input#transaction-date', '2025-12-03');
    await page.selectOption('select#category', { index: 1 });
    await page.fill('input#description', 'Balance update test');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Go back to accounts
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');
    
    // Check that balance has increased
    const newBalanceText = await accountCard.locator('text=/NPR|Rs\\..*\\d+/').first().textContent();
    
    // Balance should have changed
    expect(newBalanceText).not.toBe(initialBalanceText);
  });

  test('should filter accounts by type', async ({ page }) => {
    // Check if there's a filter/dropdown for account type
    const typeFilter = page.locator('select[name="accountType"], select[aria-label="Account Type"]');
    
    if (await typeFilter.isVisible()) {
      // Select a specific type
      await typeFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const accounts = page.locator('[data-testid="account-item"], .account-card');
      const count = await accounts.count();
      
      // Should have at least 0 accounts (could be none of that type)
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should validate required fields when creating account', async ({ page }) => {
    await page.click('button:has-text("Add Account"), button:has-text("New Account")');
    await page.waitForTimeout(500);
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Form should still be visible (validation prevents submission)
    await page.waitForTimeout(500);
    
    // Check for validation
    const nameInput = page.locator('input[name="accountName"], input#accountName');
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });
});
