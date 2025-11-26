-- =====================================================
-- V11: Create revoked_tokens table (for logout/token revocation)
-- =====================================================

CREATE TABLE revoked_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token_hash VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_revoked_tokens_hash (token_hash),
    INDEX idx_revoked_tokens_user (user_id),
    INDEX idx_revoked_tokens_expires (expires_at),
    
    CONSTRAINT fk_revoked_tokens_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
