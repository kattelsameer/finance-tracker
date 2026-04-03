# Chapter 6 — Testing & Quality Assurance

> **Report Navigation:** [← Chapter 5](./CH05_IMPLEMENTATION.md) | [Index](./README.md) | [Chapter 7 →](./CH07_RESULTS.md)

---

## 6.1 Introduction

A comprehensive, multi-layered testing strategy was employed throughout the development of Finance Tracker. This chapter describes the testing philosophy, tools, test structure, coverage outcomes, and CI integration. A total of **168 automated tests** were written and maintained, organised across three layers of the testing pyramid.

---

## 6.2 Testing Strategy

The testing pyramid guides the distribution of test types:

```
                    ▲
                   / \
                  /   \   E2E Tests (Playwright)
                 / 47  \  ← Slow, test full user journeys
                /-------\
               /         \
              / Unit/Integ \  Frontend Unit (Vitest) — 18
             /    Tests    \  Backend Integration (JUnit 5) — 103
            /---------------\
           /                 \
```

**Table 6.1 — Test Coverage Summary**

| Layer | Framework | Count | Scope |
|-------|-----------|-------|-------|
| Backend Integration | JUnit 5 + MockMvc + H2 | 103 | Controllers, services, auth flow |
| Frontend Unit | Vitest + React Testing Library | 18 | Service mocking, component rendering |
| End-to-End | Playwright | 47 | Full user journeys in Chrome/Firefox |
| **Total** | | **168** | |

---

## 6.3 Backend Testing

### 6.3.1 Framework and Setup

- **JUnit 5** for test lifecycle and assertions
- **MockMvc** for HTTP request simulation without starting a real server
- **H2 in-memory database** for fast, isolated test runs (no MySQL dependency)
- **Spring Boot Test** `@SpringBootTest(webEnvironment = MOCK)` for full Spring context
- **AssertJ** for fluent, readable assertions

### 6.3.2 BaseIntegrationTest

All controller integration tests extend `BaseIntegrationTest`, which provides:

```java
public abstract class BaseIntegrationTest {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;

    protected Cookie registerAndLogin(String username, String email, String password)
            throws Exception {
        // 1. Register user
        mockMvc.perform(post("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(toJson(new RegisterRequest(username, email, password))))
            .andExpect(status().isCreated());

        // 2. Login and capture auth cookie
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(toJson(new LoginRequest(username, password))))
            .andExpect(status().isOk())
            .andReturn();

        return extractAuthCookie(result);
    }
}
```

### 6.3.3 Backend Test Structure

```
backend/src/test/java/com/financetracker/
├── ApiTestSuite.java                         ← JUnit 5 Suite runner
├── BaseIntegrationTest.java                  ← Shared setup
├── controller/
│   ├── AuthControllerIntegrationTest.java    ← Registration, login, logout, CSRF
│   ├── AccountControllerIntegrationTest.java ← CRUD, balance calculations
│   ├── TransactionControllerIntegrationTest.java ← All transaction types, filters
│   ├── CategoryControllerIntegrationTest.java ← Hierarchy, system vs. custom
│   ├── BudgetControllerIntegrationTest.java  ← Budget CRUD, alert threshold
│   ├── RecurringTransactionControllerIntegrationTest.java
│   ├── TagControllerIntegrationTest.java
│   ├── ReportControllerIntegrationTest.java
│   ├── DashboardControllerIntegrationTest.java
│   ├── ImportExportControllerIntegrationTest.java
│   └── NotificationControllerIntegrationTest.java
└── service/
    └── RecurringTransactionServiceTest.java  ← Scheduler logic
```

### 6.3.4 Sample Backend Test Cases

**Authentication Tests (AuthControllerIntegrationTest):**

| Test | Scenario | Expected |
|------|----------|----------|
| `testRegisterSuccess` | Valid username/email/password | 201 Created |
| `testRegisterDuplicateUsername` | Existing username | 400 with error code 1002 |
| `testLoginSuccess` | Correct credentials | 200, `auth_token` cookie set |
| `testLoginFailure` | Wrong password | 401 |
| `testAccountLockout` | 5 failed logins | 423 (account locked) |
| `testLogout` | Valid session | 200, token revoked |
| `testAccessWithExpiredToken` | Expired JWT | 401 |
| `testCsrfRequired` | POST without CSRF token | 403 |

**Transaction Tests (TransactionControllerIntegrationTest):**

| Test | Scenario | Expected |
|------|----------|----------|
| `testCreateIncome` | Valid income transaction | 201, balance increased |
| `testCreateExpense` | Valid expense transaction | 201, balance decreased |
| `testCreateTransfer` | Transfer between accounts | 201, both balances updated |
| `testTransferCreatesLinkedPair` | Transfer | Two transactions with matching IDs |
| `testFilterByDateRange` | Date range filter | Paginated results in range |
| `testFilterByCategory` | Category filter | Only matching transactions |
| `testUserIsolation` | User A accessing User B's transaction | 404 (not exposed) |
| `testDeleteCascadesTransferPair` | Delete one transfer leg | Both legs removed |

### 6.3.5 Running Backend Tests

```bash
source ~/.bash_profile
cd backend

# All tests
./gradlew test

# Specific controller suite
./gradlew test --tests "*ControllerIntegrationTest"

# Single class
./gradlew test --tests "com.financetracker.controller.AuthControllerIntegrationTest"

# HTML report
open build/reports/tests/test/index.html
```

---

## 6.4 Frontend Testing

### 6.4.1 Framework and Setup

