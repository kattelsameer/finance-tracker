# Chapter 5 — Implementation

> **Report Navigation:** [← Chapter 4](./CH04_SYSTEM_DESIGN.md) | [Index](./README.md) | [Chapter 6 →](./CH06_TESTING.md)

---

## 5.1 Introduction

This chapter describes the implementation of Finance Tracker: the reasoning behind each major technical decision and the challenges that arose during development. Rather than presenting source code, the focus is on how the system operates and what principles guided the engineering choices. The chapter follows the sequence in which work was carried out: database structure first, then server-side logic, then the user interface.

---

## 5.2 Development Methodology

Development followed an **iterative, feature-driven approach**, where each new functional area moved through a consistent four-step sequence before work began on the next:

1. **Define the data model** — specify what information needs to be stored and how it relates to existing data.
2. **Implement server-side logic** — write the business rules, calculations, and operations that act on the data.
3. **Build the user interface** — create screens and forms that expose the underlying logic to the user.
4. **Verify with tests** — automated tests confirm the feature works correctly before development moves on.

This database-first discipline ensures that the underlying data structure is explicitly designed before application code is written, rather than retrofitted around it. All changes to the database schema were managed through numbered migration scripts, providing a clear, auditable history of every structural change made during the project.

**Table 5.1 — Development Tools and Purposes**

| Category | Tool | Purpose |
|----------|------|---------|
| Version control | Git and GitHub | Source code history, branching, and peer review |
| Backend build | Gradle | Dependency management and compilation |
| Frontend build | npm and Vite | Package management and production bundling |
| Local integration | Docker Compose | Running the full application stack locally for testing |
| Backend IDE | IntelliJ IDEA | Java development environment |
| Frontend IDE | Visual Studio Code | TypeScript and React development environment |

---

## 5.3 Database Implementation

### 5.3.1 Database Migration Timeline

**Figure 5.1 — Database Migration Timeline V1–V20**

```
V1  users
V2  account_types
V3  accounts
V4  categories
V5  transactions
V6  tags
V7  transaction_tags
V8  budgets
V9  recurring_transactions
V10 audit_log
V11 revoked_tokens
V12 ──── seed default categories ────────────────────────────────── SEED
V13 currencies
V14 currency relationships ────────────────────────────────────── DATA
V15 saved_searches
V16 notifications
V17 notification_preferences
V18 additional currencies ─────────────────────────────────────── DATA
V19 set NPR as default currency ───────────────────────────────── DATA
V20 NPR default for accounts/transactions ─────────────────────── DATA

     [Core Schema]   [Enhancements]          [NPR Localisation]
```

**Table 5.1 — Flyway Migrations V1–V20**

| Migration | Tables Created | Purpose |
|-----------|----------------|---------|
| V1 | `users` | Authentication, lockout, preferences |
| V2 | `account_types` | Lookup table: 6 account types |
| V3 | `accounts` | Financial account management |
| V4 | `categories` | Hierarchical category system |
| V5 | `transactions` | Core transaction recording |
| V6 | `tags` | Transaction tagging |
| V7 | `transaction_tags` | Many-to-many link table |
| V8 | `budgets` | Budget with alert threshold |
| V9 | `recurring_transactions` | Periodic transaction templates |
| V10 | `audit_log` | Immutable change history |
| V11 | `revoked_tokens` | Token blocklist for secure logout |
| V12 | — | Seeded default income/expense categories |
| V13 | `currencies` | ISO 4217 currencies + exchange rates |
| V14 | — | Currency relationship data |
| V15 | `saved_searches` | Persisted search queries |
| V16 | `notifications` | In-app notification records |
| V17 | `notification_preferences` | Per-user notification settings |
| V18 | — | Additional currencies (AED, GBP, etc.) |
| V19 | — | NPR set as system default |
| V20 | — | NPR applied to existing accounts/transactions |

### 5.3.2 Key Schema Design Decisions

**Financial precision:** All monetary amounts are stored in a fixed-point decimal format, supporting values up to fifteen digits with two decimal places. This directly avoids the rounding errors inherent in floating-point representations, which are entirely unsuitable for financial calculations (Goldberg, 1991).

