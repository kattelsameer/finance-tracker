# Chapter 6 — Testing & Quality Assurance

> **Report Navigation:** [← Chapter 5](./CH05_IMPLEMENTATION.md) | [Index](./README.md) | [Chapter 7 →](./CH07_RESULTS.md)

---

## 6.1 Introduction

Software quality assurance is the systematic process of verifying that a system behaves correctly, reliably, and securely across the full range of conditions it is likely to encounter. For an application that manages personal financial data, correctness is especially critical — an error in a balance calculation, a gap in access control, or a flaw in authentication could have real financial consequences for users. This chapter describes the testing strategy employed throughout the development of Finance Tracker, the methods used at each level of the system, and the quality outcomes achieved.

A total of **168 automated tests** were written and maintained across three distinct testing layers.

---

## 6.2 Testing Strategy

The project follows the **testing pyramid** model (Cohn, 2009), which prescribes a layered approach to automated verification. The shape of the pyramid reflects the deliberate trade-off between test speed, breadth, and confidence:

**Figure 6.1 — Testing Pyramid**

```
              ┌─────────────────────────┐
              │   End-to-End Tests      │  47 tests — full browser journeys
              │   Slowest; highest      │  Catch integration failures
              │   confidence            │
              └──────────┬──────────────┘
        ┌─────────────────┴──────────────────┐
        │   Integration Tests                │  103 tests — API and business logic
        │   Medium speed; tests component    │  Catch logic and security defects
        │   boundaries                       │
        └──────────┬─────────────────────────┘
    ┌──────────────┴───────────────────────────────┐
    │   Unit Tests                                  │  18 tests — individual functions
    │   Fastest; narrowest scope                    │  Catch data handling errors
    └───────────────────────────────────────────────┘
```

Many fast, narrow tests catch the majority of defects cheaply at the unit level. Fewer integration tests verify that system components interact correctly. A small set of comprehensive end-to-end tests confirm that complete user workflows function as intended. This distribution ensures the test suite is efficient — most defects are caught at the cheapest level, and the most expensive tests are reserved for high-value user journeys.

**Table 6.1 — Test Coverage Summary**

| Layer | Approach | Count | Coverage Area |
|-------|---------|-------|--------------|
| Backend Integration | Simulated API requests against an in-memory database | 103 | All service endpoints, authentication, business rules |
| Frontend Unit | Isolated tests with simulated network responses | 18 | Service functions and component rendering |
| End-to-End | Automated browser interaction | 47 | Complete user journeys in Chrome and Firefox |
| **Total** | | **168** | |

---

## 6.3 Backend Integration Testing

### 6.3.1 Framework and Approach

Backend integration tests verify the application's behaviour from the HTTP request level down through the business logic to the database — covering the complete vertical slice through the server-side system. Each test sends a structured HTTP request to the application and asserts that the response matches expectations: checking the status code, the content of the response body, and any side effects such as changes to account balances.

A lightweight in-memory database is used throughout backend testing. This provides two key advantages: tests execute quickly because there is no network connection to an external database server, and each test run starts with a clean, predictable state — no accumulated test data can interfere with subsequent runs.

All controller tests share a common base configuration that handles user registration and login automatically, so each individual test can proceed directly to asserting the feature under test.

### 6.3.2 Backend Test Structure

Tests are organised to mirror the application's functional structure, with one dedicated test class per feature area:

**Table 6.2 — Backend Test Classes and Coverage**

| Test Class | Feature Area Covered |
|-----------|---------------------|
| Authentication | User registration, login, logout, session management, CSRF enforcement, account lockout |
| Accounts | Account creation, retrieval, update, soft deletion, automatic balance tracking |
| Transactions | All transaction types, filter and pagination combinations, user data isolation |
| Categories | Hierarchy management, system versus user-created categories |
| Budgets | Budget creation, spending progress calculation, alert threshold logic |
| Budget Subcategory Spending | Spending aggregation from subcategories up to parent budget totals |
| Recurring Transactions | Template management and automated daily processing |
| Tags | Tag operations and their associations with transactions |
| Reports | Data aggregation and date range filtering |
| Dashboard | Summary metric calculations across all user accounts |
| Import and Export | CSV import parsing and export file correctness |
| Notifications | Notification creation, read and unread state management |
| Search | Full-text transaction search and saved search management |
| Account and Budget Services | Core balance update logic and alert threshold calculations |

### 6.3.3 Key Backend Test Scenarios

**Authentication and Security:**

| Scenario Tested | Expected Outcome |
|----------------|-----------------|
| Valid registration with all required fields | Account created successfully |
| Registration with an already-used username | Request rejected with an appropriate error code |
| Successful login with correct credentials | Authentication token issued |
| Login attempt with an incorrect password | Request rejected |
| Five consecutive failed login attempts | Account locked; further attempts blocked for fifteen minutes |
| Accessing a protected endpoint without a valid token | Request rejected with an authentication error |
| Data-modifying request submitted without the required security token | Request rejected |
| Logging out | Token added to the revocation list; cannot be reused |

**Transaction and Business Logic:**

| Scenario Tested | Expected Outcome |
|----------------|-----------------|
| Recording an income transaction | Account balance increases by the recorded amount |
| Recording an expense transaction | Account balance decreases by the recorded amount |
| Recording a transfer between two accounts | Source balance decreases; destination balance increases; two linked records created |
| Deleting one record of a transfer pair | The paired record is also deleted; both account balances are restored |
| Filtering transactions by a date range | Only transactions within the specified dates are returned |
| Filtering transactions by category | Only transactions in the matching category are returned |
| One user attempting to access another user's transaction | Not found — no cross-user data is revealed |
| Recording spending that crosses a budget's alert threshold | A notification is automatically generated |

