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
| `docs/architecture/DATABASE.md` | Updated migration count (17 → 20), added V18-V20 to migration history table, updated Deviation note, added note about NPR default currency, updated notes reference for V13-V20, updated summary migration count (17 → 20), **replaced ASCII table relationship diagram with Mermaid ER diagram** |
| `docs/architecture/ARCHITECTURE.md` | Updated controller count (13 → 14), added `UserSettingsController.java` to directory tree, updated services list (13 → 17), updated frontend services list (13 → 15) with `exchange-rate.service.ts` and `settings.service.ts`, added `useDebounce.ts` to hooks list, corrected Vitest version (3.2.4 → 4.0.16), TanStack Query version (5.90.11 → 5.90.16), React Hook Form version (7.66.1 → 7.70.0), Zod version (4.1.13 → 4.3.4), fixed password minimum (8 → 12), updated test counts in summary (103+18+47), fixed UI primitives count (11 → 14), **converted 5 ASCII art diagrams to Mermaid** (high-level architecture, login flow, request/response cycle, CSRF flow, Docker compose) |
| `docs/development/BACKEND_GUIDE.md` | Updated controller count (13 → 14), added `UserSettingsController.java` to controller list, updated migration count (17 → 20), fixed test password example to meet 12-char policy, **added Mermaid layered architecture diagram** |
| `docs/development/FRONTEND_GUIDE.md` | Fixed password policy (min 8 → min 12), updated service count (13 → 15) with missing services, added `useDebounce.ts` to hooks list, updated page count (13 → 14), **added Mermaid routing structure diagram** |
| `docs/development/DEVELOPMENT_GUIDE.md` | Updated Flyway migration range references (V1-V17 → V1-V20) |
| `docs/testing/TESTING_GUIDE.md` | Fixed test password example, updated Playwright CI worker count (2 → 1), fixed CI workflow file reference (`playwright.yml` → `ci.yml`), added missing `demo.spec.ts` to E2E spec list, updated E2E test count (45 → 47 and 6 → 7 spec files), updated backend test count (93 → 103), updated total test count (156 → 168), updated header total, **added Mermaid CI pipeline overview diagram** |
| `docs/README.md` | Updated Vitest version (3.2.4 → 4.0.16), updated controller count (13 → 14), migration count (17 → 20), service count (13 → 15), custom hooks count (6 → 7), backend test count (93 → 103), E2E test count (46 → 47), total test count (157 → 168), updated directory tree test/page/controller/migration count descriptions |

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
- `docs/architecture/DATABASE.md` — Core table schemas (V1–V17), indexes, relationships.
- `docs/development/BACKEND_GUIDE.md` — Security section (JWT + CSRF), error handling codes, data isolation patterns.
- `docs/development/FRONTEND_GUIDE.md` — API client pattern, React Query patterns, routing.
- `docs/api/API_REFERENCE.md` — All documented endpoints (paths, methods, request/response formats for accounts, transactions, categories, budgets, etc.).
