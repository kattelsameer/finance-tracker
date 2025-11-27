package com.financetracker.controller;

import com.financetracker.dto.budget.BudgetResponse;
import com.financetracker.dto.budget.CreateBudgetRequest;
import com.financetracker.dto.budget.UpdateBudgetRequest;
import com.financetracker.security.CurrentUser;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {
    
    private final BudgetService budgetService;
    
    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }
    
    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateBudgetRequest request) {
        BudgetResponse budget = budgetService.createBudget(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(budget);
    }
    
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAllBudgets(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false, defaultValue = "false") Boolean activeOnly) {
        List<BudgetResponse> budgets;
        if (Boolean.TRUE.equals(activeOnly)) {
            budgets = budgetService.getActiveBudgetsForUser(currentUser.getId());
        } else {
            budgets = budgetService.getAllBudgetsForUser(currentUser.getId());
        }
        return ResponseEntity.ok(budgets);
    }
    
    @GetMapping("/current")
    public ResponseEntity<List<BudgetResponse>> getCurrentPeriodBudgets(
            @CurrentUser UserPrincipal currentUser) {
        List<BudgetResponse> budgets = budgetService.getCurrentPeriodBudgets(currentUser.getId());
        return ResponseEntity.ok(budgets);
    }
    
    @GetMapping("/alerts")
    public ResponseEntity<List<BudgetResponse>> getBudgetsNearThreshold(
            @CurrentUser UserPrincipal currentUser) {
        List<BudgetResponse> budgets = budgetService.getBudgetsNearThreshold(currentUser.getId());
        return ResponseEntity.ok(budgets);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudgetById(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id) {
        BudgetResponse budget = budgetService.getBudgetById(currentUser.getId(), id);
        return ResponseEntity.ok(budget);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody UpdateBudgetRequest request) {
        BudgetResponse budget = budgetService.updateBudget(currentUser.getId(), id, request);
        return ResponseEntity.ok(budget);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id) {
        budgetService.deleteBudget(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
