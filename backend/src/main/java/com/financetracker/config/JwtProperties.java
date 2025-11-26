package com.financetracker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
    
    private String secret;
    private long expirationMs = 3600000; // 1 hour default
    private String cookieName = "auth_token";
    private boolean cookieSecure = true;
    private String cookieSameSite = "Strict";
    
    public String getSecret() {
        return secret;
    }
    
    public void setSecret(String secret) {
        this.secret = secret;
    }
    
    public long getExpirationMs() {
        return expirationMs;
    }
    
    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }
    
    public String getCookieName() {
        return cookieName;
    }
    
    public void setCookieName(String cookieName) {
        this.cookieName = cookieName;
    }
    
    public boolean isCookieSecure() {
        return cookieSecure;
    }
    
    public void setCookieSecure(boolean cookieSecure) {
        this.cookieSecure = cookieSecure;
    }
    
    public String getCookieSameSite() {
        return cookieSameSite;
    }
    
    public void setCookieSameSite(String cookieSameSite) {
        this.cookieSameSite = cookieSameSite;
    }
}
