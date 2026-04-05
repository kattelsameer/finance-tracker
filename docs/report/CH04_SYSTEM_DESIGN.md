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
| **React** | 19.2.0 | Industry-leading component framework for building interactive user interfaces |
| **TypeScript** | 5.9.3 | Typed superset of JavaScript; catches data shape errors at development time |
| **Vite** | 7.2.4 | Modern build tool providing fast development refresh and optimised production output |
| **Tailwind CSS** | 4.1.17 | Utility-based styling system enabling consistent, responsive design without custom CSS |
| **React Router** | 7.9.6 | Client-side routing for the single-page application navigation model |
| **TanStack Query** | 5.90.16 | Server-state management with built-in caching, background synchronisation, and deduplication |
| **React Hook Form** | 7.70.0 | Performant form state management with minimal component re-rendering |
| **Zod** | 4.3.4 | Schema-first validation library; validates both at runtime and generates TypeScript types |
| **Recharts** | 3.5.0 | Composable, declarative charting library for financial visualisations |
| **Axios** | 1.13.2 | HTTP client with request and response interceptor support for automated token handling |
| **Zustand** | 5.0.8 | Lightweight global state management for UI-level shared state |
| **Lucide React** | 0.562.0 | Consistent, accessible icon library with minimal bundle footprint |
| **date-fns** | 4.1.0 | Modular date manipulation library covering all required formatting and calculation needs |

### 4.2.2 Backend Stack

**Table 4.2 — Backend Technology Stack**

| Technology | Version | Justification |
|------------|---------|---------------|
| **Spring Boot** | 3.2.5 | Widely-adopted Java web application framework with comprehensive auto-configuration |
| **Spring Security** | 6.x | Enterprise-grade security framework; selected for its robust JWT filter chain and CSRF support |
| **Spring Data JPA** | 3.2.x | Data access abstraction layer with built-in pagination and dynamic query support |
| **Hibernate** | 6.x | Object-relational mapper; eliminates most handwritten SQL for standard operations |
| **MySQL** | 8.0 | Proven, ACID-compliant relational database management system |
| **Flyway** | 10.x | Version-controlled incremental database migration tool |
| **Lombok** | 1.18.30 | Annotation-based code generation to reduce repetitive boilerplate in entity classes |
| **JJWT** | 0.12.5 | Authentication token generation and validation library |
| **BCrypt** | Spring Security built-in | Industry-standard adaptive password hashing algorithm |
| **Gradle** | 8.x | Flexible build system and dependency management tool |

---

## 4.3 High-Level System Architecture

**Figure 4.1 — System Architecture Overview**

```mermaid
graph TB
    Browser["🌐 User Browser<br/>Single-Page Application"]

    subgraph Docker["Container Network"]
        direction TB

        subgraph UI["Frontend Container"]
            Nginx["Web Server<br/>Static file server<br/>+ Reverse Proxy (/api/*)"]
        end

        subgraph API["Backend Container"]
            Security["Security Filter<br/>(Authentication + CSRF)"]
            Controllers["REST Controllers"]
            Services["Service Layer"]
            Repos["Repository Layer"]
        end

        subgraph DB["Database Container"]
            MySQL["Relational Database<br/>15 tables · 20 migrations"]
        end
    end

    Browser -->|"HTTP/HTTPS port 80/443"| Nginx
    Nginx -->|"Static assets"| Browser
    Nginx -->|"Proxy /api/* → backend"| Security
    Security --> Controllers
    Controllers --> Services
    Services --> Repos
    Repos -->|"SQL queries"| MySQL
```

### 4.3.1 Application Container Stack

**Figure 4.2 — Application Container Stack**

```mermaid
graph LR
    subgraph "Container Deployment"
        DB["Database Container<br/>Relational database<br/>port 3306"]
        API["Backend Container<br/>Java Application<br/>port 8080<br/>depends_on: database"]
        UI["Frontend Container<br/>Web Server + Application<br/>port 80<br/>depends_on: backend"]
    end

    DB -->|"healthcheck passes"| API
    API -->|"healthcheck passes"| UI

    style DB fill:#4CAF50,color:#fff
    style API fill:#2196F3,color:#fff
    style UI fill:#FF9800,color:#fff
```

Three containers communicate over an internal bridge network:

| Container | Role | Internal Port |
|-----------|------|---------------|
| Database | Relational database storing all application data | 3306 |
| Backend | Java application serving the REST API | 8080 |
| Frontend | Web server delivering the application and proxying API calls | 80 |

Health checks ensure each container waits for its dependency to be ready before accepting connections.

---

## 4.4 Backend Architecture

### 4.4.1 Layered Architecture

**Figure 4.3 — Backend Layered Architecture**

```mermaid
graph TB
    subgraph "Spring Boot Application"
        C["Controllers (14)\nReceive HTTP requests\nValidate input\nReturn structured responses"]
        S["Service Layer\nBusiness rules\nBalance calculations\nNotification triggers\nScheduled automation"]
        R["Repository Layer\nDatabase read and write\nDynamic query filtering\nPagination support"]
        E["Entity Layer (13 entities)\nUser, Account, Transaction\nBudget, Category, Tag\nand supporting tables"]
    end

    C --> S
    S --> R
    R --> E
    E --> DB[(MySQL 8.0)]
```

