package com.financetracker.controller;

import com.financetracker.dto.recurring.CreateRecurringTransactionRequest;
import com.financetracker.dto.recurring.RecurringTransactionResponse;
import com.financetracker.dto.recurring.UpdateRecurringTransactionRequest;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.RecurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recurring-transactions")
public class RecurringTransactionController {
    
    private final RecurringTransactionService recurringTransactionService;
    
    public RecurringTransactionController(RecurringTransactionService recurringTransactionService) {
        this.recurringTransactionService = recurringTransactionService;
    }
    
    @PostMapping
    public ResponseEntity<RecurringTransactionResponse> createRecurringTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateRecurringTransactionRequest request) {
        
        RecurringTransactionResponse response = recurringTransactionService
                .createRecurringTransaction(userPrincipal.getId(), request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponse>> getAllRecurringTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        
        List<RecurringTransactionResponse> responses = activeOnly
                ? recurringTransactionService.getActiveRecurringTransactions(userPrincipal.getId())
                : recurringTransactionService.getAllRecurringTransactions(userPrincipal.getId());
        
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RecurringTransactionResponse> getRecurringTransactionById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        
        RecurringTransactionResponse response = recurringTransactionService
                .getRecurringTransactionById(userPrincipal.getId(), id);
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransactionResponse> updateRecurringTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateRecurringTransactionRequest request) {
        
        RecurringTransactionResponse response = recurringTransactionService
                .updateRecurringTransaction(userPrincipal.getId(), id, request);
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        
        recurringTransactionService.deleteRecurringTransaction(userPrincipal.getId(), id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/process-due")
    public ResponseEntity<Void> processDueTransactions() {
        recurringTransactionService.processDueRecurringTransactions();
        return ResponseEntity.ok().build();
    }
}
