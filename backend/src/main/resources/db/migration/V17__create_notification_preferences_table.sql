-- =====================================================
-- V17: Create notification_preferences table
-- =====================================================

CREATE TABLE notification_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    budget_alerts_enabled BOOLEAN DEFAULT TRUE,
    low_balance_alerts_enabled BOOLEAN DEFAULT TRUE,
    recurring_reminders_enabled BOOLEAN DEFAULT TRUE,
    large_transaction_alerts_enabled BOOLEAN DEFAULT TRUE,
    unusual_spending_alerts_enabled BOOLEAN DEFAULT FALSE,
    monthly_summary_enabled BOOLEAN DEFAULT TRUE,
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    in_app_notifications_enabled BOOLEAN DEFAULT TRUE,
    low_balance_threshold DECIMAL(15, 2) DEFAULT 100.00,
    large_transaction_threshold DECIMAL(15, 2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notification_pref_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
