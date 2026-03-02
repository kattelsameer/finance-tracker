-- =====================================================
-- V19: Set NPR (Nepalese Rupee) as the system default currency
--
-- Purpose:
--   - Changes the user-facing default currency to NPR.
--   - USD remains the exchange-rate computation base (exchange
--     rates are fetched as "1 USD = X" from the free API).
--   - Existing transaction / account currency codes are intentionally
--     left unchanged here; data conversion is handled explicitly by
--     the user via the Settings → Currency Change workflow
--     (which converts or resets data with the user's consent).
-- =====================================================

-- 1. Update all existing users who still have USD as their default
--    (new registrations already default to NPR via the Java entity)
UPDATE users
SET default_currency = 'NPR'
WHERE default_currency = 'USD';

-- 2. Change the column default so any raw-SQL inserts also get NPR
ALTER TABLE users
    ALTER COLUMN default_currency SET DEFAULT 'NPR';

-- 3. Add secondary_currency column for the secondary display feature
ALTER TABLE users
    ADD COLUMN secondary_currency CHAR(3) DEFAULT NULL
    COMMENT 'Optional secondary display currency (display-only, no data stored in this currency)';

-- 4. Index for secondary_currency lookups (optional, low cardinality)
CREATE INDEX idx_users_secondary_currency ON users (secondary_currency);
