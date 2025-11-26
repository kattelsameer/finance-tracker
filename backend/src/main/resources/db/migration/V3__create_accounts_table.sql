-- =====================================================
-- V3: Create accounts table
-- =====================================================

CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    account_type_id INT NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    initial_balance DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    institution_name VARCHAR(100),
    account_number_masked VARCHAR(20),
    color_code VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'wallet',
    is_active BOOLEAN DEFAULT TRUE,
    include_in_net_worth BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_accounts_user (user_id),
    INDEX idx_accounts_type (account_type_id),
    INDEX idx_accounts_active (user_id, is_active),
    
    CONSTRAINT fk_accounts_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_accounts_type 
        FOREIGN KEY (account_type_id) REFERENCES account_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
