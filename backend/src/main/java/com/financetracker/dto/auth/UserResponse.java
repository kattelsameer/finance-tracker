package com.financetracker.dto.auth;

import java.time.LocalDateTime;

public class UserResponse {
    
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String defaultCurrency;
    private String secondaryCurrency;
    private String timezone;
    private LocalDateTime createdAt;
    
    public UserResponse() {
    }
    
    public UserResponse(Long id, String username, String email, String displayName,
                        String defaultCurrency, String secondaryCurrency, String timezone,
                        LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.defaultCurrency = defaultCurrency;
        this.secondaryCurrency = secondaryCurrency;
        this.timezone = timezone;
        this.createdAt = createdAt;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public String getDefaultCurrency() {
        return defaultCurrency;
    }
    
    public void setDefaultCurrency(String defaultCurrency) {
        this.defaultCurrency = defaultCurrency;
    }
    
    public String getSecondaryCurrency() {
        return secondaryCurrency;
    }
    
    public void setSecondaryCurrency(String secondaryCurrency) {
        this.secondaryCurrency = secondaryCurrency;
    }
    
    public String getTimezone() {
        return timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
