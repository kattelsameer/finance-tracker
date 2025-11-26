package com.financetracker.controller;

import com.financetracker.dto.auth.*;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(authResponse);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        authService.logout(request, response, userPrincipal.getId());
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "Logged out successfully");
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserResponse response = authService.getCurrentUser(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        authService.changePassword(userPrincipal.getId(), request);
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "Password changed successfully");
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/csrf-token")
    public ResponseEntity<Map<String, String>> getCsrfToken(CsrfToken csrfToken) {
        Map<String, String> response = new HashMap<>();
        response.put("token", csrfToken.getToken());
        response.put("headerName", csrfToken.getHeaderName());
        return ResponseEntity.ok(response);
    }
}
