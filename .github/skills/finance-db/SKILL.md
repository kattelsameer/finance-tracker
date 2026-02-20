---
name: finance-db
description: Database and migration skill for the Finance Tracker application. Use when creating Flyway migrations, modifying database schema, managing demo data, troubleshooting DB issues, or working with MySQL/H2 configuration. Triggers on requests like "create a migration", "add a column", "new table", "update schema", "fix migration", "add demo data", or "database issue".
---

# Finance Tracker Database & Migrations

## Database Setup

| Environment | Engine | Connection |
|-------------|--------|------------|
| Production/Docker | MySQL 8.0 | `mysql:3306/finance_tracker` |
| Development | MySQL 8.0 | `localhost:3306/finance_tracker` |
| Testing | H2 in-memory | Auto-configured by Spring `test` profile |

## Current Schema (V1–V17)

See [references/schema.md](references/schema.md) for full table definitions.

| Version | Table/Change |
|---------|-------------|
| V1 | `users` |
| V2 | `account_types` |
| V3 | `accounts` |
| V4 | `categories` (hierarchical, typed INCOME/EXPENSE) |
| V5 | `transactions` (INCOME/EXPENSE/TRANSFER) |
| V6 | `tags` |
| V7 | `transaction_tags` |
| V8 | `budgets` |
| V9 | `recurring_transactions` |
| V10 | `audit_log` |
| V11 | `revoked_tokens` |
| V12 | Seed default categories (system categories) |
| V13 | `currencies` |
| V14 | Currency relationships |
| V15 | `saved_searches` |
| V16 | `notifications` |
| V17 | `notification_preferences` |

## Creating a New Migration

1. Determine next version number: `V{N}__description.sql` where N = max existing version + 1
2. Place file in `backend/src/main/resources/db/migration/`
3. Follow the naming convention: `V{N}__short_snake_case_description.sql`

**Template:**
```sql
-- =====================================================
-- V{N}: {Description of change}
-- =====================================================

-- Your DDL/DML here
```

**Critical rules:**
- NEVER modify an existing `V*.sql` file — always create a new version
- Use `BIGINT` for IDs, `DECIMAL(15,2)` for monetary amounts
- Always add `user_id` column with FK to `users(id)` and index for user-scoped tables
- Include `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` and `updated_at` on all tables
- Use `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
- Add appropriate indexes (especially for `user_id` and foreign keys)

**After creating migration:**
```bash
# Verify it runs against MySQL
docker compose up -d mysql
source ~/.bash_profile && cd backend && ./gradlew bootRun  # Flyway auto-runs

# Verify tests still pass (H2)
cd backend && ./gradlew test
```

## Modifying Existing Tables

```sql
-- Adding a column
ALTER TABLE table_name ADD COLUMN column_name TYPE DEFAULT value;

-- Adding an index
CREATE INDEX idx_table_column ON table_name(column_name);

-- Adding a foreign key
ALTER TABLE child_table
    ADD CONSTRAINT fk_child_parent
    FOREIGN KEY (parent_id) REFERENCES parent_table(id) ON DELETE CASCADE;
```

**H2 compatibility note:** Backend tests use H2. Some MySQL-specific syntax may need adjustments. If a migration uses MySQL-specific features (e.g., `ENUM`, `FULLTEXT INDEX`), verify it works with H2 or add H2-compatible alternatives in `test` profile.

## Demo Data

Demo data lives in `backend/src/main/resources/db/demo/` and runs only in demo mode:

| File | Content |
|------|---------|
| V100 | Demo user (`demo`/`demo123`) + accounts |
| V101 | Categories and tags |
| V102 | Income transactions |
| V103 | Expense transactions (part 1) |
| V104 | Expense transactions (part 2) |
| V105 | Transfers and investments |
| V106 | Budgets and recurring transactions |
| V107 | 2026 transactions |

Demo mode: `docker compose -f docker-compose.demo.yml up -d`

When adding demo data, use version numbers starting from V100+ and ensure data references valid foreign keys from earlier demo seeds.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Flyway migration checksum mismatch` | Existing migration file was modified | Revert the file change; create a new migration instead |
| `Table already exists` | Migration ran partially | Drop the DB and re-run: `docker compose down -v && docker compose up -d` |
| `H2 syntax error in tests` | MySQL-specific SQL not H2-compatible | Use compatible syntax or conditional SQL per dialect |
| `Foreign key constraint fails` | Wrong insertion order | Verify parent records exist before inserting children |
