package com.financetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "revoked_tokens")
public class RevokedToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;
    
    public RevokedToken() {
    }
    
    public RevokedToken(String tokenHash, Long userId, LocalDateTime expiresAt) {
        this.tokenHash = tokenHash;
        this.userId = userId;
        this.expiresAt = expiresAt;
        this.revokedAt = LocalDateTime.now();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTokenHash() {
        return tokenHash;
    }
    
    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }
    
    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }
}
