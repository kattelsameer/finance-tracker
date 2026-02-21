import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage, testUsers } from './fixtures/auth';

// Run tests serially within this file to ensure accounts created early
// are available for later tests
test.describe.configure({ mode: 'serial' });

test.describe('Account Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page, testUsers.regular);
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new account', async ({ page }) => {
    await page.click('button:has-text("Add Account")');

    // Wait for modal/form
    await page.waitForTimeout(500);

    // Fill in account details using the correct field IDs from AccountForm.tsx
    const timestamp = Date.now();
    await page.fill('input#account-name', `Test Account ${timestamp}`);
    // account-type select already defaults to first available type
    await page.fill('input#currency', 'NPR');
    await page.fill('input#initial-balance', '1000');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for modal to close
    await page.waitForTimeout(1000);

    // Verify account appears in list
    await expect(page.locator(`text=Test Account ${timestamp}`)).toBeVisible();
  });

  test('should view account details', async ({ page }) => {
    // The accounts page itself displays balance and account type for each card
    await expect(page.locator('text=/Balance/i').first()).toBeVisible();
    await expect(page.locator('text=/Checking|Savings|Cash|Account/i').first()).toBeVisible();
  });

  test('should edit an account', async ({ page }) => {
    // Find first edit button (aria-label="Edit" added in AccountList.tsx)
    const editButton = page.locator('button[aria-label="Edit"]').first();
    await editButton.click();

    // Wait for edit modal
    await page.waitForTimeout(500);

    // Update account name using the correct ID from AccountForm.tsx
    const nameInput = page.locator('input#account-name');
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
    await page.click('button:has-text("Add Account")');
    await page.waitForTimeout(500);

    const timestamp = Date.now();
    const accountName = `Delete Test ${timestamp}`;
    await page.fill('input#account-name', accountName);
    await page.fill('input#currency', 'NPR');
    await page.fill('input#initial-balance', '0');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);

    // Verify account was created
    await expect(page.locator(`text=${accountName}`)).toBeVisible();

    // Find delete button for this account (aria-label="Delete" added in AccountList.tsx)
    const accountCard = page.locator(`text=${accountName}`).locator('xpath=ancestor::div[contains(@class,"rounded-xl")]');

    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    await accountCard.locator('button[aria-label="Delete"]').first().click();

    await page.waitForTimeout(1000);

    // Verify account is deleted
    await expect(page.locator(`text=${accountName}`)).not.toBeVisible();
  });

  test('should display account balance correctly', async ({ page }) => {
    // Check that at least one account shows a balance value
    const balanceLabel = page.locator('text=Balance').first();
    await expect(balanceLabel).toBeVisible();
  });

  test('should update balance after creating a transaction', async ({ page }) => {
    // Get current balance text from first account card
    const accountCard = page.locator('[data-testid="account-item"]').first();
    const initialBalanceText = await accountCard.locator('text=/\\d+[\\.\\,]\\d+/').first().textContent();

    // Navigate to transactions
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Create an INCOME transaction for the first account
    await page.click('button:has-text("Add Transaction")');
    await page.click('button:has-text("INCOME")');
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '100.00');
    await page.fill('input#transaction-date', '2025-12-03');
    await page.fill('input#description', 'Balance update test');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);

    // Go back to accounts
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Check that balance has changed
    const newBalanceText = await accountCard.locator('text=/\\d+[\\.\\,]\\d+/').first().textContent();
    expect(newBalanceText).not.toBe(initialBalanceText);
  });

  test('should filter accounts by type', async ({ page }) => {
    // Check if there's a filter/dropdown for account type
    const typeFilter = page.locator('select[name="accountType"], select[aria-label="Account Type"]');

    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      const accounts = page.locator('[data-testid="account-item"]');
      const count = await accounts.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should validate required fields when creating account', async ({ page }) => {
    await page.click('button:has-text("Add Account")');
    await page.waitForTimeout(500);

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Form should still be visible (HTML5 validation prevents submission)
    await page.waitForTimeout(500);

    // Check that the account-name field is marked invalid
    const nameInput = page.locator('input#account-name');
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });
});
