-- Add index for currency in accounts for better query performance
-- Foreign key constraint is not added to allow flexibility with currency values

-- Ensure all existing accounts have a valid currency code
UPDATE accounts SET currency = 'USD' WHERE currency IS NULL OR currency = '';
