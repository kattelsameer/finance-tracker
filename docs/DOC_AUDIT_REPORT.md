# Documentation Audit Report

> **Audit Date**: 2026-03-16  
> **Branch**: `fix/docs-full-audit`  
> **Auditor**: Automated documentation audit against codebase

---

## Summary

A full documentation audit was performed across all Markdown files in the repository. Each document was verified against the actual source code and configuration files. This report lists all files reviewed, changes made, and areas where documentation was missing or incorrect.

---

## Files Modified

| File | Changes Made |
|------|-------------|
| `docs/api/API_REFERENCE.md` | Fixed password policy (min 12), added `email` to Register request, fixed Register response code (200 → 201), fixed token expiration description, fixed Security section password note |
| `docs/deployment/DEPLOYMENT.md` | Fixed frontend port mapping (`80:80` → `80:8080`), corrected registration API path (`/api/auth/register` → `/api/v1/auth/register`), updated example password to meet 12-char policy, **added Mermaid deployment topology diagram** |
| `docs/architecture/DATABASE.md` | Updated migration count (17 → 20), added V18-V20 to migration history table, updated Deviation note, added note about NPR default currency, added `secondary_currency` column to users table schema, added V20 currency default note to accounts, updated notes reference for V13-V20, updated summary migration count (17 → 20), **replaced ASCII table relationship diagram with Mermaid ER diagram** |
| `docs/architecture/ARCHITECTURE.md` | Updated controller count (13 → 14), added `UserSettingsController.java` to directory tree, updated services list (13 → 17), updated frontend services list (13 → 15) with `exchange-rate.service.ts` and `settings.service.ts`, added `useDebounce.ts` to hooks list, corrected Vitest version (3.2.4 → 4.0.16), TanStack Query version (5.90.11 → 5.90.16), React Hook Form version (7.66.1 → 7.70.0), Zod version (4.1.13 → 4.3.4), Lucide React version (0.555.0 → 0.562.0), fixed password minimum (8 → 12), updated test counts in summary (103+18+47), fixed UI primitives count (11 → 14), fixed page count (13 → 14), fixed type files count (11 → 12), fixed formatters count (9 → 8) and validators count (15 → 13), **converted 5 ASCII art diagrams to Mermaid** (high-level architecture, login flow, request/response cycle, CSRF flow, Docker compose) |
| `docs/development/BACKEND_GUIDE.md` | Updated controller count (13 → 14), added `UserSettingsController.java` to controller list, updated migration count (17 → 20), fixed test password example to meet 12-char policy, **added Mermaid layered architecture diagram** |
| `docs/development/FRONTEND_GUIDE.md` | Fixed password policy (min 8 → min 12), updated service count (13 → 15) with missing services, added `useDebounce.ts` to hooks list, updated page count (13 → 14), **added Mermaid routing structure diagram** |
| `docs/development/DEVELOPMENT_GUIDE.md` | Updated Flyway migration range references (V1-V17 → V1-V20), added V18-V20 to migration file listing |
| `docs/testing/TESTING_GUIDE.md` | Fixed test password example, updated Playwright CI worker count (2 → 1), fixed CI workflow file reference (`playwright.yml` → `ci.yml`), added missing `demo.spec.ts` to E2E spec list, updated E2E test count (45 → 47 and 6 → 7 spec files), updated backend test count (93 → 103), updated total test count (156 → 168), updated header total, fixed demo credentials (replaced `admin`/`Admin@123` with actual E2E test and demo mode credentials), **added Mermaid CI pipeline overview diagram** |
| `docs/README.md` | Updated Vitest version (3.2.4 → 4.0.16), updated controller count (13 → 14), migration count (17 → 20), service count (13 → 15), custom hooks count (6 → 7), backend test count (93 → 103), E2E test count (46 → 47), total test count (157 → 168), frontend pages (13 → 14), updated directory tree test/page/controller/migration count descriptions |
| `docs/USER_GUIDE.md` | Fixed password requirement from "at least 8 characters" to "at least 12 characters" with complexity requirements |
| `docs/PROJECT_DEVIATION_REPORT.md` | Updated migration count (V1-V17 → V1-V20), controller count (13 → 14), page count (13 → 14), service count (13 → 15), hooks count (6 → 7), test total (157 → 168), UI primitives count (11 → 14) with 4 missing components, added V18-V20 migration entries, updated summary deviations |

