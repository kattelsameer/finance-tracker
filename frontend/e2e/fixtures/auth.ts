import { Page, expect } from '@playwright/test';

export interface TestUser {
  username: string;
  email: string;
  password: string;
}

// Generate a session-unique ID to avoid conflicts with existing DB users across runs.
// Includes random component so parallel workers starting in the same ms get different IDs.
const SESSION_ID = `${Date.now()}${Math.floor(Math.random() * 9000) + 1000}`;

export const testUsers = {
  regular: {
    username: `e2euser${SESSION_ID}`,
    email: `e2euser${SESSION_ID}@test.com`,
    // Must satisfy backend: min 12 chars, uppercase, lowercase, digit, special (@$!%*?&)
    password: 'Admin@12345678',
  },
  admin: {
    username: `e2euser${SESSION_ID}`,
    email: `e2euser${SESSION_ID}@test.com`,
    password: 'Admin@12345678',
  },
} as const;

const API_V1_BASE_URL = process.env.PLAYWRIGHT_API_V1_BASE_URL || 'http://localhost:8080/api/v1';
const AUTH_COOKIE_NAME = process.env.PLAYWRIGHT_AUTH_COOKIE_NAME || 'auth_token';

/**
 * Register a new user via API
 */
export async function registerUser(page: Page, user: TestUser) {
  const response = await page.request.post(`${API_V1_BASE_URL}/auth/register`, {
    data: {
      username: user.username,
      email: user.email,
      password: user.password,
    },
  });
  
  // Check if registration was successful (201) or user already exists (409 conflict)
  if (response.status() === 429) {
    throw new Error(`Registration rate-limited (429). Restart the backend with app.rate-limiting.enabled=false in application-dev.yml`);
  }
  if (response.status() !== 201 && response.status() !== 409) {
    const body = await response.text().catch(() => '');
    throw new Error(`Registration failed with status ${response.status()}: ${body}`);
  }
}

/**
 * Login with credentials
 */
export async function login(page: Page, usernameOrEmail: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input#username', usernameOrEmail);
  await page.fill('input#password', password);
  
  // Intercept the login API response to detect failures immediately instead of
  // waiting 15 s for URL change that will never happen when login is rejected.
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/auth/login') && res.request().method() === 'POST',
      { timeout: 15000 }
    ),
    page.click('button[type="submit"]'),
  ]);

  const status = response.status();
  if (status === 429) {
    throw new Error(
      `Login rate-limited (429). Restart the backend with app.rate-limiting.enabled=false in application-dev.yml`
    );
  }
  if (status !== 200) {
    const body = await response.text().catch(() => '');
    throw new Error(`Login failed with HTTP ${status}: ${body}`);
  }

  // Login accepted – wait for SPA to navigate away from /login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
}

/**
 * Logout the current user
 */
export async function logout(page: Page) {
  // Click logout button in sidebar (has title="Logout" with a LogOut icon, no visible text).
  // Filter for the VISIBLE instance — mobile sidebar is hidden at desktop viewport so
  // .first() would otherwise pick the hidden mobile button and hang.
  const logoutButton = page.locator('button[title="Logout"]').filter({ visible: true }).first();
  await logoutButton.click();
  
  // Wait for redirect to login
  await page.waitForURL('/login');
  
  // Verify JWT cookie is removed
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name === AUTH_COOKIE_NAME);
  expect(authCookie).toBeUndefined();
}

/**
 * Setup authenticated page with existing user
 * Registers user via API if they don't exist, then logs in via UI
 */
export async function setupAuthenticatedPage(page: Page, user: TestUser = testUsers.regular) {
  // Register user via API (ignore if already exists)
  try {
    await registerUser(page, user);
  } catch {
    // User may already exist, continue to login
    console.log('Registration skipped, user may already exist');
  }
  
  // Login via UI
  await login(page, user.username, user.password);

  // Wait for the React app to finish its initial API calls. This ensures the
  // XSRF-TOKEN cookie is issued by the server before any subsequent write requests.
  await page.waitForLoadState('networkidle');
  
  return page;
}

/**
 * Get CSRF token from cookies
 */
export async function getCsrfToken(page: Page): Promise<string | undefined> {
  const cookies = await page.context().cookies();
  const csrfCookie = cookies.find(c => c.name === 'XSRF-TOKEN');
  return csrfCookie?.value;
}

/**
 * Navigate to a protected route (requires authentication)
 */
export async function navigateToProtectedRoute(page: Page, route: string) {
  await page.goto(route);
  
  // Should not redirect to login if authenticated
  await expect(page).not.toHaveURL('/login');
}

/**
 * Create a test account via the API for use in tests that require an existing account.
 * The page must be logged in before calling this function.
 */
export async function createTestAccount(page: Page, accountName?: string) {
  const name = accountName ?? `E2E Account ${Date.now()}`;

  // Fetch available account types.
  const typesResponse = await page.request.get(`${API_V1_BASE_URL}/accounts/types`);
  const types = typesResponse.ok() ? await typesResponse.json() : [];
  const typeId: number = types[0]?.id ?? 1;

  // Fetch CSRF token from the dedicated endpoint (same approach as the frontend app).
  // Reading the XSRF-TOKEN cookie is unreliable because Spring Security 6 uses deferred
  // CSRF tokens that may not be set on GET responses.
  const csrfResponse = await page.request.get(`${API_V1_BASE_URL}/auth/csrf-token`);
  const csrfData = csrfResponse.ok() ? await csrfResponse.json() : {};
  const csrfToken: string = csrfData.token || '';

  let response = await page.request.post(`${API_V1_BASE_URL}/accounts`, {
    headers: { 'X-XSRF-TOKEN': csrfToken },
    data: {
      accountName: name,
      accountTypeId: typeId,
      currency: 'USD',
      initialBalance: 1000,
    },
  });

  // Retry once with a fresh CSRF token on 403 (token may have been rotated after a prior POST)
  if (response.status() === 403) {
    const retryCsrf = await page.request.get(`${API_V1_BASE_URL}/auth/csrf-token`);
    const retryData = retryCsrf.ok() ? await retryCsrf.json() : {};
    const retryToken: string = retryData.token || '';
    response = await page.request.post(`${API_V1_BASE_URL}/accounts`, {
      headers: { 'X-XSRF-TOKEN': retryToken },
      data: {
        accountName: name,
        accountTypeId: typeId,
        currency: 'USD',
        initialBalance: 1000,
      },
    });
  }

  if (!response.ok()) {
    throw new Error(`Failed to create test account: ${response.status()} ${await response.text()}`);
  }
  return response.json();
}