---

## 6.4 Frontend Unit Testing

### 6.4.1 Framework and Approach

Frontend unit tests verify that individual service functions and user interface components behave correctly in isolation. Because these tests run without a live server, network calls are replaced by mock functions returning predetermined responses. This allows tests to confirm that components display correct information given known data, and that service functions make the correct calls with the expected parameters.

### 6.4.2 What is Tested

**Service function tests** verify that each data service correctly:

- Calls the appropriate API endpoint for each operation
- Passes parameters and filter values through accurately
- Returns the server response data to the calling component without modification

**Component rendering tests** verify that key interface components correctly:

- Display the values provided to them
- Format currency amounts and dates according to the user's locale and preferences
- Render distinct states — loading, empty, and error — as appropriate
- Respond correctly to user interactions such as button clicks and form submissions

---

## 6.5 End-to-End Testing

### 6.5.1 Framework and Approach

End-to-end tests automate a real web browser — navigating between pages, clicking buttons, filling in forms, and asserting that the correct content appears on screen — exactly as a real user would interact with the application. This provides the highest level of confidence that the system functions correctly as an integrated whole, catching issues that emerge only when all layers work together.

Tests are executed against the full application stack — both frontend and backend with a real database. During the continuous integration process they run in a headless browser for speed; during local development they can run in a visible browser window so test execution can be observed directly.

### 6.5.2 End-to-End Test Coverage

**Table 6.3 — End-to-End Test Coverage by Feature**

| Feature Area | Scenarios Covered |
|-------------|-------------------|
| Authentication | Registration, login, session persistence, logout, account lockout, redirect for unauthenticated access |
| Accounts | Account creation, editing, deletion, balance display, account type selection |
| Transactions | Creating income, expense, and transfer records; editing and deletion; filter panel; pagination; CSV export |
| Recurring Transactions | Template creation with multiple frequency settings, pausing, and deletion |
| Additional Features | Budget creation and progress, category management, notifications, currency preferences, saved searches |
| Demo Data | Verification that the pre-seeded demonstration dataset displays correctly across all major sections |
| Smoke Tests | Rapid critical-path checks across all pages to detect regressions |

### 6.5.3 Selected Journey Descriptions

**User registration and first login:** The test navigates to the registration page, completes the form with a valid username, email, and password, submits the form, and verifies that the user is redirected to the dashboard with their username visible in the navigation header.

**Recording an expense:** After logging in, the test opens the transaction form, selects expense type, enters an amount and category, saves the record, and verifies it appears in the list with the correct amount formatted in NPR.

**Budget threshold alert:** A budget is created with an alert threshold of eighty percent. Expenses are recorded until total spending exceeds that threshold. The test verifies a notification appears in the application header.

**Recurring transaction processing:** A monthly recurring expense template is created. The test triggers the processing cycle and verifies that a transaction record is created and the associated account balance updated.

---

## 6.6 Continuous Integration

All 168 tests execute automatically on every code change through a continuous integration pipeline. The pipeline proceeds through the following stages in order:

1. **Compilation:** The backend and frontend are compiled, catching any syntax or type errors immediately.
2. **Backend tests:** All 103 integration tests run against the in-memory database.
3. **Frontend unit tests:** All 18 frontend tests run in isolation.
4. **Production build:** Application packages are assembled as they would be for deployment.
5. **End-to-end tests:** The full application stack is launched in containers and all 47 browser-based tests execute against it.

A code change that causes any test to fail is not accepted for integration, ensuring that regressions are caught before they reach the main codebase. Test reports are preserved as build artefacts so that any failure can be investigated in detail after the fact.

---

## 6.7 Quality Assurance Practices

Beyond the automated test suite, several additional practices were maintained throughout development:

| Practice | Benefit |
|----------|---------|
| Strict type checking in the frontend codebase | Type mismatches are caught at compile time, before the application runs |
| Automated code style enforcement | Consistent patterns are maintained and common mistakes are flagged |
| Input validation at every API boundary | Malformed or missing data is rejected before it reaches any business logic |
| Cross-user access tested in every controller test class | Data isolation is confirmed across all endpoints, not just selected ones |
| Security mechanisms each have dedicated test coverage | CSRF protection, token revocation, and account lockout are each explicitly verified |

---

## 6.8 Known Test Limitations

**Table 6.5 — Testing Limitations**

| Limitation | Description |
|-----------|-------------|
| Frontend component coverage | Service-level tests cover all service functions; component tests are selective rather than exhaustive |
| Performance testing | No formal load testing was conducted; performance observations are based on manual usage with a realistic dataset |
| Accessibility testing | No automated accessibility checks were applied; review was conducted manually |
| Browser matrix | End-to-end tests ran on Chrome and Firefox; Safari was checked manually only |

---

## 6.9 Summary

Finance Tracker achieved comprehensive, three-layer automated testing totalling 168 tests. Backend integration tests verify all service endpoints and business logic, with particular attention to security boundaries, financial calculation accuracy, and cross-user data isolation. Frontend unit tests confirm that service functions and interface components behave correctly in isolation. End-to-end browser tests verify that complete user journeys function correctly in a real application environment. All tests execute automatically on each code change, providing continuous quality assurance throughout the development lifecycle.

Chapter 7 presents the completed system against its original objectives, covering performance observations, security validation, and known limitations.

---

> **[← Chapter 5](./CH05_IMPLEMENTATION.md) | [Index](./README.md) | [Chapter 7 →](./CH07_RESULTS.md)**