### 4.4.2 Security Architecture

Every incoming request passes through a two-stage security check before reaching any application logic:

**Stage 1 — Authentication verification:** The system reads the authentication token from the browser cookie attached to the request. It verifies the token's digital signature, confirms it has not expired, and checks the server-side revocation list to ensure it has not been invalidated by a previous logout. If any check fails, the request is rejected with a 401 (Unauthorised) response.

**Stage 2 — Cross-site request forgery protection:** For any request that modifies data (create, update, or delete operations), the system also checks for a separately issued security token in the request header. Ordinary browser navigation or a forged request from another website cannot include this header token, so such requests are rejected with a 403 (Forbidden) response. Read-only requests (data retrieval) are not subject to this check.

If both checks pass, the authenticated user's identity is made available to the controller, and all subsequent database queries are automatically scoped to that user's data.

**Table 4.5 — Authentication Token Properties**

| Property | Configuration |
|----------|---------------|
| Storage mechanism | Browser cookie inaccessible to page scripts |
| Transmission security | Flagged to prevent transmission over unencrypted connections |
| Cross-site protection | Configured to prevent the cookie being sent on cross-origin requests |
| Default expiry | 1 hour |
| Extended expiry (Remember Me) | 30 days |
| Signing algorithm | Cryptographic hash-based message authentication (HMAC) |

### 4.4.3 Controllers Overview

| Feature Area | Endpoint Count |
|-------------|---------------|
| Authentication and user profile | 7 |
| Financial accounts | 7 |
| Transactions | 5 |
| Categories | 5 |
| Budgets | 7 |
| Recurring transactions | 6 |
| Tags | 5 |
| Dashboard summary | 1 |
| Financial reports | 2 |
| Data import and export | 2 |
| Currencies | 9 |
| Notifications | 9 |
| Advanced search | 7 |
| User settings | 1 |
| **Total** | **73 endpoints** |

---

## 4.5 Frontend Architecture

### 4.5.1 Application Layer Structure

**Figure 4.4 — Frontend Application Layer Diagram**

```mermaid
graph TD
    subgraph "Application Structure"
        Entry["Application Entry\nInitialises providers and routing"]
        App["Router\nMaps URLs to page components"]

        subgraph "Core Infrastructure"
            ApiClient["API Client\nHTTP transport\nAutomatic token attachment\nSession expiry handling"]
            Auth["Authentication Context\nGlobal login state\naccessible from any component"]
        end

        subgraph "Data Layer"
            Services["Service Files (15)\nOne per feature area\nMake API calls via API Client"]
            Hooks["Data Hooks (7)\nCaching and synchronisation\nQuery invalidation on change"]
        end

        subgraph "Presentation Layer"
            Pages["Pages (14)\nDashboard, Transactions\nAccounts, Budgets, Reports..."]
            Components["Components (35+)\nInput controls, tables\ncharts, modals, layout"]
            Store["UI State Store\nModal visibility\nTemporary UI flags"]
        end
    end

    Entry --> App
    App --> Auth
    App --> Pages
    Pages --> Hooks
    Pages --> Components
    Hooks --> Services
    Services --> ApiClient
    Store --> Components
```

### 4.5.2 Data Flow Pattern

When a user navigates to a page that displays data, the following sequence occurs:

1. The page component requests data through a data hook.
2. The hook checks whether a sufficiently recent copy is already cached in memory.
3. If the data is fresh (within 30 seconds), it is returned from the cache immediately — no network request is made.
4. If the data is stale or absent, the hook calls the appropriate service function.
5. The service function passes the request to the API client, which attaches the authentication cookie and security token automatically.
6. The request travels through the web server proxy to the backend application, which queries the database and returns the response.
7. The response is stored in the cache and returned to the page component, which re-renders with the new data.

When the user creates, modifies, or deletes a record, the hook invalidates the relevant cached queries, triggering a background refresh so that the interface remains consistent with the server's actual state.

---

## 4.6 Database Design

### 4.6.1 Entity Relationship Diagram

**Figure 4.5 — Entity Relationship Diagram**

