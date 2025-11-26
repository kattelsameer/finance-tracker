-- =====================================================
-- V5: Create transactions table
-- =====================================================

CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    category_id BIGINT,
    transaction_type ENUM('INCOME', 'EXPENSE', 'TRANSFER') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_date DATE NOT NULL,
    description VARCHAR(255),
    notes TEXT,
    reference_number VARCHAR(50),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_transaction_id BIGINT,
    transfer_to_account_id BIGINT,
    transfer_transaction_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_transactions_user (user_id),
    INDEX idx_transactions_account (account_id),
    INDEX idx_transactions_category (category_id),
    INDEX idx_transactions_date (transaction_date),
    INDEX idx_transactions_type (transaction_type),
    INDEX idx_transactions_user_date (user_id, transaction_date),
    INDEX idx_transactions_recurring (recurring_transaction_id),
    
    CONSTRAINT fk_transactions_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_account 
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_transactions_transfer_account 
        FOREIGN KEY (transfer_to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    CONSTRAINT fk_transactions_transfer_transaction 
        FOREIGN KEY (transfer_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
