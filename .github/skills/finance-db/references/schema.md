# Database Schema — Finance Tracker

## Table of Contents
- [users](#users)
- [account_types](#account_types)
- [accounts](#accounts)
- [categories](#categories)
- [transactions](#transactions)
- [tags](#tags)
- [transaction_tags](#transaction_tags)
- [budgets](#budgets)
- [recurring_transactions](#recurring_transactions)
- [audit_log](#audit_log)
- [revoked_tokens](#revoked_tokens)
- [currencies](#currencies)
- [saved_searches](#saved_searches)
- [notifications](#notifications)
- [notification_preferences](#notification_preferences)

## users
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK AUTO_INCREMENT | |
| username | VARCHAR | UNIQUE |
| email | VARCHAR | UNIQUE |
| password | VARCHAR | BCrypt hashed |
| display_name | VARCHAR | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

## accounts
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users(id) | ON DELETE CASCADE |
| account_type_id | BIGINT FK → account_types(id) | |
| name | VARCHAR(100) | |
| balance | DECIMAL(15,2) | Current balance |
| currency | VARCHAR(3) | DEFAULT 'USD' |
| created_at / updated_at | TIMESTAMP | |

Indexes: `idx_accounts_user(user_id)`

## categories
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users(id) | ON DELETE CASCADE |
| parent_id | BIGINT FK → categories(id) | Nullable, self-referencing hierarchy |
| name | VARCHAR | |
| type | ENUM('INCOME','EXPENSE') | |
| is_system | BOOLEAN | DEFAULT FALSE, system categories are read-only |
| color_code | VARCHAR | |
| icon | VARCHAR | |

## transactions
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users(id) | ON DELETE CASCADE |
| account_id | BIGINT FK → accounts(id) | ON DELETE CASCADE |
| category_id | BIGINT FK → categories(id) | ON DELETE SET NULL |
| transaction_type | ENUM('INCOME','EXPENSE','TRANSFER') | |
| amount | DECIMAL(15,2) | |
| currency | VARCHAR(3) | DEFAULT 'USD' |
| transaction_date | DATE | |
| description | VARCHAR(255) | |
| notes | TEXT | |
| reference_number | VARCHAR(50) | |
| is_recurring | BOOLEAN | DEFAULT FALSE |
| recurring_transaction_id | BIGINT FK | |
| transfer_to_account_id | BIGINT FK → accounts(id) | Required for TRANSFER type |
| transfer_transaction_id | BIGINT FK → transactions(id) | Links paired transfer records |
| created_at / updated_at | TIMESTAMP | |

Indexes: `user_id`, `account_id`, `category_id`, `transaction_date`, `transaction_type`, `(user_id, transaction_date)`, `recurring_transaction_id`

## budgets
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users(id) | |
| category_id | BIGINT FK → categories(id) | |
| amount | DECIMAL(15,2) | Budget limit |
| period_type | ENUM('WEEKLY','MONTHLY','QUARTERLY','YEARLY') | |
| alert_threshold | DECIMAL(5,2) | Default 80.00 (percentage) |
| start_date | DATE | |
| end_date | DATE | |

## recurring_transactions
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users(id) | |
| account_id | BIGINT FK → accounts(id) | |
| category_id | BIGINT FK → categories(id) | |
| amount | DECIMAL(15,2) | |
| transaction_type | ENUM('INCOME','EXPENSE','TRANSFER') | |
| description | VARCHAR | |
| frequency | VARCHAR | e.g., DAILY, WEEKLY, MONTHLY |
| next_execution_date | DATE | |
| start_date / end_date | DATE | |
| is_active | BOOLEAN | |

## notifications
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| user_id | BIGINT FK → users(id) | |
| type | ENUM('BUDGET_ALERT','RECURRING_TRANSACTION','SYSTEM') | |
| priority | ENUM('LOW','NORMAL','HIGH') | |
| title | VARCHAR | |
| message | TEXT | |
| is_read | BOOLEAN | DEFAULT FALSE |
| is_sent | BOOLEAN | DEFAULT FALSE |

## Key Constraints
- All user-scoped tables have `user_id` FK to `users(id)` with CASCADE delete
- Monetary columns always use `DECIMAL(15,2)`
- All tables use `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
- Indexes on `user_id` for every user-scoped table
