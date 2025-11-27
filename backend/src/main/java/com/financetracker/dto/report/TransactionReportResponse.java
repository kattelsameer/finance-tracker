package com.financetracker.dto.report;

import com.financetracker.entity.Transaction;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class TransactionReportResponse {
    
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netAmount;
    private Integer transactionCount;
    
    private List<CategoryBreakdown> categoryBreakdown;
    private List<AccountBreakdown> accountBreakdown;
    private List<DailyBreakdown> dailyBreakdown;
    
    public TransactionReportResponse() {
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
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
    
    public BigDecimal getNetAmount() {
        return netAmount;
    }
    
    public void setNetAmount(BigDecimal netAmount) {
        this.netAmount = netAmount;
    }
    
    public Integer getTransactionCount() {
        return transactionCount;
    }
    
    public void setTransactionCount(Integer transactionCount) {
        this.transactionCount = transactionCount;
    }
    
    public List<CategoryBreakdown> getCategoryBreakdown() {
        return categoryBreakdown;
    }
    
    public void setCategoryBreakdown(List<CategoryBreakdown> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }
    
    public List<AccountBreakdown> getAccountBreakdown() {
        return accountBreakdown;
    }
    
    public void setAccountBreakdown(List<AccountBreakdown> accountBreakdown) {
        this.accountBreakdown = accountBreakdown;
    }
    
    public List<DailyBreakdown> getDailyBreakdown() {
        return dailyBreakdown;
    }
    
    public void setDailyBreakdown(List<DailyBreakdown> dailyBreakdown) {
        this.dailyBreakdown = dailyBreakdown;
    }
    
    public static class CategoryBreakdown {
        private Long categoryId;
        private String categoryName;
        private Transaction.TransactionType transactionType;
        private BigDecimal amount;
        private Integer count;
        private Double percentage;
        
        public CategoryBreakdown() {
        }
        
        public CategoryBreakdown(Long categoryId, String categoryName, 
                                 Transaction.TransactionType transactionType, 
                                 BigDecimal amount, Integer count) {
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.transactionType = transactionType;
            this.amount = amount;
            this.count = count;
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
        
        public Transaction.TransactionType getTransactionType() {
            return transactionType;
        }
        
        public void setTransactionType(Transaction.TransactionType transactionType) {
            this.transactionType = transactionType;
        }
        
        public BigDecimal getAmount() {
            return amount;
        }
        
        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
        
        public Integer getCount() {
            return count;
        }
        
        public void setCount(Integer count) {
            this.count = count;
        }
        
        public Double getPercentage() {
            return percentage;
        }
        
        public void setPercentage(Double percentage) {
            this.percentage = percentage;
        }
    }
    
    public static class AccountBreakdown {
        private Long accountId;
        private String accountName;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal netAmount;
        private Integer transactionCount;
        
        public AccountBreakdown() {
        }
        
        public Long getAccountId() {
            return accountId;
        }
        
        public void setAccountId(Long accountId) {
            this.accountId = accountId;
        }
        
        public String getAccountName() {
            return accountName;
        }
        
        public void setAccountName(String accountName) {
            this.accountName = accountName;
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
        
        public BigDecimal getNetAmount() {
            return netAmount;
        }
        
        public void setNetAmount(BigDecimal netAmount) {
            this.netAmount = netAmount;
        }
        
        public Integer getTransactionCount() {
            return transactionCount;
        }
        
        public void setTransactionCount(Integer transactionCount) {
            this.transactionCount = transactionCount;
        }
    }
    
    public static class DailyBreakdown {
        private LocalDate date;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal netAmount;
        
        public DailyBreakdown() {
        }
        
        public DailyBreakdown(LocalDate date, BigDecimal income, BigDecimal expenses) {
            this.date = date;
            this.income = income;
            this.expenses = expenses;
            this.netAmount = income.subtract(expenses);
        }
        
        public LocalDate getDate() {
            return date;
        }
        
        public void setDate(LocalDate date) {
            this.date = date;
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
        
        public BigDecimal getNetAmount() {
            return netAmount;
        }
        
        public void setNetAmount(BigDecimal netAmount) {
            this.netAmount = netAmount;
        }
    }
}