**Soft deletion:** Accounts, categories, and tags are deactivated rather than permanently removed. This preserves the full history of financial records — a user who deactivates an account can still see all transactions that were associated with it. Permanent removal is reserved for cases where referential integrity must be maintained jointly, such as both sides of a transfer.

**Hierarchical category paths:** Each category stores the full chain of its ancestors as a text path, enabling efficient retrieval of an entire category subtree without requiring recursive database queries. This technique — the materialised path pattern (Celko, 2004) — keeps category lookups fast even as the hierarchy grows.

---

## 5.4 Backend Implementation

### 5.4.1 Layered Architecture

The server-side application is structured around four clearly separated layers. This architectural pattern (Fowler, 2002) ensures that each layer has a single, well-defined responsibility and interacts only with the layer directly adjacent to it:

**Table 5.3 — Backend Application Layers**

| Layer | Responsibility | Isolation Principle |
|-------|---------------|---------------------|
| **Controller** | Receives incoming requests, validates input, and returns structured responses | Has no knowledge of database internals |
| **Service** | Applies business rules and coordinates multi-step operations | Where all decisions and calculations are made |
| **Repository** | Reads and writes data to the database | Has no knowledge of HTTP or business rules |
| **Entity** | Represents a database table as a structured data object | Contains no logic, only data shape |

This strict separation means that the database access strategy can be changed without affecting business rules, and business rules can be tested without simulating HTTP requests. Supporting modules handle security (authentication filtering and CSRF verification), standardised error responses, and composable query building for complex transaction filter combinations.

### 5.4.2 Business Logic and Data Integrity

The service layer contains the core intelligence of the system. Several processes illustrate how correctness is enforced throughout the application:

**Account balance management:** When a transaction is recorded, the associated account balance is updated within the same operation. The system guarantees that either both the transaction record and the balance change succeed together, or neither takes effect. This property — atomicity — is a fundamental principle of reliable database systems (Gray & Reuter, 1992) and prevents the account from reaching an inconsistent state where a transaction appears but the balance is not updated.

**Transfer transactions:** Recording a transfer between two accounts creates two linked records simultaneously: a debit from the source and a credit to the destination. The two entries are linked so that deleting one automatically removes the other, preventing orphaned records that would distort account balances.

**User data isolation:** Every database query includes a mandatory filter for the currently authenticated user's identifier. This is enforced architecturally — it is structurally impossible for one user's request to read or modify another user's financial data.

**Budget monitoring:** Each time an expense is recorded within a budgeted category, the system recalculates total spending for the current period. If spending crosses the user's configured alert threshold, a notification is generated automatically.

### 5.4.3 Security Architecture

Security was incorporated from the beginning of development rather than applied retrospectively — a practice consistently advocated by software security frameworks (OWASP, 2021). The principal threats and countermeasures are:

**Table 5.4 — Security Threats and Countermeasures**

| Threat | Countermeasure | Effect |
|--------|---------------|--------|
| Session token theft via browser scripts | Token stored in a cookie inaccessible to JavaScript | Page scripts cannot read or copy the token |
| Cross-site request forgery | Data-modifying requests require a separately issued security token in the header | Forged requests from another site cannot include this token |
| Automated password-guessing | Account locked for fifteen minutes after five consecutive failures | Brute-force attempts are blocked |
| Credential exposure if the database is compromised | Passwords stored as irreversible cryptographic hashes | Original passwords cannot be recovered from the database |
| Token reuse after logout | Logged-out tokens recorded in a server-side blocklist | Captured tokens cannot be replayed |
| Cross-user data access | User identifier applied structurally to every database query | Data boundaries are enforced by design, not convention |

Upon a successful login, the server issues a digitally signed authentication token. This token is stored in a special browser cookie that cannot be accessed by any script running on the page, guarding against the most prevalent class of web application attack. The server verifies the token's authenticity and checks it has not been revoked before processing any protected request.

### 5.4.4 Recurring Transaction Automation

A scheduled background process runs once per day. It inspects all active recurring transaction templates, identifies those whose next scheduled date falls on or before the current date, creates the corresponding transaction records, updates account balances, advances each template's next due date, and generates an in-application notification for the user. Supported frequency options include daily, weekly, fortnightly, monthly, quarterly, and yearly. Calendar edge cases — such as a monthly template originally scheduled for the 31st of a month — are handled correctly by rescheduling to the last valid day of shorter months.

