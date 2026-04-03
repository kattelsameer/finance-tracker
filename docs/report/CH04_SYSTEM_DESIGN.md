# Chapter 4 — System Design & Architecture

> **Report Navigation:** [← Chapter 3](./CH03_REQUIREMENTS.md) | [Index](./README.md) | [Chapter 5 →](./CH05_IMPLEMENTATION.md)

---

## 4.1 Introduction

This chapter documents the architectural decisions, system diagrams, database design, and technology choices that form the foundation of Finance Tracker. The design follows a **three-tier layered architecture** with a clear separation between presentation, business logic, and data layers, all deployed as Docker containers.

---

## 4.2 Technology Stack Selection

### 4.2.1 Frontend Stack

**Table 4.1 — Frontend Technology Stack**

| Technology | Version | Justification |
|------------|---------|---------------|
| **React** | 19.2.0 | Latest stable; Actions, transitions, improved async patterns |
| **TypeScript** | 5.9.3 | Type safety catches errors at compile-time |
| **Vite** | 7.2.4 | Fast HMR dev server; optimised production builds |
| **Tailwind CSS** | 4.1.17 | Utility-first CSS; no runtime overhead; dark mode ready |
| **React Router** | 7.9.6 | SPA routing with nested layouts |
| **TanStack Query** | 5.90.16 | Server-state caching, background refetching, optimistic updates |
| **React Hook Form** | 7.70.0 | Performant forms with minimal re-renders |
| **Zod** | 4.3.4 | Schema-first runtime + type validation |
| **Recharts** | 3.5.0 | Composable chart library built on D3 |
| **Axios** | 1.13.2 | HTTP client with interceptor support for CSRF tokens |
| **Zustand** | 5.0.8 | Minimal global state for UI flags |
| **Lucide React** | 0.562.0 | Consistent icon set, tree-shakeable |
| **date-fns** | 4.1.0 | Lightweight date manipulation without Moment.js overhead |

### 4.2.2 Backend Stack

**Table 4.2 — Backend Technology Stack**

| Technology | Version | Justification |
|------------|---------|---------------|
| **Spring Boot** | 3.2.5 | Production-grade Java framework; auto-configuration |
| **Spring Security** | 6.x | Enterprise-grade auth; JWT + CSRF support |
| **Spring Data JPA** | 3.2.x | Repository abstraction; pagination built-in |
| **Hibernate** | 6.x | ORM; avoids raw SQL for standard CRUD |
| **MySQL** | 8.0 | Robust ACID-compliant RDBMS; JSON support |
| **Flyway** | 10.x | Version-controlled schema evolution |
| **Lombok** | 1.18.30 | Reduces boilerplate; `@Getter`, `@Setter`, `@Builder` |
| **MapStruct** | 1.5.x | Compile-time DTO ↔ entity mapping; zero-runtime overhead |
| **JJWT (io.jsonwebtoken)** | 0.12.x | JWT generation and validation |
| **BCrypt** | Spring Security built-in | Password hashing at strength 10 |
| **Gradle** | 8.x | Dependency management; faster than Maven |

---

