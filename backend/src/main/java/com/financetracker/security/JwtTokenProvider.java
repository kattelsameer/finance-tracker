package com.financetracker.security;

import com.financetracker.config.JwtProperties;
import com.financetracker.exception.TokenHashingException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtTokenProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
    
    private final JwtProperties jwtProperties;
    private SecretKey secretKey;
    
    public JwtTokenProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }
    
    @PostConstruct
    public void init() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }
    
    public String generateToken(Long userId, String username) {
        return generateToken(userId, username, jwtProperties.getExpirationMs());
    }
    
    public String generateToken(Long userId, String username, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);
        
        return Jwts.builder()
                .subject(userId.toString())
                .claim("username", username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }
    
    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }
    
    public String getUsernameFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("username", String.class);
    }
    
    public Date getExpirationFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getExpiration();
    }
    
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty");
        } catch (SecurityException ex) {
            logger.error("Invalid JWT signature");
        }
        return false;
    }
    
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new TokenHashingException("SHA-256 algorithm not available", e);
        }
    }
    
    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public long getExpirationMs() {
        return jwtProperties.getExpirationMs();
    }
    
    public String getCookieName() {
        return jwtProperties.getCookieName();
    }
    
    public boolean isCookieSecure() {
        return jwtProperties.isCookieSecure();
    }
    
    public String getCookieSameSite() {
        return jwtProperties.getCookieSameSite();
    }
}
