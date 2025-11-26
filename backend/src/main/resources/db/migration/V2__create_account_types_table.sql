-- =====================================================
-- V2: Create account_types table
-- =====================================================

CREATE TABLE account_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_code VARCHAR(20) NOT NULL,
    type_name VARCHAR(50) NOT NULL,
    is_liability BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    
    UNIQUE INDEX idx_account_types_code (type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default account types
INSERT INTO account_types (type_code, type_name, is_liability, display_order) VALUES
    ('CHECKING', 'Checking Account', FALSE, 1),
    ('SAVINGS', 'Savings Account', FALSE, 2),
    ('CASH', 'Cash', FALSE, 3),
    ('CREDIT_CARD', 'Credit Card', TRUE, 4),
    ('INVESTMENT', 'Investment Account', FALSE, 5),
    ('LOAN', 'Loan', TRUE, 6);