---

## Files Added

| File | Reason |
|------|--------|
| `docs/DOC_AUDIT_REPORT.md` | Required deliverable per documentation audit issue |

---

## Diagrams Added / Converted

All legacy ASCII art diagrams were converted to Mermaid for consistent rendering on GitHub and documentation tools.

| Document | Diagram | Type |
|----------|---------|------|
| `ARCHITECTURE.md` | High-level system architecture | `graph TD` |
| `ARCHITECTURE.md` | Component interaction (login) flow | `sequenceDiagram` |
| `ARCHITECTURE.md` | JWT login flow | `sequenceDiagram` |
| `ARCHITECTURE.md` | Full request/response cycle | `sequenceDiagram` |
| `ARCHITECTURE.md` | CSRF token flow | `sequenceDiagram` |
| `ARCHITECTURE.md` | Docker Compose topology | `graph TD` |
| `DATABASE.md` | Entity-relationship diagram | `erDiagram` |
| `DEPLOYMENT.md` | Container topology | `graph LR` |
| `TESTING_GUIDE.md` | CI pipeline overview | `graph TD` |
| `BACKEND_GUIDE.md` | Layered architecture | `graph TD` |
| `FRONTEND_GUIDE.md` | Routing structure | `graph TD` |

---

## Major Corrections Made

### 1. Password Policy (Critical)
**Files**: `docs/api/API_REFERENCE.md`, `docs/development/FRONTEND_GUIDE.md`, `docs/testing/TESTING_GUIDE.md`, `docs/development/BACKEND_GUIDE.md`

**Issue**: Multiple documents stated minimum password length was 8 characters.  
**Reality**: `backend/src/main/java/com/financetracker/dto/auth/RegisterRequest.java` enforces `@Size(min=12, max=128)` with a `@Pattern` requiring uppercase, lowercase, digit, and special character.  
**Fix**: Updated all references to reflect the actual 12-character minimum.

### 2. Register API Response Code (Critical)
**File**: `docs/api/API_REFERENCE.md`

**Issue**: Register endpoint documented as returning `200 OK`.  
**Reality**: `AuthController.java` returns `ResponseEntity.status(HttpStatus.CREATED).body(...)` — HTTP 201.  
**Fix**: Updated response to `201 Created`.

### 3. Register Request Body Missing `email` Field (Critical)
**File**: `docs/api/API_REFERENCE.md`

**Issue**: Register request body example only showed `username` and `password`.  
**Reality**: `RegisterRequest.java` requires `email` (annotated `@NotBlank`, `@Email`).  
**Fix**: Added `email` and `displayName` fields to the request example.

### 4. Wrong Registration API Path in Deployment Guide (Critical)
**File**: `docs/deployment/DEPLOYMENT.md`

**Issue**: curl example used `/api/auth/register`.  
**Reality**: All endpoints are under `/api/v1/` prefix. Correct path is `/api/v1/auth/register`.  
**Fix**: Corrected API path and updated example password to meet 12-char policy.

### 5. Incorrect Frontend Docker Port Mapping
**File**: `docs/deployment/DEPLOYMENT.md`

**Issue**: Frontend container mapped as `80:80`.  
**Reality**: `docker-compose.yml` maps `${FRONTEND_PORT:-80}:8080` — host port 80 → container port 8080.  
**Fix**: Corrected to `80:8080`.

### 6. Flyway Migration Count (17 → 20)
**Files**: `docs/architecture/DATABASE.md`, `docs/development/BACKEND_GUIDE.md`, `docs/README.md`

**Issue**: Documentation consistently referenced 17 migrations (V1–V17).  
**Reality**: `backend/src/main/resources/db/migration/` contains 20 files (V1–V20), with V18–V20 adding additional currencies and setting NPR as the default currency.  
**Fix**: Updated all references to reflect 20 migrations.

### 7. Controller Count (13 → 14)
**Files**: `docs/architecture/ARCHITECTURE.md`, `docs/development/BACKEND_GUIDE.md`, `docs/README.md`

**Issue**: Documentation consistently stated 13 REST controllers.  
**Reality**: `backend/src/main/java/com/financetracker/controller/` contains 14 controllers, including `UserSettingsController.java` which was omitted.  
**Fix**: Updated count and added `UserSettingsController.java` to the controller list.

