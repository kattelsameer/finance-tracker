-- =====================================================
-- V7: Create transaction_tags junction table
-- =====================================================

CREATE TABLE transaction_tags (
    transaction_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    
    PRIMARY KEY (transaction_id, tag_id),
    
    INDEX idx_transaction_tags_tag (tag_id),
    
    CONSTRAINT fk_transaction_tags_transaction 
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_tags_tag 
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
