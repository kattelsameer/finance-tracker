# Appendices

> **Report Navigation:** [← References](./REFERENCES.md) | [Index](./README.md)

---

## Appendix A — Complete API Endpoint Reference

All endpoints are prefixed with `/api/v1`. Authentication required (JWT cookie) unless marked **Public**.

### A.1 Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user account |
| POST | `/auth/login` | Public | Login; sets `auth_token` HttpOnly cookie |
| POST | `/auth/logout` | ✅ | Logout; revokes JWT |
| GET | `/auth/me` | ✅ | Get current user profile |
| PUT | `/auth/me` | ✅ | Update profile (display name, timezone) |
| POST | `/auth/change-password` | ✅ | Change password |
| GET | `/auth/csrf-token` | Public | Fetch CSRF token (JSON) |

### A.2 Account Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/accounts` | ✅ | Create a new financial account |
| GET | `/accounts` | ✅ | List all active accounts |
| GET | `/accounts/{id}` | ✅ | Get account by ID |
| PUT | `/accounts/{id}` | ✅ | Update account |
| DELETE | `/accounts/{id}` | ✅ | Delete/deactivate account |
| GET | `/accounts/net-worth` | ✅ | Total net worth (assets minus liabilities) |
| GET | `/accounts/types` | ✅ | List account type options |

### A.3 Transaction Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/transactions` | ✅ | Create transaction (INCOME/EXPENSE/TRANSFER) |
| GET | `/transactions` | ✅ | List transactions (paginated, filtered) |
| GET | `/transactions/{id}` | ✅ | Get transaction by ID |
| PUT | `/transactions/{id}` | ✅ | Update transaction |
| DELETE | `/transactions/{id}` | ✅ | Delete transaction |

### A.4 Category Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/categories` | ✅ | Create custom category |
| GET | `/categories` | ✅ | List all categories (with hierarchy) |
| GET | `/categories/{id}` | ✅ | Get category by ID |
| PUT | `/categories/{id}` | ✅ | Update category |
| DELETE | `/categories/{id}` | ✅ | Delete category (non-system only) |

### A.5 Budget Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/budgets` | ✅ | Create budget |
| GET | `/budgets` | ✅ | List budgets with current progress |
| GET | `/budgets/current` | ✅ | Active budgets for current period |
| GET | `/budgets/alerts` | ✅ | Budgets that have crossed alert threshold |
| GET | `/budgets/{id}` | ✅ | Get budget by ID |
| PUT | `/budgets/{id}` | ✅ | Update budget |
| DELETE | `/budgets/{id}` | ✅ | Delete budget |

### A.6 Recurring Transaction Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/recurring-transactions` | ✅ | Create recurring template |
| GET | `/recurring-transactions` | ✅ | List templates |
| GET | `/recurring-transactions/{id}` | ✅ | Get template by ID |
| PUT | `/recurring-transactions/{id}` | ✅ | Update template |
| DELETE | `/recurring-transactions/{id}` | ✅ | Delete template |
| POST | `/recurring-transactions/process-due` | ✅ | Manually trigger processing (admin) |

### A.7 Tag Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/tags` | ✅ | Create tag |
| GET | `/tags` | ✅ | List tags |
| GET | `/tags/{id}` | ✅ | Get tag by ID |
| PUT | `/tags/{id}` | ✅ | Update tag |
| DELETE | `/tags/{id}` | ✅ | Delete tag |

### A.8 Dashboard & Reports Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | ✅ | Summary statistics (balances, income, expenses, savings) |
| GET | `/reports/transactions` | ✅ | Transaction report with filters (category, date range, type) |
| GET | `/reports/transactions/export` | ✅ | Export filtered report as CSV file |

### A.9 Import / Export Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/import-export/import/csv` | ✅ | Import transactions from CSV file |
| GET | `/import-export/export/csv` | ✅ | Export transactions to CSV (date range via `startDate` and `endDate`) |

### A.10 Currency Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/currencies` | ✅ | List active currencies with exchange rates |
| GET | `/currencies/all` | ✅ | List all currencies (including inactive) |
| GET | `/currencies/{code}` | ✅ | Get currency by ISO code (e.g., NPR, USD) |
| GET | `/currencies/base` | ✅ | Get the current base/default currency |
| POST | `/currencies/convert` | ✅ | Convert amount between two currencies |
| POST | `/currencies/update-rates` | ✅ | Bulk update exchange rates |
| POST | `/currencies/refresh-rates` | ✅ | Refresh rates (alias for update-rates) |
| PUT | `/currencies/exchange-rate` | ✅ | Update a single currency’s exchange rate |
| POST | `/currencies/initialize` | ✅ | Initialise currency data (admin use) |