## 4.3 High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          User Browser                                │
│                   React 19 SPA (TypeScript + Vite)                   │
└─────────────────────────────┬────────────────────────────────────────┘
                              │ HTTP/HTTPS (port 80/443)
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     Nginx Reverse Proxy                              │
│  ┌──────────────────┐        ┌───────────────────────────────────┐   │
│  │ Static React     │        │  /api/* → http://backend:8080     │   │
│  │ Files (dist/)    │        │  CORS headers, gzip, SSL termination│  │
│  └──────────────────┘        └───────────────────────────────────┘   │
└─────────────────────────────┬────────────────────────────────────────┘
                              │ Internal Docker network
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   Spring Boot API (port 8080)                        │
│                                                                      │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Security   │  │ Controllers │  │  Services    │  │ Repositories│ │
│  │ Filter     │  │ (REST Layer)│  │ (Logic Layer)│  │ (Data Layer)│ │
│  │ Chain      │  │             │  │              │  │             │  │
│  └────────────┘  └─────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────┬────────────────────────────────────────┘
                              │ JDBC/JPA
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   MySQL 8.0 (port 3306)                              │
│                  finance_tracker database                            │
│              15 tables, Flyway-managed migrations                    │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.3.1 Docker Compose Service Stack

Three named containers communicate over an internal bridge network:

| Service | Container | Image | Internal Port |
|---------|-----------|-------|--------------|
| `finance-db` | MySQL database | mysql:8.0 | 3306 |
| `finance-api` | Spring Boot app | custom Gradle build | 8080 |
| `finance-ui` | Nginx + React | custom multi-stage build | 80 |

Health checks ensure the API container waits for the database to be ready before accepting connections.

---

## 4.4 Backend Architecture

### 4.4.1 Layered Architecture

```
┌──────────────────────────────────────┐
│         REST Controllers             │  ← @RestController, @RequestMapping
│  Handles HTTP, input validation,     │
│  auth principal extraction           │
├──────────────────────────────────────┤
│           Service Layer              │  ← @Service, @Transactional
│  Business logic, transaction         │
│  management, event generation        │
├──────────────────────────────────────┤
│         Repository Layer             │  ← extends JpaRepository
│  Database access, JPQL queries,      │
│  Specifications for dynamic filters  │
├──────────────────────────────────────┤
│           Entity Layer               │  ← @Entity, @Table (JPA)
│  Domain model; mapped to DB tables   │
└──────────────────────────────────────┘
```

### 4.4.2 Security Architecture

```
HTTP Request
     │
     ▼
JwtAuthenticationFilter (OncePerRequestFilter)
     │  reads auth_token cookie
     │  validates JWT signature + expiry
     │  checks revoked_tokens table
     │  populates SecurityContext
     ▼
CSRF Filter (CookieCsrfTokenRepository)
     │  reads XSRF-TOKEN cookie
     │  validates X-XSRF-TOKEN request header
     │  (exempt: GET, HEAD, OPTIONS, /auth/login, /auth/register)
     ▼
Authorization
     │  all /api/v1/** requires ROLE_USER
     ▼
Controller Method
     │  @AuthenticationPrincipal UserPrincipal → userId
     │  every query scoped to userId
     ▼
Response
```

JWT Cookie Properties (default profile):

| Property | Value |
|----------|-------|
| Cookie name | `auth_token` |
| HttpOnly | `true` |
| Secure | `true` |
| SameSite | `Strict` |
| Expiry (default) | 1 hour |
| Expiry (rememberMe) | 30 days |
| Algorithm | HS512 |

### 4.4.3 Controllers Overview

| Controller | Base Path | Endpoint Count |
|-----------|-----------|---------------|
| `AuthController` | `/api/v1/auth` | 7 |
| `AccountController` | `/api/v1/accounts` | 8 |
| `TransactionController` | `/api/v1/transactions` | 6 |
| `CategoryController` | `/api/v1/categories` | 5 |
| `BudgetController` | `/api/v1/budgets` | 7 |
| `RecurringTransactionController` | `/api/v1/recurring-transactions` | 6 |
| `TagController` | `/api/v1/tags` | 5 |
| `DashboardController` | `/api/v1/dashboard` | 1 |
| `ReportController` | `/api/v1/reports` | 4 |
| `ImportExportController` | `/api/v1/import-export` | 4 |
| `CurrencyController` | `/api/v1/currencies` | 8 |
| `NotificationController` | `/api/v1/notifications` | 10 |
| `SearchController` | `/api/v1/search` | 7 |
| `UserSettingsController` | `/api/v1/settings` | 4 |
| **Total** | | **82 endpoints** |

---

## 4.5 Frontend Architecture

### 4.5.1 Application Layer Structure

```
src/
├── main.tsx              ← Entry point; ReactDOM.createRoot
├── App.tsx               ← Route definitions (React Router v7)
├── config/
│   └── api.ts            ← ENDPOINTS constant (centralised URL registry)
├── lib/
│   └── api-client.ts     ← Axios instance; CSRF token interceptor; 401 redirect
├── contexts/
│   └── AuthContext.tsx   ← Global auth state; useAuth() hook
├── services/             ← One file per feature; calls apiClient
│   ├── auth.service.ts
│   ├── account.service.ts
│   ├── transaction.service.ts
│   └── ...
├── hooks/                ← TanStack Query hooks per feature
│   ├── useAccounts.ts
│   ├── useBudgets.ts
│   └── ...
├── components/           ← Reusable UI components (35+)
│   ├── ui/               ← Primitive components (Button, Modal, Table…)
│   ├── layout/           ← AppLayout, Sidebar, Header
│   ├── dashboard/
│   ├── transactions/
│   └── ...
├── pages/                ← Route-level page components (14 pages)
└── store/                ← Zustand stores for client-side global state
```

### 4.5.2 Data Flow Pattern

```
Page Component
    │ uses React Query hook
    ▼
useTransactions() hook    ← TanStack Query (cache, stale-while-revalidate)
    │ calls service method
    ▼
transactionService.getAll()
    │ uses apiClient
    ▼
apiClient (Axios)
    │ attaches auth_token cookie (browser auto)
    │ attaches X-XSRF-TOKEN header (interceptor)
    ▼
nginx → Spring Boot API → DB → response JSON
    │
    ▼
TanStack Query caches response
    │ cache invalidated on mutation
    ▼
React re-renders UI
```

---

## 4.6 Database Design

### 4.6.1 Entity Relationship Diagram

```
users ──────────────────────────────────────────────────────────────────┐
  │                                                                      │
  ├──< accounts                                                          │
  │       │                                                              │
  │       ├──< transactions >──< transaction_tags >──< tags             │
  │       │       │                                                      │
  │       │       └── category_id FK                                    │
  │       │                                                              │
  │       └──< recurring_transactions                                   │
  │                                                                      │
  ├──< categories (self-referencing via parent_id)                       │
  │                                                                      │
  ├──< budgets (linked to category)                                      │
  │                                                                      │
  ├──< notifications                                                     │
  │                                                                      │
  ├──< notification_preferences                                          │
  │                                                                      │
  ├──< saved_searches                                                    │
  │                                                                      │
  ├──< revoked_tokens                                                    │
                                                                         │
currencies (independent reference table, linked to accounts/transactions)│
account_types (lookup table: CHECKING, SAVINGS, CREDIT_CARD, CASH…)    │
```

### 4.6.2 Database Tables Summary

**Table 4.3 — Database Tables (V1–V20 Migrations)**

| Table | Migration | Primary Purpose |
|-------|-----------|----------------|
| `users` | V1 | User accounts; auth, lockout tracking |
| `account_types` | V2 | Lookup: CHECKING, SAVINGS, CREDIT_CARD, CASH, INVESTMENT, LOAN |
| `accounts` | V3 | Financial accounts per user |
| `categories` | V4 | Hierarchical categories (INCOME/EXPENSE), self-referencing |
| `transactions` | V5 | All financial movements; supports INCOME, EXPENSE, TRANSFER |
| `tags` | V6 | User-defined labels for transactions |
| `transaction_tags` | V7 | Many-to-many junction: transactions ↔ tags |
| `budgets` | V8 | Period-based spending limits with alert threshold |
| `recurring_transactions` | V9 | Templates for automated periodic transactions |
| `audit_log` | V10 | Immutable record of entity changes |
| `revoked_tokens` | V11 | Token blocklist for secure logout |
| `(seed)` | V12 | Default categories seeded (INCOME: Salary, Freelance…; EXPENSE: Food, Transport…) |
| `currencies` | V13 | ISO 4217 currency definitions + exchange rates |
| `(data)` | V14 | Currency relationship data migration |
| `saved_searches` | V15 | Persisted search queries per user |
| `notifications` | V16 | In-app notification records |
| `notification_preferences` | V17 | Per-user notification type settings |
| `(data)` | V18 | Additional currencies inserted |
| `(data)` | V19 | NPR set as default system currency |
| `(data)` | V20 | NPR default applied to accounts and transactions |

### 4.6.3 Transactions Table Key Design Decisions

- **`transaction_type ENUM('INCOME','EXPENSE','TRANSFER')`** — three-value discriminator column.
- **`transfer_to_account_id`** and **`transfer_transaction_id`** — self-reference to link the two halves of a transfer.
- **`recurring_transaction_id`** — links auto-created transactions back to their template.
- **`DECIMAL(15,2)`** for all monetary columns — no floating-point precision loss.
- **`is_pending`, `is_reconciled`, `is_void`** — lifecycle flags for transaction state.

### 4.6.4 Categories Hierarchical Design

```
categories table:
  parent_id NULL  → root category (level 0)
  parent_id = x  → subcategory of x (level 1)
  path = "1/5"   → materialized path for efficient subtree queries
  is_system = true → seeded defaults; non-deletable by users
```

This design supports a two-level hierarchy: **Category → Subcategory**, enabling precise expense tracking (e.g., "Food → Groceries", "Food → Restaurants").

---

## 4.7 API Design Principles

1. **Resource-oriented URIs:** `/api/v1/{resource}/{id}` — nouns not verbs.
2. **HTTP verb semantics:** GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove).
3. **Consistent pagination:** Spring Data `Pageable` with `page`, `size`, `sort` query params.
4. **Standardised error format:**
   ```json
   {
     "errorCode": 3001,
     "message": "Transaction not found",
     "timestamp": "2026-04-01T12:00:00Z",
     "path": "/api/v1/transactions/999"
   }
   ```
5. **Error code taxonomy:**
   - `1xxx` — Authentication errors
   - `2xxx` — Validation errors
   - `3xxx` — Not-found errors
   - `4xxx` — Business logic errors
   - `5xxx` — Server errors

---

## 4.8 Deployment Architecture

### 4.8.1 Docker Compose Profiles

| Profile | File | Use Case |
|---------|------|----------|
| Standard | `docker-compose.yml` | Production deployment |
| Development | `docker-compose.dev.yml` | Local development with volume mounts |
| Demo | `docker-compose.demo.yml` | Seeded demo data; demo user pre-created |
| CI | `docker-compose.ci.yml` | GitHub Actions integration tests |
| Production | `docker-compose.prod.yml` | SSL, env secrets, production settings |

### 4.8.2 Nginx Configuration

Nginx serves two roles:
1. **Static file server:** Serves React build artifacts from `/usr/share/nginx/html`.
2. **Reverse proxy:** Forwards `/api/*` requests to the Spring Boot backend while preserving the `/api` prefix in the upstream request path.

```nginx
location /api/ {
    proxy_pass http://backend:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 4.9 Summary

This chapter has presented:
- The complete technology stack with rationale for each choice.
- A three-tier layered architecture (Controller → Service → Repository).
- The security model: JWT HttpOnly cookies + CSRF double-submit.
- The database schema with 20 Flyway migrations.
- The frontend layer structure and TanStack Query data flow.
- The Docker Compose deployment model.

Chapter 5 covers the implementation details of all major components.

---

> **[← Chapter 3](./CH03_REQUIREMENTS.md) | [Index](./README.md) | [Chapter 5 →](./CH05_IMPLEMENTATION.md)**
