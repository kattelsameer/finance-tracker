-- =====================================================
-- V6: Create tags table
-- =====================================================

CREATE TABLE tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    tag_name VARCHAR(30) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_tags_user_name (user_id, tag_name),
    
    CONSTRAINT fk_tags_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
