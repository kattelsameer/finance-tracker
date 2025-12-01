package com.financetracker.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtProperties.class);
    private static final String DEFAULT_SECRET_PREFIX = "default-dev-secret";
    
    private final Environment environment;
    
    private String secret;
    private long expirationMs = 3600000; // 1 hour default
    private String cookieName = "auth_token";
    private boolean cookieSecure = true;
    private String cookieSameSite = "Strict";
    
    public JwtProperties(Environment environment) {
        this.environment = environment;
    }
    
    @PostConstruct
    public void validateSecret() {
        String[] activeProfiles = environment.getActiveProfiles();
        boolean isProduction = Arrays.asList(activeProfiles).contains("prod") 
                || Arrays.asList(activeProfiles).contains("production");
        
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT secret must be configured. Set the JWT_SECRET environment variable.");
        }
        
        if (secret.startsWith(DEFAULT_SECRET_PREFIX)) {
            if (isProduction) {
                throw new IllegalStateException(
                    "Default JWT secret cannot be used in production! " +
                    "Set a secure JWT_SECRET environment variable with at least 256 bits of entropy."
                );
            } else {
                logger.warn("⚠️  Using default JWT secret. This is only acceptable for development. " +
                           "Set JWT_SECRET environment variable for production deployment.");
            }
        }
        
        // Validate minimum secret length (256 bits = 32 bytes, but base64/hex encoding means ~43+ chars)
        if (secret.length() < 32) {
            throw new IllegalStateException(
                "JWT secret is too short. Must be at least 32 characters (256 bits) for security."
            );
        }
    }
    
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
