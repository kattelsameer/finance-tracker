import { test, expect } from '@playwright/test';

test.describe('Demo Mode Smoke', () => {
  test('shows demo banner, can login, and seeded transactions render', async ({ page }) => {
    // This test requires a running demo environment; skip it when DEMO_BASE_URL is not set
    test.skip(!process.env.DEMO_BASE_URL, 'Skipping demo test: DEMO_BASE_URL is not set');

    const baseURL =
      process.env.PLAYWRIGHT_BASE_URL || process.env.DEMO_BASE_URL || 'http://localhost:81';
    const username = process.env.DEMO_USERNAME || 'demo@example.com';
    const password = process.env.DEMO_PASSWORD || 'Demo123!';

    await page.goto(new URL('/login', baseURL).toString());

    await page.fill('input#username', username);
    await page.fill('input#password', password);
    const [loginResponse] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/v1/auth/login'), { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);
    expect(loginResponse.status(), 'Login response status').toBe(200);

    // Auth context refetches /auth/me after login
    const meResponse = await page.waitForResponse((resp) => resp.url().includes('/api/v1/auth/me'), {
      timeout: 15000,
    });
    expect(meResponse.status(), 'Auth/me response status').toBe(200);

    // Demo banner should be visible in demo builds (authenticated layout)
    await expect(page.locator('text=/Demo Mode Active/i')).toBeVisible({ timeout: 15000 });

    await page.goto(new URL('/transactions', baseURL).toString());
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible({ timeout: 15000 });

    // Demo seed should include transactions
    await expect(page.locator('text=No transactions found')).toHaveCount(0);
  });
});