### 5.4.5 CSV Data Import and Export

To support data portability and migration from other finance tools, the system provides flexible CSV import and export functionality:

- **Export:** Any filtered transaction view can be downloaded as a comma-separated values file for use in spreadsheet software.
- **Import:** The import function recognises multiple column naming conventions used by different banks and finance applications.

| Field | Accepted Header Variants |
|-------|--------------------------|
| Date | `Date`, `date`, `Transaction Date` |
| Amount | `Amount`, `amount` |
| Description | `Description`, `description`, `Details` |
| Type | `Type`, `type`, `Transaction Type` |
| Category | `Category`, `category` |
| Notes | `Notes`, `notes`, `Memo` |

Supported date formats: `yyyy-MM-dd`, `MM/dd/yyyy`, `dd/MM/yyyy`, `M/d/yyyy`.

### 5.4.6 Standardised Error Responses

All error responses from the system follow a consistent, structured format: a machine-readable numeric error code, a human-readable message, and a timestamp. This predictable structure allows client applications to handle errors programmatically without parsing unstructured text. Error codes are organised by category:

| Code Range | Error Category |
|-----------|---------------|
| 1000–1999 | Authentication and authorisation |
| 2000–2999 | Input validation |
| 3000–3999 | Resource not found |
| 4000–4999 | Business rule violations |
| 5000–5999 | Unexpected server errors |

### 5.4.7 API Surface

The backend exposes a total of 73 distinct service endpoints across 14 functional areas:

**Table 5.6 — API Areas and Endpoint Counts**

| Functional Area | Endpoint Count |
|----------------|---------------|
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
| **Total** | **73** |

---

## 5.5 Frontend Implementation

### 5.5.1 Application Structure

The user interface is delivered as a single-page application — the browser loads the application once and then dynamically updates the displayed content as the user navigates, without triggering full page reloads. This approach, increasingly standard in modern web development (Mikkonen & Taivalsaari, 2008), produces a more fluid experience resembling a native desktop application.

The application is organised into distinct horizontal layers, each with a limited and well-defined responsibility:

**Table 5.7 — Frontend Application Layers**

| Layer | Role | Description |
|-------|------|-------------|
| **Pages** | Screen-level views | One per major section: Dashboard, Transactions, Budgets, Reports, and others |
| **Components** | Reusable interface blocks | Charts, data tables, forms, dialogs, and input controls — 35+ in total |
| **Hooks** | Data coordination | Manage fetching, caching, and synchronisation of server data |
| **Services** | Network communication | One file per feature area, responsible for making API calls |
| **API Client** | Shared HTTP transport | Centrally configured to attach authentication and security tokens to every request |

### 5.5.2 Server Communication and Caching

Communication with the backend is abstracted so that individual interface components never need to handle token management, authentication errors, or retry logic. A shared API client manages these concerns automatically across all requests.

Above this sits a data caching layer that holds recently fetched data in memory. When a component requests the current transaction list, the cache is checked first. If a sufficiently fresh copy exists, it is returned immediately without a network round-trip. If the cached data is older than thirty seconds, a background refresh is triggered whilst the existing data continues to be displayed — a pattern known as stale-while-revalidate (Nottingham, 2010). When the user records a new transaction, the relevant cached datasets are automatically marked stale and refreshed, ensuring the interface remains consistent with the server state.

### 5.5.3 State Management

Different kinds of application state are managed by mechanisms suited to their nature:

- **Server state** — data originating from the backend — is managed by the caching layer described above.
- **Form state** — data currently being entered by the user — is managed locally within each form component, with immediate validation feedback.
- **Global interface state** — such as whether a modal dialog is open — is managed by a lightweight global store.

This intentional separation prevents the complexity that arises when a single state management solution is required to handle concerns beyond its intended scope (Abramov, 2015).

### 5.5.4 Form Validation

All user-facing forms implement client-side validation before any data is submitted to the server. Validation rules are defined as structured schemas — declarative specifications of what constitutes valid input — that enforce constraints such as: amounts must be positive numbers; a transaction date is required; a description may not exceed 500 characters.