### 8. Frontend Service Count (13 → 15)
**Files**: `docs/architecture/ARCHITECTURE.md`, `docs/development/FRONTEND_GUIDE.md`, `docs/README.md`

**Issue**: Documentation listed 13 frontend service files.  
**Reality**: `frontend/src/services/` contains 15 files — `exchange-rate.service.ts` and `settings.service.ts` were missing from documentation.  
**Fix**: Updated count and added missing service files.

### 9. Hooks Missing `useDebounce`
**Files**: `docs/architecture/ARCHITECTURE.md`, `docs/development/FRONTEND_GUIDE.md`, `docs/README.md`

**Issue**: Documentation listed 6 custom hooks.  
**Reality**: `frontend/src/hooks/` contains 7 hooks, including `useDebounce.ts`.  
**Fix**: Added `useDebounce.ts` and updated count to 7.

### 10. Library Version Inaccuracies
**File**: `docs/architecture/ARCHITECTURE.md`

| Library | Was | Correct |
|---------|-----|---------|
| Vitest | 3.2.4 | 4.0.16 |
| TanStack Query | 5.90.11 | 5.90.16 |
| React Hook Form | 7.66.1 | 7.70.0 |
| Zod | 4.1.13 | 4.3.4 |

### 11. Backend Service List Incomplete
**File**: `docs/architecture/ARCHITECTURE.md`

**Issue**: Backend service directory tree listed only 13 services.  
**Reality**: `backend/src/main/java/com/financetracker/service/` contains 17 services. Missing: `AuthService.java`, `AuditLogCleanupService.java`, `DemoDataService.java`, `SavedSearchService.java`, `TokenCleanupService.java`, `UserCurrencyService.java` (listed as `UserService.java`).  
**Fix**: Updated service list to accurately reflect all 17 services.

### 12. Playwright CI Worker Count
**File**: `docs/testing/TESTING_GUIDE.md`

**Issue**: Documented CI workers as 2.  
**Reality**: `frontend/playwright.config.ts` uses `process.env.CI ? 1 : 4`.  
**Fix**: Updated CI worker count to 1.

### 13. Missing E2E Spec File
**File**: `docs/testing/TESTING_GUIDE.md`

**Issue**: E2E spec file list was missing `frontend/e2e/demo.spec.ts`.  
**Reality**: 7 spec files exist in `frontend/e2e/`.  
**Fix**: Added `demo.spec.ts` to the spec file list.

### 14. CI Workflow File Reference
**File**: `docs/testing/TESTING_GUIDE.md`

**Issue**: Referenced `.github/workflows/playwright.yml` which does not exist.  
**Reality**: CI is managed in `.github/workflows/ci.yml`.  
**Fix**: Corrected workflow file reference.

### 15. Default Currency Note
**File**: `docs/architecture/DATABASE.md`

**Issue**: The `default_currency` field description only mentioned "3-letter ISO code" with no indication of the actual default.  
**Reality**: Migrations V19 and V20 changed the effective system default from USD to NPR (Nepalese Rupee).  
**Fix**: Added note that the effective default is NPR after migration V19.

---

## Areas Where Documentation Was Missing

1. **`UserSettingsController`** — Not documented in any controller lists prior to this audit.
2. **`exchange-rate.service.ts` and `settings.service.ts`** — Frontend service files undocumented.
3. **`useDebounce.ts`** — Frontend hook not listed in documentation.
4. **Migrations V18–V20** — Three migration files were not mentioned in any documentation.
5. **Backend services** — Several backend services (`AuditLogCleanupService`, `DemoDataService`, `SavedSearchService`, `TokenCleanupService`, `UserCurrencyService`) were absent from the architecture documentation.
6. **Demo data migrations** — `backend/src/main/resources/db/demo/` contains V100–V108 seed migrations for demo mode that are not mentioned in documentation. These are intentionally separate from the main migration sequence.

---

## No Changes Required (Verified Correct)

