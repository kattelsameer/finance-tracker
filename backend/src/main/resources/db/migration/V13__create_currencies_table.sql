CREATE TABLE currencies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(20, 10) NOT NULL DEFAULT 1.0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_base_currency BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active),
    INDEX idx_is_base_currency (is_base_currency)
);

-- Insert default currencies
INSERT INTO currencies (code, name, symbol, exchange_rate, is_base_currency, is_active) VALUES
('USD', 'US Dollar', '$', 1.0, TRUE, TRUE),
('EUR', 'Euro', '€', 0.92, FALSE, TRUE),
('GBP', 'British Pound', '£', 0.79, FALSE, TRUE),
('JPY', 'Japanese Yen', '¥', 149.50, FALSE, TRUE),
('CHF', 'Swiss Franc', 'CHF', 0.88, FALSE, TRUE),
('CAD', 'Canadian Dollar', 'C$', 1.36, FALSE, TRUE),
('AUD', 'Australian Dollar', 'A$', 1.53, FALSE, TRUE),
('CNY', 'Chinese Yuan', '¥', 7.24, FALSE, TRUE),
('INR', 'Indian Rupee', '₹', 83.12, FALSE, TRUE),
('MXN', 'Mexican Peso', '$', 17.05, FALSE, TRUE);
