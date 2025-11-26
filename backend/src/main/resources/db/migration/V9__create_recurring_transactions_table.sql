-- =====================================================
-- V9: Create recurring_transactions table
-- =====================================================

CREATE TABLE recurring_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    category_id BIGINT,
    transaction_type ENUM('INCOME', 'EXPENSE', 'TRANSFER') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description VARCHAR(255),
    frequency ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_occurrence DATE NOT NULL,
    day_of_month INT,
    day_of_week INT,
    transfer_to_account_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    auto_post BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_recurring_user (user_id),
    INDEX idx_recurring_account (account_id),
    INDEX idx_recurring_next (next_occurrence),
    INDEX idx_recurring_active (is_active, next_occurrence),
    
    CONSTRAINT fk_recurring_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_recurring_account 
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_recurring_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_recurring_transfer_account 
        FOREIGN KEY (transfer_to_account_id) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
