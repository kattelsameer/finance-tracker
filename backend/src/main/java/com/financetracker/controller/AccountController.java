package com.financetracker.controller;

import com.financetracker.dto.account.*;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {
    
    private final AccountService accountService;
    
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }
    
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateAccountRequest request) {
        AccountResponse response = accountService.createAccount(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAllAccounts(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<AccountResponse> accounts;
        if (activeOnly) {
            accounts = accountService.getActiveAccounts(userPrincipal.getId());
        } else {
            accounts = accountService.getAllAccounts(userPrincipal.getId());
        }
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        AccountResponse response = accountService.getAccount(userPrincipal.getId(), id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateAccountRequest request) {
        AccountResponse response = accountService.updateAccount(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean hard) {
        if (hard) {
            accountService.hardDeleteAccount(userPrincipal.getId(), id);
        } else {
            accountService.deleteAccount(userPrincipal.getId(), id);
        }
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "Account deleted successfully");
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/net-worth")
    public ResponseEntity<Map<String, BigDecimal>> getNetWorth(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BigDecimal netWorth = accountService.getNetWorth(userPrincipal.getId());
        
        Map<String, BigDecimal> result = new HashMap<>();
        result.put("netWorth", netWorth);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/types")
    public ResponseEntity<List<AccountTypeResponse>> getAccountTypes() {
        List<AccountTypeResponse> types = accountService.getAllAccountTypes();
        return ResponseEntity.ok(types);
    }
}
