package com.financetracker.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {
    
    @Size(min = 1, max = 100, message = "Display name must be between 1 and 100 characters")
    private String displayName;
    
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must be at most 255 characters")
    private String email;
    
    @Size(min = 3, max = 10, message = "Currency code must be between 3 and 10 characters")
    private String defaultCurrency;
    
    @Size(max = 50, message = "Timezone must be at most 50 characters")
    private String timezone;
    
    public UpdateProfileRequest() {
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getDefaultCurrency() {
        return defaultCurrency;
    }
    
    public void setDefaultCurrency(String defaultCurrency) {
        this.defaultCurrency = defaultCurrency;
    }
    
    public String getTimezone() {
        return timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
}
