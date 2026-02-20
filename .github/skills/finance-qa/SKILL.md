---
name: finance-qa
description: QA and testing skill for the Finance Tracker application. Use when running tests, analyzing test coverage, generating test reports, debugging test failures, or creating new test cases. Triggers on requests like "run tests", "check coverage", "why is this test failing", "write tests for X", "QA report", or "test the backend/frontend".
---

# Finance Tracker QA & Testing

## Test Stack

| Layer | Framework | Command |
|-------|-----------|---------|
| Backend integration | JUnit 5 + Spring Boot Test (H2) | `source ~/.bash_profile && cd backend && ./gradlew test` |
| Frontend unit | Vitest + jsdom | `cd frontend && npm run test:run` |
| Frontend E2E | Playwright (Chromium) | `cd frontend && npm run test:e2e` |
| Coverage | v8 via Vitest | `cd frontend && npm run test:coverage` |

**Always run `source ~/.bash_profile` before any Gradle/Java commands (Java 21).**

## Workflow

1. Determine scope — `all`, `backend`, `frontend`, `e2e`, or specific file/feature
2. Run the relevant test suites
3. Analyze failures — read error output, trace to source
4. Report findings or generate missing tests

## Commands

```bash
# Backend
source ~/.bash_profile
cd backend && ./gradlew test                                           # All tests
cd backend && ./gradlew test --tests "*AuthControllerIntegrationTest"   # Specific class
cd backend && ./gradlew test --tests "*ControllerIntegrationTest"       # All controller tests

# Frontend
cd frontend && npm run test:run              # Vitest single run
cd frontend && npm run test:coverage         # With v8 coverage
cd frontend && npm run test:e2e              # Playwright headless
cd frontend && npm run test:e2e:headed       # Playwright with browser visible
cd frontend && npm run test:e2e:ui           # Playwright interactive mode
```

## Writing New Tests

Follow existing patterns — see [references/test-patterns.md](references/test-patterns.md) for complete templates.

**Key conventions:**
- Backend: Extend `BaseIntegrationTest`, use `registerAndLogin()` for auth cookies, include `.with(csrf())`
- Frontend unit: Mock `apiClient` from `../../lib/api-client`, use `vi.fn()` cast pattern
- E2E: Login via `page.fill('input#username', ...)` + submit, then navigate

## Known Coverage Gaps

**Frontend services missing unit tests:** transaction, category, budget, dashboard, recurring, notification, import-export

**E2E flows missing specs:** Budgets, Categories, Import/Export, Dashboard

## Security Quick Checks

When generating QA reports, also run the security checklist in [references/security-checks.md](references/security-checks.md).

## Debugging Test Failures

1. Backend won't compile: `source ~/.bash_profile && cd backend && ./gradlew compileJava compileTestJava`
2. TypeScript errors: `cd frontend && npx tsc --noEmit`
3. E2E failures: Verify dev server at `localhost:5173` and backend at `localhost:8080`
4. Backend test DB issues: Tests use H2 in-memory (`test` profile) — schema mismatches from new Flyway migrations need matching H2 SQL
5. Always read both the test file AND the source file before diagnosing
