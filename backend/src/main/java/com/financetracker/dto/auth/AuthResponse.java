package com.financetracker.dto.auth;

import java.time.LocalDateTime;

public class AuthResponse {
    
    private Long userId;
    private String username;
    private String email;
    private String displayName;
    private String message;
    private LocalDateTime expiresAt;
    
    public AuthResponse() {
    }
    
    public AuthResponse(Long userId, String username, String email, String displayName, 
                        String message, LocalDateTime expiresAt) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.message = message;
        this.expiresAt = expiresAt;
    }
    
    public static AuthResponse success(Long userId, String username, String email, 
                                        String displayName, LocalDateTime expiresAt) {
        return new AuthResponse(userId, username, email, displayName, "Success", expiresAt);
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
