package com.financetracker.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsResponse {
    
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netSavings;
    private BigDecimal totalBalance;
    private Integer transactionCount;
    private Integer activeAccountsCount;
    private Integer activeBudgetsCount;
    
    private List<CategorySpending> topSpendingCategories;
    private List<MonthlyTrend> monthlyTrends;
    private List<BudgetStatus> budgetStatuses;
    
    public DashboardStatsResponse() {
    }
    
    // Getters and setters
    public BigDecimal getTotalIncome() {
        return totalIncome;
    }
    
    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }
    
    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }
    
    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }
    
    public BigDecimal getNetSavings() {
        return netSavings;
    }
    
    public void setNetSavings(BigDecimal netSavings) {
        this.netSavings = netSavings;
    }
    
    public BigDecimal getTotalBalance() {
        return totalBalance;
    }
    
    public void setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
    }
    
    public Integer getTransactionCount() {
        return transactionCount;
    }
    
    public void setTransactionCount(Integer transactionCount) {
        this.transactionCount = transactionCount;
    }
    
    public Integer getActiveAccountsCount() {
        return activeAccountsCount;
    }
    
    public void setActiveAccountsCount(Integer activeAccountsCount) {
        this.activeAccountsCount = activeAccountsCount;
    }
    
    public Integer getActiveBudgetsCount() {
        return activeBudgetsCount;
    }
    
    public void setActiveBudgetsCount(Integer activeBudgetsCount) {
        this.activeBudgetsCount = activeBudgetsCount;
    }
    
    public List<CategorySpending> getTopSpendingCategories() {
        return topSpendingCategories;
    }
    
    public void setTopSpendingCategories(List<CategorySpending> topSpendingCategories) {
        this.topSpendingCategories = topSpendingCategories;
    }
    
    public List<MonthlyTrend> getMonthlyTrends() {
        return monthlyTrends;
    }
    
    public void setMonthlyTrends(List<MonthlyTrend> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }
    
    public List<BudgetStatus> getBudgetStatuses() {
        return budgetStatuses;
    }
    
    public void setBudgetStatuses(List<BudgetStatus> budgetStatuses) {
        this.budgetStatuses = budgetStatuses;
    }
    
    // Inner classes
    public static class CategorySpending {
        private Long categoryId;
        private String categoryName;
        private BigDecimal amount;
        private Double percentage;
        
        public CategorySpending() {
        }
        
        public CategorySpending(Long categoryId, String categoryName, BigDecimal amount) {
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.amount = amount;
        }
        
        public Long getCategoryId() {
            return categoryId;
        }
        
        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }
        
        public String getCategoryName() {
            return categoryName;
        }
        
        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }
        
        public BigDecimal getAmount() {
            return amount;
        }
        
        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
        
        public Double getPercentage() {
            return percentage;
        }
        
        public void setPercentage(Double percentage) {
            this.percentage = percentage;
        }
    }
    
    public static class MonthlyTrend {
        private String month;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal netSavings;
        
        public MonthlyTrend() {
        }
        
        public MonthlyTrend(String month, BigDecimal income, BigDecimal expenses) {
            this.month = month;
            this.income = income;
            this.expenses = expenses;
            this.netSavings = income.subtract(expenses);
        }
        
        public String getMonth() {
            return month;
        }
        
        public void setMonth(String month) {
            this.month = month;
        }
        
        public BigDecimal getIncome() {
            return income;
        }
        
        public void setIncome(BigDecimal income) {
            this.income = income;
        }
        
        public BigDecimal getExpenses() {
            return expenses;
        }
        
        public void setExpenses(BigDecimal expenses) {
            this.expenses = expenses;
        }
        
        public BigDecimal getNetSavings() {
            return netSavings;
        }
        
        public void setNetSavings(BigDecimal netSavings) {
            this.netSavings = netSavings;
        }
    }
    
    public static class BudgetStatus {
        private Long budgetId;
        private String budgetName;
        private BigDecimal budgetAmount;
        private BigDecimal spentAmount;
        private Double percentageUsed;
        private String status; // "ok", "warning", "exceeded"
        
        public BudgetStatus() {
        }
        
        public Long getBudgetId() {
            return budgetId;
        }
        
        public void setBudgetId(Long budgetId) {
            this.budgetId = budgetId;
        }
        
        public String getBudgetName() {
            return budgetName;
        }
        
        public void setBudgetName(String budgetName) {
            this.budgetName = budgetName;
        }
        
        public BigDecimal getBudgetAmount() {
            return budgetAmount;
        }
        
        public void setBudgetAmount(BigDecimal budgetAmount) {
            this.budgetAmount = budgetAmount;
        }
        
        public BigDecimal getSpentAmount() {
            return spentAmount;
        }
        
        public void setSpentAmount(BigDecimal spentAmount) {
            this.spentAmount = spentAmount;
        }
        
        public Double getPercentageUsed() {
            return percentageUsed;
        }
        
        public void setPercentageUsed(Double percentageUsed) {
            this.percentageUsed = percentageUsed;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
    }
}
