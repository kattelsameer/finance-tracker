package com.financetracker.controller;

import com.financetracker.dto.CreateSavedSearchRequest;
import com.financetracker.dto.SavedSearchResponse;
import com.financetracker.dto.transaction.TransactionResponse;
import com.financetracker.dto.transaction.TransactionSearchRequest;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.SavedSearchService;
import com.financetracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    
    private final TransactionService transactionService;
    private final SavedSearchService savedSearchService;
    
    /**
     * Advanced search for transactions with complex criteria
     */
    @PostMapping("/transactions")
    public ResponseEntity<Page<TransactionResponse>> advancedSearch(
            @Valid @RequestBody TransactionSearchRequest searchRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Page<TransactionResponse> transactions = transactionService.advancedSearch(
                searchRequest, userPrincipal.getId());
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * Get all saved searches for the current user
     */
    @GetMapping("/saved")
    public ResponseEntity<List<SavedSearchResponse>> getAllSavedSearches(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SavedSearchResponse> savedSearches = savedSearchService.getAllSavedSearches(
                userPrincipal.getId());
        return ResponseEntity.ok(savedSearches);
    }
    
    /**
     * Get a specific saved search by ID
     */
    @GetMapping("/saved/{id}")
    public ResponseEntity<SavedSearchResponse> getSavedSearch(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SavedSearchResponse savedSearch = savedSearchService.getSavedSearchById(
                id, userPrincipal.getId());
        return ResponseEntity.ok(savedSearch);
    }
    
    /**
     * Create a new saved search
     */
    @PostMapping("/saved")
    public ResponseEntity<SavedSearchResponse> createSavedSearch(
            @Valid @RequestBody CreateSavedSearchRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SavedSearchResponse savedSearch = savedSearchService.createSavedSearch(
                request, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSearch);
    }
    
    /**
     * Update an existing saved search
     */
    @PutMapping("/saved/{id}")
    public ResponseEntity<SavedSearchResponse> updateSavedSearch(
            @PathVariable Long id,
            @Valid @RequestBody CreateSavedSearchRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SavedSearchResponse savedSearch = savedSearchService.updateSavedSearch(
                id, request, userPrincipal.getId());
        return ResponseEntity.ok(savedSearch);
    }
    
    /**
     * Delete a saved search
     */
    @DeleteMapping("/saved/{id}")
    public ResponseEntity<Void> deleteSavedSearch(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        savedSearchService.deleteSavedSearch(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Set a saved search as default
     */
    @PatchMapping("/saved/{id}/set-default")
    public ResponseEntity<SavedSearchResponse> setDefaultSearch(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SavedSearchResponse savedSearch = savedSearchService.setDefaultSearch(
                id, userPrincipal.getId());
        return ResponseEntity.ok(savedSearch);
    }
}
