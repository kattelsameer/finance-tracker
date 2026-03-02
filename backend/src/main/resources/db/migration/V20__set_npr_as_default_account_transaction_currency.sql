-- =====================================================
-- V20: Set NPR as default currency for accounts,
--      transactions, and recurring_transactions tables.
--
-- This updates:
--   1. Column DEFAULT values (for all future INSERTs)
--   2. Existing rows whose currency is still 'USD'
-- =====================================================

-- 1. Update column defaults
ALTER TABLE accounts
    ALTER COLUMN currency SET DEFAULT 'NPR';

ALTER TABLE transactions
    ALTER COLUMN currency SET DEFAULT 'NPR';

ALTER TABLE recurring_transactions
    ALTER COLUMN currency SET DEFAULT 'NPR';

-- 2. Convert existing rows
UPDATE accounts
SET currency = 'NPR'
WHERE currency = 'USD';

UPDATE transactions
SET currency = 'NPR'
WHERE currency = 'USD';

UPDATE recurring_transactions
SET currency = 'NPR'
WHERE currency = 'USD';
