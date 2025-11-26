package com.financetracker.service;

import com.financetracker.dto.auth.*;
import com.financetracker.entity.RevokedToken;
import com.financetracker.entity.User;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.RevokedTokenRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;
    
    private final UserRepository userRepository;
    private final RevokedTokenRepository revokedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    
    public AuthService(UserRepository userRepository, 
                       RevokedTokenRepository revokedTokenRepository,
                       PasswordEncoder passwordEncoder, 
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.revokedTokenRepository = revokedTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName() != null ? 
                request.getDisplayName() : request.getUsername());
        user.setDefaultCurrency("USD");
        user.setTimezone("UTC");
        
        user = userRepository.save(user);
        
        logger.info("User registered successfully: {}", user.getUsername());
        
        return AuthResponse.success(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                null
        );
    }
    
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_CREDENTIALS));
        
        // Check if account is locked
        if (user.isLocked()) {
            if (user.getLockoutUntil() != null && 
                    user.getLockoutUntil().isBefore(LocalDateTime.now())) {
                // Lockout period has passed, reset
                user.resetFailedAttempts();
                userRepository.save(user);
            } else {
                logger.warn("Login attempt for locked account: {}", user.getUsername());
                throw new ApiException(ErrorCode.ACCOUNT_LOCKED);
            }
        }
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.incrementFailedAttempts();
            
            if (user.getFailedLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
                user.lockAccount(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
                userRepository.save(user);
                logger.warn("Account locked due to too many failed attempts: {}", user.getUsername());
                throw new ApiException(ErrorCode.ACCOUNT_LOCKED);
            }
            
            userRepository.save(user);
            logger.warn("Failed login attempt for user: {}", user.getUsername());
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS);
        }
        
        // Successful login - reset failed attempts
        user.resetFailedAttempts();
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Generate JWT token
        String token = tokenProvider.generateToken(user.getId(), user.getUsername());
        Date expirationDate = tokenProvider.getExpirationFromToken(token);
        LocalDateTime expiresAt = LocalDateTime.ofInstant(
                expirationDate.toInstant(), ZoneId.systemDefault());
        
        // Set token in HttpOnly cookie
        setAuthCookie(response, token);
        
        logger.info("User logged in successfully: {}", user.getUsername());
        
        return AuthResponse.success(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                expiresAt
        );
    }
    
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response, Long userId) {
        String token = extractTokenFromCookie(request);
        
        if (token != null && tokenProvider.validateToken(token)) {
            // Revoke the token
            String tokenHash = tokenProvider.hashToken(token);
            Date expiration = tokenProvider.getExpirationFromToken(token);
            LocalDateTime expiresAt = LocalDateTime.ofInstant(
                    expiration.toInstant(), ZoneId.systemDefault());
            
            RevokedToken revokedToken = new RevokedToken(tokenHash, userId, expiresAt);
            revokedTokenRepository.save(revokedToken);
        }
        
        // Clear the auth cookie
        clearAuthCookie(response);
        
        logger.info("User logged out: userId={}", userId);
    }
    
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS);
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        logger.info("Password changed for user: {}", user.getUsername());
    }
    
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getDefaultCurrency(),
                user.getTimezone(),
                user.getCreatedAt()
        );
    }
    
    private void setAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(tokenProvider.getCookieName(), token);
        cookie.setHttpOnly(true);
        cookie.setSecure(tokenProvider.isCookieSecure());
        cookie.setPath("/");
        cookie.setMaxAge((int) (tokenProvider.getExpirationMs() / 1000));
        
        // Add SameSite attribute via response header (Cookie API doesn't support SameSite directly)
        String cookieHeader = String.format(
                "%s=%s; Path=/; Max-Age=%d; HttpOnly; %s; SameSite=%s",
                tokenProvider.getCookieName(),
                token,
                (int) (tokenProvider.getExpirationMs() / 1000),
                tokenProvider.isCookieSecure() ? "Secure" : "",
                tokenProvider.getCookieSameSite()
        );
        response.addHeader("Set-Cookie", cookieHeader);
    }
    
    private void clearAuthCookie(HttpServletResponse response) {
        String cookieHeader = String.format(
                "%s=; Path=/; Max-Age=0; HttpOnly; %s; SameSite=%s",
                tokenProvider.getCookieName(),
                tokenProvider.isCookieSecure() ? "Secure" : "",
                tokenProvider.getCookieSameSite()
        );
        response.addHeader("Set-Cookie", cookieHeader);
    }
    
    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (tokenProvider.getCookieName().equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