- `docs/deployment/DEPLOYMENT.md` — Environment variables, backup/restore commands, health check endpoints.
- `docs/development/DEVELOPMENT_GUIDE.md` — Prerequisites, Docker Compose commands, IDE setup.
- `docs/architecture/ARCHITECTURE.md` — High-level architecture diagram, security patterns, data flow.
- `docs/architecture/DATABASE.md` — Core table schemas (V1–V20), indexes, relationships.
- `docs/development/BACKEND_GUIDE.md` — Security section (JWT + CSRF), error handling codes, data isolation patterns.
- `docs/development/FRONTEND_GUIDE.md` — API client pattern, React Query patterns, routing.
- `docs/api/API_REFERENCE.md` — All documented endpoints (paths, methods, request/response formats for accounts, transactions, categories, budgets, etc.).

---

## Final Cross-Verification Pass

A final cross-verification was performed to catch any remaining inconsistencies across all documents. The following additional issues were identified and corrected:

### 16. Password Policy in USER_GUIDE.md
**File**: `docs/USER_GUIDE.md`

**Issue**: Getting Started section stated password must be "at least 8 characters".  
**Reality**: Backend enforces minimum 12 characters.  
**Fix**: Updated to "at least 12 characters" with complexity requirements.

### 17. Page Count Inconsistencies (13 → 14)
**Files**: `docs/architecture/ARCHITECTURE.md`, `docs/README.md`, `docs/PROJECT_DEVIATION_REPORT.md`

**Issue**: Frontend page count listed as 13 in multiple places.  
**Reality**: 14 page components exist (LoginPage, RegisterPage, DashboardPage, TransactionsPage, AccountsPage, CategoriesPage, BudgetsPage, RecurringTransactionsPage, ReportsPage, TagsPage, ImportExportPage, AdvancedSearchPage, SettingsPage, ProfilePage).  
**Fix**: Updated to 14 in all locations.

### 18. Type File Count (11 → 12)
**File**: `docs/architecture/ARCHITECTURE.md`

**Issue**: Type files documented as "11 type files".  
**Reality**: `frontend/src/types/` contains 12 TypeScript files.  
**Fix**: Updated count to 12.

### 19. Utility Function Counts
**File**: `docs/architecture/ARCHITECTURE.md`

**Issue**: `formatters.ts` documented as "9 formatting functions" and `validators.ts` as "15 validation functions".  
**Reality**: `formatters.ts` contains 8 exported functions; `validators.ts` contains 13 exported functions.  
**Fix**: Corrected to 8 and 13 respectively.

### 20. Lucide React Version
**File**: `docs/architecture/ARCHITECTURE.md`

**Issue**: Lucide React version listed as `0.555.0`.  
**Reality**: `package.json` specifies `^0.562.0`.  
**Fix**: Updated to `0.562.0`.

### 21. E2E Test Credentials
**File**: `docs/testing/TESTING_GUIDE.md`

**Issue**: Auth test notes listed "Demo credentials: `admin` / `Admin@123`".  
**Reality**: E2E tests use dynamically generated usernames with password `Admin@12345678` (see `frontend/e2e/fixtures/auth.ts`). Demo mode uses `demo@example.com` / `Demo123!`.  
**Fix**: Updated to reflect actual E2E test and demo mode credentials.

### 22. Missing V18-V20 in Migration Listing
**File**: `docs/development/DEVELOPMENT_GUIDE.md`

**Issue**: Migration file listing showed V1-V17 despite header saying "V1-V20".  
**Fix**: Added V18, V19, and V20 migration files to the listing.

### 23. PROJECT_DEVIATION_REPORT Stale Counts
**File**: `docs/PROJECT_DEVIATION_REPORT.md`

**Issue**: Multiple stale counts — migrations "V1-V17" (actually V1-V20), controllers "13" (actually 14), pages "13" (actually 14), services "13" (actually 15 frontend), test total "157" (actually 168).  
**Fix**: Updated all counts to reflect current codebase state.

### 24. DATABASE.md Missing `secondary_currency` Column
**File**: `docs/architecture/DATABASE.md`

**Issue**: Users table schema did not include `secondary_currency` column added by V19.  
**Fix**: Added column and description to the users table documentation.

---

## Final Verification Pass (March 18, 2026)

Addressed remaining reviewer feedback and performed comprehensive cross-verification:

### 25. CI Pipeline Diagram Wrong Dependencies
**File**: `docs/testing/TESTING_GUIDE.md`

