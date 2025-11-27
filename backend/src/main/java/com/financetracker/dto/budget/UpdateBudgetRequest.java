package com.financetracker.dto.budget;

import com.financetracker.entity.Budget.PeriodType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class UpdateBudgetRequest {
    
    @Size(max = 100, message = "Budget name must not exceed 100 characters")
    private String budgetName;
    
    @Positive(message = "Amount must be positive")
    @Digits(integer = 13, fraction = 2, message = "Amount must have at most 13 integer digits and 2 decimal places")
    private BigDecimal amount;
    
    private Long categoryId;
    
    private PeriodType periodType;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @Min(value = 1, message = "Alert threshold must be between 1 and 100")
    @Max(value = 100, message = "Alert threshold must be between 1 and 100")
    private Integer alertThreshold;
    
    private Boolean alertEnabled;
    
    private Boolean isActive;
    
    public UpdateBudgetRequest() {
    }
    
    // Getters and Setters
    
    public String getBudgetName() {
        return budgetName;
    }
    
    public void setBudgetName(String budgetName) {
        this.budgetName = budgetName;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public Long getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
    
    public PeriodType getPeriodType() {
        return periodType;
    }
    
    public void setPeriodType(PeriodType periodType) {
        this.periodType = periodType;
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
    
    public Integer getAlertThreshold() {
        return alertThreshold;
    }
    
    public void setAlertThreshold(Integer alertThreshold) {
        this.alertThreshold = alertThreshold;
    }
    
    public Boolean getAlertEnabled() {
        return alertEnabled;
    }
    
    public void setAlertEnabled(Boolean alertEnabled) {
        this.alertEnabled = alertEnabled;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
