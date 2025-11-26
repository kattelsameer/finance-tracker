-- =====================================================
-- V4: Create categories table
-- =====================================================

CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    parent_id BIGINT,
    category_name VARCHAR(50) NOT NULL,
    category_type ENUM('INCOME', 'EXPENSE') NOT NULL,
    color_code VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'folder',
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_categories_user (user_id),
    INDEX idx_categories_parent (parent_id),
    INDEX idx_categories_type (category_type),
    INDEX idx_categories_active (user_id, is_active),
    
    CONSTRAINT fk_categories_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_categories_parent 
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