### A.11 Notification Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | ✅ | List notifications (paginated, by type) |
| GET | `/notifications/unread` | ✅ | List unread notifications |
| GET | `/notifications/unread/count` | ✅ | Get unread notification count |
| PATCH | `/notifications/{id}/read` | ✅ | Mark notification as read |
| PATCH | `/notifications/read-all` | ✅ | Mark all notifications as read |
| DELETE | `/notifications/{id}` | ✅ | Delete notification |
| GET | `/notifications/preferences` | ✅ | Get notification preferences |
| PUT | `/notifications/preferences` | ✅ | Update notification preferences |
| DELETE | `/notifications/cleanup` | ✅ | Delete all read notifications (bulk cleanup) |

### A.12 Search Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/search/transactions` | ✅ | Advanced transaction search with multiple filters |
| GET | `/search/saved` | ✅ | List all saved searches for current user |
| GET | `/search/saved/{id}` | ✅ | Get a specific saved search by ID |
| POST | `/search/saved` | ✅ | Save a new search query |
| PUT | `/search/saved/{id}` | ✅ | Update an existing saved search |
| DELETE | `/search/saved/{id}` | ✅ | Delete a saved search |
| PATCH | `/search/saved/{id}/set-default` | ✅ | Set a saved search as the default |

### A.13 Settings Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/settings/currency-change` | ✅ | Change user’s default currency (recalculates account balances) |

**Total: 73 endpoints** across 14 controllers.

---

## Appendix B — Flyway Migration Reference

| Migration | Filename | Tables / Changes |
|-----------|----------|-----------------|
| V1 | `V1__create_users_table.sql` | `users` |
| V2 | `V2__create_account_types_table.sql` | `account_types` |
| V3 | `V3__create_accounts_table.sql` | `accounts` |
| V4 | `V4__create_categories_table.sql` | `categories` |
| V5 | `V5__create_transactions_table.sql` | `transactions` |
| V6 | `V6__create_tags_table.sql` | `tags` |
| V7 | `V7__create_transaction_tags_table.sql` | `transaction_tags` |
| V8 | `V8__create_budgets_table.sql` | `budgets` |
| V9 | `V9__create_recurring_transactions_table.sql` | `recurring_transactions` |
| V10 | `V10__create_audit_log_table.sql` | `audit_log` |
| V11 | `V11__create_revoked_tokens_table.sql` | `revoked_tokens` |
| V12 | `V12__seed_default_categories.sql` | Seed: Income + Expense default categories |
| V13 | `V13__create_currencies_table.sql` | `currencies` |
| V14 | `V14__add_currency_relationships.sql` | Data: currency foreign keys |
| V15 | `V15__create_saved_searches_table.sql` | `saved_searches` |
| V16 | `V16__create_notifications_table.sql` | `notifications` |
| V17 | `V17__create_notification_preferences_table.sql` | `notification_preferences` |
| V18 | `V18__add_additional_currencies.sql` | Data: AED, GBP, EUR, AUD, SGD |
| V19 | `V19__set_npr_as_default_currency.sql` | Data: NPR = system default |
| V20 | `V20__set_npr_as_default_account_transaction_currency.sql` | Data: NPR applied to accounts/transactions |

**Demo migrations (V100–V107)** — under `db/demo/`:

| Migration | Purpose |
|-----------|---------|
| V100 | Seed demo user (`demo` / `Demo123!`) + 4 accounts |
| V101 | Seed demo categories |
| V102 | Seed 3 months of demo transactions (NPR amounts) |
| V103 | Seed demo budgets |
| V104 | Seed demo recurring transactions |
| V105 | Seed demo notifications |
| V106 | Seed demo saved searches |
| V107 | Seed demo tags + transaction tag links |

---

## Appendix C — Environment Configuration Reference

### C.1 Backend Application Profiles

| Profile | Database URL | Use Case |
|---------|-------------|----------|
| `dev` | `localhost:3306/finance_tracker` | Local development |
| `docker` | `mysql:3306/finance_tracker` | Docker Compose |
| `demo` | `mysql:3306/finance_tracker` | Demo with seeded data |
| `test` | H2 in-memory | JUnit integration tests |
| `prod` | Configured via env variable | Production deployment |