- **Vitest** (v4.0.16) — Vite-native test runner; faster than Jest for TypeScript projects
- **React Testing Library** (v16.3.0) — component testing from a user perspective
- **jsdom** — DOM simulation environment
- **vi.mock()** — module mocking for `apiClient`

### 6.4.2 Service Test Pattern

```typescript
// src/services/__tests__/transaction.service.test.ts
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('transactionService', () => {
  it('getAll returns paginated transactions', async () => {
    const mockResponse = { content: [mockTransaction], totalPages: 1 };
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const result = await transactionService.getAll();

    expect(apiClient.get).toHaveBeenCalledWith(ENDPOINTS.TRANSACTIONS, { params: undefined });
    expect(result).toEqual(mockResponse);
  });
});
```

### 6.4.3 Component Test Pattern

```typescript
// src/components/__tests__/SummaryCard.test.tsx
describe('SummaryCard', () => {
  it('displays formatted amount in NPR', () => {
    render(<SummaryCard title="Balance" amount={150000} currency="NPR" />);
    expect(screen.getByText(/NPR/)).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
  });
});
```

### 6.4.4 Running Frontend Tests

```bash
cd frontend

# Single run
npm run test:run

# Watch mode (development)
npm run test

# Coverage report
npm run test:coverage
```

---

## 6.5 End-to-End Testing

### 6.5.1 Framework and Setup

- **Playwright** (v1.57.0) — cross-browser E2E testing
- **Chromium + Firefox** — browsers tested in CI
- **Workers:** 1 in CI, 4 locally (for speed)
- **Dev server:** Started automatically when `PLAYWRIGHT_START_DEV_SERVER=true`

### 6.5.2 E2E Test Structure

```
tests/                              ← Root E2E directory
└── example.spec.ts
frontend/tests/e2e/
├── auth.spec.ts                    ← Registration, login, logout, lockout
├── accounts.spec.ts                ← Account CRUD
├── transactions.spec.ts            ← Transaction creation, edit, delete, filters
├── categories.spec.ts              ← Category management
├── budgets.spec.ts                 ← Budget creation, progress display
├── recurring.spec.ts               ← Recurring template CRUD
├── reports.spec.ts                 ← Dashboard, chart rendering
├── import-export.spec.ts           ← CSV upload and download
├── notifications.spec.ts           ← Notification bell, read/unread
└── helpers/
    ├── auth.helper.ts              ← Login helper shared across tests
    └── test-data.ts                ← Shared test fixtures
```

### 6.5.3 Sample E2E Test — Transaction Flow

```typescript
// transactions.spec.ts
test('create and verify expense transaction', async ({ page }) => {
  await loginHelper(page);
  await page.goto('/transactions');

  // Open new transaction form
  await page.getByRole('button', { name: 'Add Transaction' }).click();

  // Fill form
  await page.getByLabel('Type').selectOption('EXPENSE');
  await page.getByLabel('Amount').fill('2500');
  await page.getByLabel('Account').selectOption('Checking Account');
  await page.getByLabel('Category').selectOption('Food');
  await page.getByLabel('Description').fill('Grocery shopping');
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify transaction appears in list
  await expect(page.getByText('Grocery shopping')).toBeVisible();
  await expect(page.getByText('NPR 2,500.00')).toBeVisible();
});
```

### 6.5.4 Running E2E Tests

```bash
cd frontend

# Headless (CI mode)
npm run test:e2e

# Visible browser (debug)
npm run test:e2e:headed

# Specific file
npx playwright test auth.spec.ts

# Generate HTML report
npx playwright show-report
```

---

## 6.6 CI/CD Integration

Tests are executed automatically on every push and pull request via **GitHub Actions**:

```yaml
# .github/workflows/ci.yml (excerpt)
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21' }
      - run: cd backend && ./gradlew test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd frontend && npm ci && npm run test:run

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.ci.yml up -d
      - run: cd frontend && npm ci && npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 6.7 Quality Assurance Practices

Beyond automated testing, the following QA practices were followed:

| Practice | Tool/Method |
|----------|-------------|
| **TypeScript strict mode** | `tsconfig.json` with `strict: true` — catches null/undefined at compile time |
| **ESLint** | `npm run lint` — enforces React best practices |
| **Gradle build checks** | `./gradlew compileJava` catches Java compilation errors |
| **Bean Validation** | `@Valid`, `@NotNull`, `@Size` on all DTOs — rejects malformed requests at entry point |
| **User isolation tests** | Every controller test includes a "cross-user access returns 404" case |
| **CSRF tests** | Dedicated tests verify CSRF rejection on mutation endpoints |

---

## 6.8 Known Test Limitations

| Limitation | Description |
|-----------|-------------|
| **Frontend coverage** | Service tests cover 100% of service functions; component coverage is selective |
| **Performance tests** | No load testing was conducted; NFR-07 (2s page load) is based on manual observation |
| **Accessibility** | No automated a11y testing (axe-core); manual review only |
| **Browser matrix** | E2E tested on Chromium and Firefox; Safari tested manually only |

---

## 6.9 Summary

Finance Tracker maintains **168 automated tests** across backend integration, frontend unit, and E2E layers. Key highlights:
- Security is tested explicitly: CSRF, JWT expiry, cross-user isolation, account lockout.
- Business logic is tested end-to-end: transfer atomic updates, scheduler, budget alerts.
- CI runs all tests on every push, blocking merges on failure.

Chapter 7 presents the results, screenshots, and comparison with the original objectives.

---

> **[← Chapter 5](./CH05_IMPLEMENTATION.md) | [Index](./README.md) | [Chapter 7 →](./CH07_RESULTS.md)**
