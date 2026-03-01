package com.financetracker.service;

import com.financetracker.dto.budget.BudgetResponse;
import com.financetracker.dto.budget.CreateBudgetRequest;
import com.financetracker.dto.budget.UpdateBudgetRequest;
import com.financetracker.dto.category.CategoryResponse;
import com.financetracker.entity.Budget;
import com.financetracker.entity.Budget.PeriodType;
import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@SuppressWarnings("null")
public class BudgetService {
    
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    
    public BudgetService(BudgetRepository budgetRepository,
                         UserRepository userRepository,
                         CategoryRepository categoryRepository,
                         TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }
    
    public BudgetResponse createBudget(Long userId, CreateBudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));
        }
        
        // Validate dates
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new ApiException(ErrorCode.INVALID_DATE_RANGE);
        }
        
        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setBudgetName(request.getBudgetName());
        budget.setAmount(request.getAmount());
        budget.setPeriodType(request.getPeriodType() != null ? request.getPeriodType() : PeriodType.MONTHLY);
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setAlertThreshold(request.getAlertThreshold() != null ? request.getAlertThreshold() : 80);
        budget.setAlertEnabled(request.getAlertEnabled() != null ? request.getAlertEnabled() : true);
        budget.setIsActive(true);
        
        Budget savedBudget = budgetRepository.save(budget);
        return mapToResponse(savedBudget, userId);
    }
    
    @Transactional(readOnly = true)
    public List<BudgetResponse> getAllBudgetsForUser(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return budgets.stream().map(b -> mapToResponse(b, userId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getActiveBudgetsForUser(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        return budgets.stream().map(b -> mapToResponse(b, userId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getCurrentPeriodBudgets(Long userId) {
        LocalDate today = LocalDate.now();
        List<Budget> budgets = budgetRepository.findActiveBudgetsForPeriod(userId, today);
        return budgets.stream().map(b -> mapToResponse(b, userId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BudgetResponse getBudgetById(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.BUDGET_NOT_FOUND));
        
        return mapToResponse(budget, userId);
    }
    
    public BudgetResponse updateBudget(Long userId, Long budgetId, UpdateBudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.BUDGET_NOT_FOUND));
        
        if (request.getBudgetName() != null) {
            budget.setBudgetName(request.getBudgetName());
        }
        
        if (request.getAmount() != null) {
            budget.setAmount(request.getAmount());
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));
            budget.setCategory(category);
        }
        
        if (request.getPeriodType() != null) {
            budget.setPeriodType(request.getPeriodType());
        }
        
        if (request.getStartDate() != null) {
            budget.setStartDate(request.getStartDate());
        }
        
        if (request.getEndDate() != null) {
            // Validate dates
            LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : budget.getStartDate();
            if (request.getEndDate().isBefore(startDate)) {
                throw new ApiException(ErrorCode.INVALID_DATE_RANGE);
            }
            budget.setEndDate(request.getEndDate());
        }
        
        if (request.getAlertThreshold() != null) {
            budget.setAlertThreshold(request.getAlertThreshold());
        }
        
        if (request.getAlertEnabled() != null) {
            budget.setAlertEnabled(request.getAlertEnabled());
        }
        
        if (request.getIsActive() != null) {
            budget.setIsActive(request.getIsActive());
        }
        
        Budget updatedBudget = budgetRepository.save(budget);
        return mapToResponse(updatedBudget, userId);
    }
    
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.BUDGET_NOT_FOUND));
        
        budgetRepository.delete(budget);
    }
    
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgetsNearThreshold(Long userId) {
        LocalDate today = LocalDate.now();
        List<Budget> budgets = budgetRepository.findActiveBudgetsWithAlertsEnabled(userId, today);
        
        return budgets.stream()
                .map(b -> mapToResponse(b, userId))
                .filter(BudgetResponse::getIsNearThreshold)
                .collect(Collectors.toList());
    }
    
    private BudgetResponse mapToResponse(Budget budget, Long userId) {
        BigDecimal spent = calculateSpentAmount(budget, userId);
        return mapToResponseWithSpent(budget, spent);
    }

    /** Builds a BudgetResponse from a pre-computed spent amount (avoids the per-budget DB query). */
    private BudgetResponse mapToResponseWithSpent(Budget budget, BigDecimal spent) {
        BigDecimal remaining = budget.getAmount().subtract(spent);
        
        double percentUsed = 0.0;
        if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentUsed = spent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }
        
        boolean isOverBudget = spent.compareTo(budget.getAmount()) > 0;
        boolean isNearThreshold = percentUsed >= budget.getAlertThreshold();
        
        CategoryResponse categoryResponse = null;
        if (budget.getCategory() != null) {
            categoryResponse = mapCategoryToResponse(budget.getCategory());
        }
        
        return BudgetResponse.builder()
                .id(budget.getId())
                .budgetName(budget.getBudgetName())
                .amount(budget.getAmount())
                .spent(spent)
                .remaining(remaining)
                .percentUsed(percentUsed)
                .category(categoryResponse)
                .periodType(budget.getPeriodType())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .alertThreshold(budget.getAlertThreshold())
                .alertEnabled(budget.getAlertEnabled())
                .isActive(budget.getIsActive())
                .isOverBudget(isOverBudget)
                .isNearThreshold(isNearThreshold)
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
    
    public BigDecimal calculateSpentAmount(Budget budget, Long userId) {
        LocalDate startDate = calculatePeriodStartDate(budget);
        LocalDate endDate = calculatePeriodEndDate(budget);

        if (budget.getCategory() != null) {
            // FIX (BUG-1): Use a hierarchy-aware query so that budgets set on a parent
            // category (e.g. "Food & Dining") correctly aggregate spending from child
            // categories (e.g. "Groceries", "Dining Out") as well as the parent itself.
            // The old query used an exact category_id match and therefore returned $0.00
            // whenever transactions were recorded against subcategories.
            List<Transaction> transactions =
                    transactionRepository.findExpensesByUserIdAndCategoryOrSubcategoryAndDateRange(
                            userId, budget.getCategory().getId(), startDate, endDate,
                            Transaction.TransactionType.EXPENSE);
            return transactions.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            // Budget covers all expenses — no category filter
            List<Transaction> transactions = transactionRepository
                    .findByUserIdAndTransactionDateBetween(userId, startDate, endDate);
            return transactions.stream()
                    .filter(t -> t.getTransactionType() == Transaction.TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
    }
    
    private LocalDate calculatePeriodStartDate(Budget budget) {
        LocalDate today = LocalDate.now();
        LocalDate budgetStart = budget.getStartDate();
        
        // If budget start is in the future, use budget start
        if (budgetStart.isAfter(today)) {
            return budgetStart;
        }
        
        switch (budget.getPeriodType()) {
            case WEEKLY:
                // Start of current week within budget period
                LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
                return weekStart.isAfter(budgetStart) ? weekStart : budgetStart;
            
            case MONTHLY:
                // Start of current month within budget period
                LocalDate monthStart = today.withDayOfMonth(1);
                return monthStart.isAfter(budgetStart) ? monthStart : budgetStart;
            
            case QUARTERLY:
                // Start of current quarter within budget period
                int currentQuarter = (today.getMonthValue() - 1) / 3;
                LocalDate quarterStart = today.withMonth(currentQuarter * 3 + 1).withDayOfMonth(1);
                return quarterStart.isAfter(budgetStart) ? quarterStart : budgetStart;
            
            case YEARLY:
                // Start of current year within budget period
                LocalDate yearStart = today.withDayOfYear(1);
                return yearStart.isAfter(budgetStart) ? yearStart : budgetStart;
            
            default:
                return budgetStart;
        }
    }
    
    private LocalDate calculatePeriodEndDate(Budget budget) {
        LocalDate today = LocalDate.now();
        LocalDate budgetEnd = budget.getEndDate();
        
        LocalDate periodEnd;
        switch (budget.getPeriodType()) {
            case WEEKLY:
                periodEnd = today.plusDays(7 - today.getDayOfWeek().getValue());
                break;
            
            case MONTHLY:
                periodEnd = today.withDayOfMonth(today.lengthOfMonth());
                break;
            
            case QUARTERLY:
                int currentQuarter = (today.getMonthValue() - 1) / 3;
                periodEnd = today.withMonth((currentQuarter + 1) * 3).withDayOfMonth(
                        today.withMonth((currentQuarter + 1) * 3).lengthOfMonth());
                break;
            
            case YEARLY:
                periodEnd = today.withDayOfYear(today.lengthOfYear());
                break;
            
            default:
                periodEnd = budgetEnd != null ? budgetEnd : today;
        }
        
        // Return the earlier of period end or budget end
        if (budgetEnd != null && budgetEnd.isBefore(periodEnd)) {
            return budgetEnd;
        }
        return periodEnd;
    }
    
    private CategoryResponse mapCategoryToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setCategoryName(category.getCategoryName());
        response.setCategoryType(category.getCategoryType());
        response.setColorCode(category.getColorCode());
        response.setIcon(category.getIcon());
        response.setIsSystem(category.getIsSystem());
        response.setIsActive(category.getIsActive());
        return response;
    }
}
