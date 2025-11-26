-- =====================================================
-- V8: Create budgets table
-- =====================================================

CREATE TABLE budgets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    budget_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    period_type ENUM('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') DEFAULT 'MONTHLY',
    start_date DATE NOT NULL,
    end_date DATE,
    alert_threshold INT DEFAULT 80,
    alert_enabled BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_budgets_user (user_id),
    INDEX idx_budgets_category (category_id),
    INDEX idx_budgets_active (user_id, is_active),
    INDEX idx_budgets_dates (start_date, end_date),
    
    CONSTRAINT fk_budgets_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_budgets_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