```mermaid
erDiagram
    users {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        boolean is_locked
        int failed_attempts
        timestamp locked_until
        varchar timezone
        varchar preferred_currency
        timestamp created_at
    }
    account_types {
        bigint id PK
        varchar type_name UK
    }
    accounts {
        bigint id PK
        bigint user_id FK
        bigint account_type_id FK
        varchar account_name
        varchar currency
        decimal initial_balance
        decimal current_balance
        varchar institution_name
        boolean is_active
        boolean include_in_net_worth
        timestamp created_at
    }
    categories {
        bigint id PK
        bigint user_id FK
        bigint parent_id FK
        varchar name
        varchar type
        varchar color_code
        varchar icon
        boolean is_system
        varchar path
    }
    transactions {
        bigint id PK
        bigint user_id FK
        bigint account_id FK
        bigint category_id FK
        bigint recurring_transaction_id FK
        bigint transfer_to_account_id FK
        bigint transfer_transaction_id FK
        varchar transaction_type
        decimal amount
        date transaction_date
        varchar description
        varchar notes
        varchar reference_number
        boolean is_pending
        boolean is_reconciled
        timestamp created_at
    }
    tags {
        bigint id PK
        bigint user_id FK
        varchar name UK
    }
    transaction_tags {
        bigint transaction_id FK
        bigint tag_id FK
    }
    budgets {
        bigint id PK
        bigint user_id FK
        bigint category_id FK
        decimal budget_amount
        varchar period_type
        date start_date
        date end_date
        int alert_threshold
        boolean is_active
    }
    recurring_transactions {
        bigint id PK
        bigint user_id FK
        bigint account_id FK
        bigint category_id FK
        varchar frequency
        decimal amount
        date next_occurrence
        date end_date
        boolean is_active
        varchar description
    }
    currencies {
        bigint id PK
        varchar code UK
        varchar name
        varchar symbol
        decimal exchange_rate
        boolean is_base
        boolean is_active
    }
    saved_searches {
        bigint id PK
        bigint user_id FK
        varchar name
        json search_criteria
        boolean is_default
    }
    notifications {
        bigint id PK
        bigint user_id FK
        varchar type
        varchar title
        text message
        boolean is_read
        varchar priority
        boolean is_sent
        timestamp created_at
    }
    notification_preferences {
        bigint id PK
        bigint user_id FK
        boolean budget_alerts
        boolean recurring_reminders
        boolean system_notifications
    }
    revoked_tokens {
        bigint id PK
        varchar token_hash UK
        timestamp revoked_at
        timestamp expires_at
    }
    audit_log {
        bigint id PK
        bigint user_id FK
        varchar entity_type
        bigint entity_id
        varchar action
        json old_values
        json new_values
        timestamp created_at
    }

    users ||--o{ accounts : "owns"
    users ||--o{ categories : "creates"
    users ||--o{ transactions : "records"
    users ||--o{ budgets : "sets"
    users ||--o{ recurring_transactions : "defines"
    users ||--o{ tags : "creates"
    users ||--o{ saved_searches : "saves"
    users ||--o{ notifications : "receives"
    users ||--|| notification_preferences : "has"

    accounts ||--o{ transactions : "contains"
    accounts ||--o{ recurring_transactions : "sources"
    account_types ||--o{ accounts : "classifies"

    categories ||--o{ transactions : "classifies"
    categories ||--o{ budgets : "tracks"
    categories ||--o{ recurring_transactions : "classifies"
    categories |o--o{ categories : "parent→child"

    transactions ||--o{ transaction_tags : "tagged with"
    tags ||--o{ transaction_tags : "applied to"
    recurring_transactions |o--o{ transactions : "generates"
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

### 4.6.4 Category Hierarchical Design

Categories support a two-level hierarchy — a parent category can have multiple subcategories (for example, "Food" → "Groceries" and "Restaurants"). Each category stores its full ancestor path as a text string alongside the parent reference. This materialised path approach enables efficient subtree queries without recursive processing (Celko, 2004). Categories seeded by the system during initial setup cannot be deleted by users, protecting the integrity of the default classification scheme.

This design supports precise expense tracking — for example, a budget on "Food" automatically captures spending recorded against any of its subcategories.

---

## 4.7 API Design Principles

The REST API follows a set of consistent conventions across all endpoints (Fielding, 2000):

1. **Resource-oriented addresses:** Each endpoint identifies a resource by type and, optionally, identifier — for example, `/api/v1/transactions/{id}`. Verbs are expressed through the HTTP method, not the address.
2. **Standard HTTP methods:** GET for retrieval, POST for creation, PUT for replacement, and DELETE for removal.
3. **Consistent paginated responses:** List responses include page number, page size, and total record count so the client can implement navigation without additional requests.
4. **Standardised error responses:** All errors return the same structure: a numeric error code, a human-readable message, a timestamp, and the request path. Error codes are grouped by category — authentication (1xxx), validation (2xxx), not found (3xxx), business rules (4xxx), and server errors (5xxx).

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

### 4.8.2 Web Server Configuration

The web server in the frontend container serves two roles simultaneously:

1. **Static file server:** Delivers the pre-built user interface files to the browser.
2. **Reverse proxy:** Forwards any request beginning with `/api/` to the backend application container on its internal port, so the browser only ever communicates with a single host and port — simplifying both configuration and CORS handling.

---

## 4.9 Summary

This chapter has presented:

- The complete technology stack with rationale for each choice.
- A three-tier layered architecture (Controller → Service → Repository).
- The security model: token-based authentication in protected browser cookies combined with anti-forgery request tokens.
- The database schema with 20 Flyway migrations.
- The frontend layer structure and data caching flow.
- The Docker Compose deployment model.

Chapter 5 covers the implementation details of all major components.

---

> **[← Chapter 3](./CH03_REQUIREMENTS.md) | [Index](./README.md) | [Chapter 5 →](./CH05_IMPLEMENTATION.md)**
