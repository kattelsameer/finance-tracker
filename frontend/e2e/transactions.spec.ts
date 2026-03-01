import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage, testUsers, createTestAccount } from './fixtures/auth';

// Run tests serially to avoid data-race issues between create/read/delete tests
test.describe.configure({ mode: 'serial' });

test.describe('Transaction Management', () => {
  test.beforeAll(async ({ browser }) => {
    // Ensure the test user exists and has at least one account before transaction tests run
    const page = await browser.newPage();
    try {
      await setupAuthenticatedPage(page, testUsers.regular);
      // Wait for the React app to finish its initial API calls so the XSRF-TOKEN
      // cookie is issued by the server before we make any write request.
      await page.waitForLoadState('networkidle');
      await createTestAccount(page, 'Transactions E2E Account');
      // Create a second account so TRANSFER tests have a valid "Transfer To" option
      await createTestAccount(page, 'Transactions E2E Account 2');
    } catch (e) {
      console.error('beforeAll createTestAccount failed:', e);
    } finally {
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page, testUsers.regular);
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
  });

  test('should create an EXPENSE transaction', async ({ page }) => {
    // Click "Add Transaction" button
    await page.click('button:has-text("Add Transaction")');
    
    // Wait for modal to appear — use h2 to avoid strict-mode violation
    // ("text=Add Transaction" matches the button, modal heading, and submit button simultaneously)
    await expect(page.locator('h2:has-text("Add Transaction")')).toBeVisible();
    
    // Select EXPENSE type
    await page.click('button:has-text("EXPENSE")');
    
    // Fill in transaction details
    await page.selectOption('select#account', { index: 1 }); // Select first account
    await page.fill('input#amount', '50.00');
    await page.fill('input#transaction-date', '2025-12-03');
    await page.selectOption('select#category', { index: 1 }); // Select first category
    await page.fill('input#description', 'Test expense transaction');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for modal to close
    await expect(page.locator('h2:has-text("Add Transaction")')).not.toBeVisible({ timeout: 5000 });
    
    // Verify transaction appears in list
    await expect(page.locator('text=Test expense transaction')).toBeVisible();
    await expect(page.locator('text=$50.00')).toBeVisible();
  });

  test('should create an INCOME transaction', async ({ page }) => {
    await page.click('button:has-text("Add Transaction")');
    
    await expect(page.locator('h2:has-text("Add Transaction")')).toBeVisible();
    
    // Select INCOME type
    await page.click('button:has-text("INCOME")');
    
    // Fill in transaction details
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '1000.00');
    await page.fill('input#transaction-date', '2025-12-03');
    await page.selectOption('select#category', { index: 1 });
    await page.fill('input#description', 'Salary payment');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('h2:has-text("Add Transaction")')).not.toBeVisible({ timeout: 5000 });
    
    // Verify transaction appears in list
    await expect(page.locator('text=Salary payment')).toBeVisible();
  });

  test('should create a TRANSFER transaction', async ({ page }) => {
    await page.click('button:has-text("Add Transaction")');
    
    await expect(page.locator('h2:has-text("Add Transaction")')).toBeVisible();
    
    // Select TRANSFER type
    await page.click('button:has-text("TRANSFER")');
    
    // Fill in transaction details
    await page.selectOption('select#account', { index: 1 }); // From account
    await page.selectOption('select#transfer-to', { index: 1 }); // To account
    await page.fill('input#amount', '200.00');
    await page.fill('input#transaction-date', '2025-12-03');
    await page.fill('input#description', 'Transfer between accounts');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('h2:has-text("Add Transaction")')).not.toBeVisible({ timeout: 5000 });
    
    // Verify transaction appears in list (transfers create 2 entries: debit + credit)
    await expect(page.locator('text=Transfer between accounts').first()).toBeVisible();
  });

  test('should edit an existing transaction', async ({ page }) => {
    // First create a transaction
    await page.click('button:has-text("Add Transaction")');
    await page.click('button:has-text("EXPENSE")');
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '25.00');
    await page.fill('input#transaction-date', '2025-12-03');
    await page.selectOption('select#category', { index: 1 });
    await page.fill('input#description', 'Original description');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('h2:has-text("Add Transaction")')).not.toBeVisible({ timeout: 5000 });
    
    // Wait a bit for the transaction to appear
    await page.waitForTimeout(1000);
    
    // Find and click edit button for the transaction
    const transactionRow = page.locator('tr', { hasText: 'Original description' });
    await transactionRow.locator('button[aria-label="Edit"]').click();
    
    // Wait for edit modal
    await expect(page.locator('text=Edit Transaction')).toBeVisible();
    
    // Update description
    await page.fill('input#description', 'Updated description');
    await page.fill('input#amount', '35.00');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Edit Transaction')).not.toBeVisible({ timeout: 3000 });
    
    // Verify updated transaction
    await expect(page.locator('text=Updated description')).toBeVisible();
    await expect(page.locator('text=$35.00')).toBeVisible();
  });

  test('should delete a transaction', async ({ page }) => {
    // First create a transaction
    await page.click('button:has-text("Add Transaction")');
    await page.click('button:has-text("EXPENSE")');
    await page.selectOption('select#account', { index: 1 });
    await page.fill('input#amount', '15.00');
    await page.fill('input#transaction-date', '2025-12-03');
    await page.selectOption('select#category', { index: 1 });
    await page.fill('input#description', 'To be deleted');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('h2:has-text("Add Transaction")')).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Verify transaction exists
    await expect(page.locator('text=To be deleted')).toBeVisible();
    
    // Find and click delete button
    const transactionRow = page.locator('text=To be deleted').locator('xpath=ancestor::tr | ancestor::div[contains(@class, "transaction")]');
    
    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    await transactionRow.locator('button[aria-label="Delete"], button:has-text("Delete")').first().click();
    
    // Wait a bit for deletion
    await page.waitForTimeout(1000);
    
    // Verify transaction is removed
    await expect(page.locator('text=To be deleted')).not.toBeVisible();
  });

  test('should filter transactions by type', async ({ page }) => {
    // Create transactions of different types
    const transactions = [
      { type: 'INCOME', amount: '500', description: 'Income test' },
      { type: 'EXPENSE', amount: '100', description: 'Expense test' },
    ];
    
    for (const tx of transactions) {
      await page.click('button:has-text("Add Transaction")');
      await page.click(`button:has-text("${tx.type}")`);
      await page.selectOption('select#account', { index: 1 });
      await page.fill('input#amount', tx.amount);
      await page.fill('input#transaction-date', '2025-12-03');
      if (tx.type !== 'TRANSFER') {
        await page.selectOption('select#category', { index: 1 });
      }
      await page.fill('input#description', tx.description);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }
    
    // Open filters panel
    await page.click('button[aria-label="Toggle filters"]');
    await expect(page.locator('select#transaction-type')).toBeVisible();

    // Filter by INCOME
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/transactions') && resp.status() === 200),
      page.selectOption('select#transaction-type', 'INCOME'),
    ]);
    await page.waitForTimeout(500);

    // Should show INCOME transaction
    await expect(page.locator('text=Income test')).toBeVisible();
    // Should not show EXPENSE transaction
    await expect(page.locator('text=Expense test')).not.toBeVisible({ timeout: 5000 });

    // Filter by EXPENSE
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/transactions') && resp.status() === 200),
      page.selectOption('select#transaction-type', 'EXPENSE'),
    ]);
    await page.waitForTimeout(500);

    // Should show EXPENSE transaction
    await expect(page.locator('text=Expense test')).toBeVisible();
    // Should not show INCOME transaction
    await expect(page.locator('text=Income test')).not.toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button:has-text("Add Transaction")');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Modal should still be visible (form validation prevents submission)
    await expect(page.locator('h2:has-text("Add Transaction")')).toBeVisible();
    
    // Verify the form is still open (submission was prevented by validation)
    await expect(page.locator('h2:has-text("Add Transaction")')).toBeVisible({ timeout: 2000 });
  });

  test('should paginate transactions', async ({ page }) => {
    // Verify pagination controls are visible
    await expect(page.locator('button[aria-label="Previous page"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Next page"]')).toBeVisible();

    // Verify the transaction table has rows
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});