These schemas serve two purposes simultaneously: they generate the runtime validation logic that provides immediate feedback to the user, and they define the data types used throughout the frontend codebase — eliminating a category of type-related bugs before the application is run (Pierce, 2002). Validation is also applied independently on the server so that neither layer relies on the other for data integrity.

### 5.5.5 Financial Visualisation

The reporting section presents financial data through interactive charts:

- **Income versus expense bar chart:** A month-by-month comparison showing total income and total expenses side by side, making surpluses and deficits immediately visible.
- **Spending by category:** A horizontal bar chart ranked by total expenditure per category, identifying the user's largest expense areas at a glance.
- **Net savings trend:** A line chart showing the cumulative difference between income and expenses over the selected time period.

All charts respond to the date range filter applied in the report controls, and amounts are formatted in the user's selected display currency.

### 5.5.6 Component Organisation

User interface components are organised into functional families:

- **Primitive controls:** Consistent building blocks — buttons, text fields, dropdown lists, date pickers, and modal dialogs — used throughout all screens.
- **Layout components:** Navigation sidebar, page header with notification indicator, and responsive page wrappers.
- **Feature components:** Higher-level assemblies combining primitives to implement specific functions, such as the transaction table, budget progress card, and category selector.
- **Report components:** The summary statistics panel, account breakdown table, category breakdown table, and report filter controls.

---

## 5.6 Demonstration Data

A self-contained demonstration deployment is provided for evaluation purposes. When activated, it automatically populates the database with a realistic dataset representing three months of financial activity for a fictional Nepali household. The demonstration data includes:

- A pre-configured user account (`demo` / `Demo123!`)
- Multiple financial accounts: a salary bank account, a savings account, a credit card, and a digital wallet
- Over ninety transactions spread across three months, covering both income and a range of expense categories
- Pre-configured monthly budgets with limits expressed in Nepali Rupees
- Active recurring transaction templates representing salary deposits, rent payments, and subscription fees

All amounts use realistic NPR values — for example, a monthly salary of NPR 80,000 and a rent payment of NPR 25,000 — making the charts and reports immediately meaningful in a local context without requiring any manual data entry.

---

## 5.7 Implementation Challenges and Solutions

The following challenges arose during development and were resolved through well-established engineering approaches:

**Table 5.8 — Implementation Challenges and Solutions**

| Challenge | Solution Adopted |
|-----------|-----------------|
| Protecting browser-based mutation requests from cross-site request forgery | The frontend fetches a dedicated security token once from the server and caches it in the HTTP client, which attaches it automatically to every data-modifying request |
| Ensuring both accounts in a fund transfer are always updated together | Both transaction records and both balance changes are executed within a single database transaction — all changes succeed or all are rolled back |
| Calculating correct next-due dates for recurring transactions across different frequency types | A dedicated scheduling calculation handles each frequency independently, including edge cases for fortnightly and quarterly intervals near month or quarter boundaries |
| Filtering transactions by multiple optional criteria that may be combined in any combination | A composable query approach assembles each active filter independently and combines them, avoiding a large number of fixed query variants |
| Displaying NPR-formatted amounts correctly across all browser environments | A currency formatting utility uses the operating system's built-in internationalisation support with a graceful fallback where NPR is not natively available |

---

## 5.8 Summary

This chapter described the implementation of Finance Tracker across its three primary layers:

- **Database:** Twenty incremental migration scripts define a fifteen-table schema, with design decisions prioritising financial precision through fixed-point arithmetic, data preservation through soft deletion, and efficient hierarchical category querying.
- **Backend:** A four-layer architecture enforces clean separation of concerns. Business rules in the service layer govern balance management, transfer atomicity, and budget monitoring. A layered security model addresses the principal threats identified by OWASP. A daily scheduled process automates recurring transactions.
- **Frontend:** A single-page application with layered data access, schema-validated forms, and interactive financial charts. A caching layer keeps server data current without burdening individual components with network concerns.

A demonstration deployment with realistic Nepali financial data supports project evaluation. Chapter 6 presents the testing strategy and quality assurance outcomes.

---

> **[← Chapter 4](./CH04_SYSTEM_DESIGN.md) | [Index](./README.md) | [Chapter 6 →](./CH06_TESTING.md)**
