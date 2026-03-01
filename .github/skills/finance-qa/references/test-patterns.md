# Test Patterns — Finance Tracker

## Backend Integration Test (JUnit + Spring Boot)

All backend tests extend `BaseIntegrationTest` which provides:
- `MockMvc mockMvc` — for HTTP requests
- `ObjectMapper objectMapper` — for JSON serialization
- `registerAndLogin(username, email, password)` → returns `Cookie` for auth
- `registerAndLoginDefaultUser()` → shortcut with testuser/test@example.com

```java
package com.financetracker.controller;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FeatureControllerIntegrationTest extends BaseIntegrationTest {

    private Cookie authCookie;

    @BeforeEach
    void setUp() throws Exception {
        authCookie = registerAndLogin("testuser_feat", "feat@test.com", "SecureP@ssw0rd!");
    }

    @Test
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/feature"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldNotReturnOtherUsersData() throws Exception {
        Cookie otherUser = registerAndLogin("other", "other@test.com", "SecureP@ssw0rd!");
        // Create data as otherUser, verify current user can't see it
    }

    @Test
    void shouldCreateFeature() throws Exception {
        String json = objectMapper.writeValueAsString(requestDto);
        mockMvc.perform(post("/api/v1/feature")
                .cookie(authCookie).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isCreated());
    }

    @Test
    void shouldRejectInvalidInput() throws Exception {
        mockMvc.perform(post("/api/v1/feature")
                .cookie(authCookie).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isBadRequest());
    }
}
```

## Frontend Unit Test (Vitest)

All service tests mock `apiClient` from `../../lib/api-client`.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { featureService } from '../feature.service';
import { apiClient } from '../../lib/api-client';

vi.mock('../../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    resetCsrfToken: vi.fn(),
  },
}));

describe('featureService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all items', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
      const result = await featureService.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('endpoint-path');
      expect(result).toEqual(mockData);
    });

    it('should handle API errors', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
      await expect(featureService.getAll()).rejects.toThrow('Network error');
    });
  });
});
```

## Playwright E2E Test

Base URL: `http://localhost:5173`. Login before each test.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#username', 'demo');
    await page.fill('input#password', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display feature page', async ({ page }) => {
    await page.goto('/feature');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should create new item', async ({ page }) => {
    await page.goto('/feature');
    // Click add button, fill form, submit, verify
  });
});
```

## What Every Test Should Cover

1. **Authentication**: 401 without auth
2. **User isolation**: Cannot see other users' data
3. **Validation**: Rejects invalid/empty input
4. **Happy path**: CRUD works correctly
5. **Edge cases**: Empty lists, boundary values, special characters
