-- Add foreign key relationship from accounts to currencies
-- First, ensure all existing accounts have a valid currency code
UPDATE accounts SET currency = 'USD' WHERE currency IS NULL OR currency = '';

-- Add foreign key constraint
ALTER TABLE accounts 
ADD CONSTRAINT fk_accounts_currency 
FOREIGN KEY (currency) REFERENCES currencies(code);

-- Add index for better query performance
CREATE INDEX idx_accounts_currency ON accounts(currency);