**Issue**: CI pipeline Mermaid diagram showed `docker-build` connecting directly to all jobs (`BTest`, `FTest`, `E2E`, `Sec`), implying they run in parallel after the build.  
**Reality**: In `.github/workflows/ci.yml`, `e2e-test` depends on both `backend-test` and `frontend-test` (not `docker-build`), and `security-scan` depends on `e2e-test`.  
**Fix**: Updated diagram edges to reflect the actual `needs` chain: `Build → BTest/FTest → E2E → Sec`.

### 26. Routing Diagram Structure
**File**: `docs/development/FRONTEND_GUIDE.md`

**Issue**: Routing diagram showed `/login` and `/register` as children of the `/` root node. The wildcard was labeled `/* → Navigate to /`.  
**Reality**: In `App.tsx`, `/login` and `/register` are top-level sibling routes under `<Routes>`. The `/` route is a protected layout route (ProtectedRoute + AppLayout) with nested children. The wildcard route uses `path="*"` (not `"/*"`).  
**Fix**: Restructured diagram to show `<Routes>` as the root, with `/login`, `/register`, `/` (ProtectedRoute), and `*` as top-level siblings.

### 27. ProfilePage Route Doesn't Exist
**File**: `docs/PROJECT_DEVIATION_REPORT.md`

**Issue**: ProfilePage.tsx was listed as served at `/profile`.  
**Reality**: `ProfilePage.tsx` exists as a component file but is not imported or routed in `App.tsx`. No `/profile` route is defined.  
**Fix**: Changed route column to "*(not routed)*" with note that the component exists but is not yet added to the router.

### 28. CSRF Protection Section Inaccurate
**File**: `docs/api/API_REFERENCE.md`

**Issue**: CSRF section said "Exposed via `XSRF-TOKEN` cookie" and "Axios automatically includes CSRF token from cookie".  
**Reality**: Frontend `apiClient` fetches the CSRF token from `GET /api/v1/auth/csrf-token` (JSON response `{ token, headerName }`). The `XSRF-TOKEN` cookie is also set by `CookieCsrfTokenRepository`, but the primary mechanism is the JSON endpoint. Login and register are CSRF-exempt.  
**Fix**: Rewrote section to describe the actual `/csrf-token` endpoint, note CSRF exemptions, and describe the retry-on-403 behavior.

### 29. Request Header Example Misleading
**File**: `docs/api/API_REFERENCE.md`

**Issue**: Request headers example said `X-XSRF-TOKEN: <token-from-cookie>`.  
**Fix**: Changed to `<token-from-csrf-endpoint>` to avoid implying the cookie is the primary source.

### 30. JWT Token Attributes Missing Profile Details
**File**: `docs/architecture/ARCHITECTURE.md`

**Issue**: JWT Token bullet only stated "SameSite=Strict" and "Expiration: 1 hour" without noting profile-dependent behavior.  
**Reality**: Cookie name, SameSite, Secure, and expiration all vary by profile. `rememberMe` extends expiration to 30 days.  
**Fix**: Expanded to document cookie name (auth_token default, finance_tracker_token in prod), SameSite/Secure per profile, and expiration variants.

### 31. Missing Login Endpoint in API Reference
**File**: `docs/api/API_REFERENCE.md`

**Issue**: The Login endpoint (`POST /api/v1/auth/login`) was not documented. The API reference jumped from Register directly to Logout.  
**Fix**: Added full Login endpoint documentation including request body (username, password, rememberMe), response format, and Set-Cookie header.

### 32. Change Password Example Invalid
**File**: `docs/api/API_REFERENCE.md`

**Issue**: Change password example used `OldPass123!` (11 chars) which doesn't meet the 12-char minimum.  
**Fix**: Changed to `OldSecurePass1!` (15 chars).

### 33. Test Example Password Invalid
**File**: `docs/development/DEVELOPMENT_GUIDE.md`

**Issue**: `registerAndLogin()` example used `password123` (11 chars, no uppercase, no special char).  
**Reality**: Actual tests use `SecureP@ssw0rd!` (matches BaseIntegrationTest default).  
**Fix**: Updated to `SecureP@ssw0rd!`.

### 34. Last Updated Dates Stale
**Files**: All 10 documentation files

**Issue**: Most documents still showed "December 2025" Last Updated dates despite being modified in this audit.  
**Fix**: Updated all Last Updated dates to March 18, 2026 (header and footer where applicable).