### C.2 Key Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_DATABASE` | `finance_tracker` | Database name |
| `MYSQL_USER` | `financeuser` | DB username |
| `MYSQL_PASSWORD` | — | DB password (required) |
| `MYSQL_ROOT_PASSWORD` | — | DB root password |
| `APP_JWT_SECRET` | — | HS512 signing secret (≥64 chars recommended) |
| `APP_JWT_EXPIRATION_MS` | `3600000` (1h) | JWT expiry in milliseconds |
| `VITE_API_BASE_URL` | `""` (docker) | Frontend API base URL |
| `SPRING_PROFILES_ACTIVE` | `docker` | Active Spring profile |

### C.3 Frontend Endpoints Config

All API URLs centralised in `src/config/api.ts`:

```typescript
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    LOGOUT: 'auth/logout',
    ME: 'auth/me',
    CHANGE_PASSWORD: 'auth/change-password',
    CSRF_TOKEN: 'auth/csrf-token',
  },
  // Accounts
  ACCOUNTS: 'accounts',
  ACCOUNT_TYPES: 'accounts/types',
  // Categories
  CATEGORIES: 'categories',
  // Transactions
  TRANSACTIONS: 'transactions',
  // Tags
  TAGS: 'tags',
  // Budgets
  BUDGETS: 'budgets',
  // Settings
  SETTINGS: {
    CURRENCY_CHANGE: 'settings/currency-change',
  },
} as const;
```

---

## Appendix D — Default Category Seeds (V12)

### Income Categories

- Salary
- Freelance / Consulting
- Business Income
- Investment Returns
- Rental Income
- Government Benefits
- Gifts Received
- Other Income

### Expense Categories

- 🍔 Food & Dining → Groceries, Restaurants, Coffee & Tea
- 🚗 Transportation → Fuel, Public Transport, Taxi/Ride Share, Vehicle Maintenance
- 🏠 Housing → Rent, Electricity, Water, Internet, Gas, Household Supplies
- 🏥 Health & Medical → Doctor Visits, Medicines, Gym & Fitness
- 🎓 Education → Tuition, Books & Supplies, Online Courses
- 🛍️ Shopping → Clothing, Electronics, Home & Furnishing
- 🎉 Entertainment → Movies & Events, Streaming, Hobbies, Sports
- ✈️ Travel → Flights, Hotels, Tours
- 💼 Business → Office Supplies, Software Subscriptions, Marketing
- 💰 Finance → Bank Fees, Insurance, Taxes, Loan Repayment
- 📱 Communication → Mobile & Phone, Subscriptions
- 👶 Personal Care → Haircut, Beauty, Self Care
- 🤝 Social & Charity → Gifts Given, Donations

---

## Appendix E — Glossary

| Term | Definition |
|------|-----------|
| **BCrypt** | Password hashing algorithm with configurable work factor; Finance Tracker uses strength 10 |
| **CSRF** | Cross-Site Request Forgery; attack mitigated by double-submit cookie pattern |
| **DTO** | Data Transfer Object; separates API contract from JPA entity |
| **E2E** | End-to-End testing; tests the full user journey via a real browser |
| **Flyway** | Database migration tool; version-controls schema changes as numbered SQL files |
| **HttpOnly** | Cookie attribute preventing JavaScript access; protects against XSS |
| **JPA** | Java Persistence API; standard ORM specification implemented by Hibernate |
| **JWT** | JSON Web Token; compact, signed token used for authentication |
| **MapStruct** | Compile-time DTO ↔ entity mapping framework (declared as dependency; services use equivalent hand-written `mapToResponse()` methods) |
| **MockMvc** | Spring test framework for simulating HTTP requests without a real server |
| **NPR** | Nepali Rupee; ISO 4217 currency code `NPR` |
| **REST** | Representational State Transfer; architectural style for HTTP APIs |
| **SameSite** | Cookie attribute controlling cross-site request behaviour |
| **TanStack Query** | Server-state management library for React; caching and background refetching |
| **Vitest** | Vite-native unit testing framework; ESM-first, compatible with Jest API |
| **Zod** | TypeScript-first schema validation; infers TypeScript types from schemas |

---

*End of Report*

---

> **[← References](./REFERENCES.md) | [Index](./README.md)**
