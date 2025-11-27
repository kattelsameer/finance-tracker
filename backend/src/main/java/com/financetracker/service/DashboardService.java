package com.financetracker.service;

import com.financetracker.dto.dashboard.DashboardStatsResponse;
import com.financetracker.dto.dashboard.DashboardStatsResponse.*;
import com.financetracker.entity.Budget;
import com.financetracker.entity.Transaction;
import com.financetracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BudgetRepository budgetRepository;
    private final BudgetService budgetService;
    
    public DashboardService(TransactionRepository transactionRepository,
                           AccountRepository accountRepository,
                           BudgetRepository budgetRepository,
                           BudgetService budgetService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.budgetRepository = budgetRepository;
        this.budgetService = budgetService;
    }
    
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long userId, LocalDate startDate, LocalDate endDate) {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        
        // Basic stats
        BigDecimal totalIncome = transactionRepository.sumByTypeAndDateRange(
                userId, Transaction.TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpenses = transactionRepository.sumByTypeAndDateRange(
                userId, Transaction.TransactionType.EXPENSE, startDate, endDate);
        
        stats.setTotalIncome(totalIncome);
        stats.setTotalExpenses(totalExpenses);
        stats.setNetSavings(totalIncome.subtract(totalExpenses));
        
        // Account stats
        BigDecimal totalBalance = accountRepository.sumCurrentBalanceByUserId(userId);
        stats.setTotalBalance(totalBalance != null ? totalBalance : BigDecimal.ZERO);
        stats.setActiveAccountsCount((int) accountRepository.countByUserIdAndIsActive(userId, true));
        
        // Transaction count
        long txCount = transactionRepository.countByUserIdAndDateRange(userId, startDate, endDate);
        stats.setTransactionCount((int) txCount);
        
        // Budget stats
        List<Budget> activeBudgets = budgetRepository.findActiveByUserId(userId);
        stats.setActiveBudgetsCount(activeBudgets.size());
        
        // Top spending categories
        stats.setTopSpendingCategories(getTopSpendingCategories(userId, startDate, endDate, 5));
        
        // Monthly trends (last 6 months)
        stats.setMonthlyTrends(getMonthlyTrends(userId, 6));
        
        // Budget statuses
        stats.setBudgetStatuses(getBudgetStatuses(userId, activeBudgets));
        
        return stats;
    }
    
    private List<CategorySpending> getTopSpendingCategories(Long userId, LocalDate startDate, 
                                                             LocalDate endDate, int limit) {
        List<Object[]> results = transactionRepository.sumByTypeGroupedByCategory(
                userId, Transaction.TransactionType.EXPENSE, startDate, endDate);
        
        BigDecimal total = results.stream()
                .map(r -> (BigDecimal) r[2])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return results.stream()
                .limit(limit)
                .map(r -> {
                    CategorySpending cs = new CategorySpending(
                            ((Number) r[0]).longValue(),
                            (String) r[1],
                            (BigDecimal) r[2]
                    );
                    if (total.compareTo(BigDecimal.ZERO) > 0) {
                        double percentage = cs.getAmount()
                                .divide(total, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .doubleValue();
                        cs.setPercentage(percentage);
                    }
                    return cs;
                })
                .collect(Collectors.toList());
    }
    
    private List<MonthlyTrend> getMonthlyTrends(Long userId, int monthsBack) {
        List<MonthlyTrend> trends = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        
        for (int i = monthsBack - 1; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            LocalDate startDate = targetMonth.atDay(1);
            LocalDate endDate = targetMonth.atEndOfMonth();
            
            BigDecimal income = transactionRepository.sumByTypeAndDateRange(
                    userId, Transaction.TransactionType.INCOME, startDate, endDate);
            BigDecimal expenses = transactionRepository.sumByTypeAndDateRange(
                    userId, Transaction.TransactionType.EXPENSE, startDate, endDate);
            
            trends.add(new MonthlyTrend(
                    targetMonth.format(formatter),
                    income,
                    expenses
            ));
        }
        
        return trends;
    }
    
    private List<BudgetStatus> getBudgetStatuses(Long userId, List<Budget> budgets) {
        return budgets.stream()
                .map(budget -> {
                    BigDecimal spent = budgetService.calculateSpentAmount(budget, userId);
                    double percentageUsed = budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                            ? spent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .doubleValue()
                            : 0.0;
                    
                    BudgetStatus status = new BudgetStatus();
                    status.setBudgetId(budget.getId());
                    status.setBudgetName(budget.getBudgetName());
                    status.setBudgetAmount(budget.getAmount());
                    status.setSpentAmount(spent);
                    status.setPercentageUsed(percentageUsed);
                    
                    // Determine status
                    if (percentageUsed >= 100) {
                        status.setStatus("exceeded");
                    } else if (percentageUsed >= budget.getAlertThreshold()) {
                        status.setStatus("warning");
                    } else {
                        status.setStatus("ok");
                    }
                    
                    return status;
                })
                .collect(Collectors.toList());
    }
}
