package com.financetracker.dto.budget;

import com.financetracker.dto.category.CategoryResponse;
import com.financetracker.entity.Budget.PeriodType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BudgetResponse {
    
    private Long id;
    private String budgetName;
    private BigDecimal amount;
    private BigDecimal spent;
    private BigDecimal remaining;
    private Double percentUsed;
    private CategoryResponse category;
    private PeriodType periodType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer alertThreshold;
    private Boolean alertEnabled;
    private Boolean isActive;
    private Boolean isOverBudget;
    private Boolean isNearThreshold;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public BudgetResponse() {
    }
    
    // Builder pattern for complex construction
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private final BudgetResponse response = new BudgetResponse();
        
        public Builder id(Long id) {
            response.id = id;
            return this;
        }
        
        public Builder budgetName(String budgetName) {
            response.budgetName = budgetName;
            return this;
        }
        
        public Builder amount(BigDecimal amount) {
            response.amount = amount;
            return this;
        }
        
        public Builder spent(BigDecimal spent) {
            response.spent = spent;
            return this;
        }
        
        public Builder remaining(BigDecimal remaining) {
            response.remaining = remaining;
            return this;
        }
        
        public Builder percentUsed(Double percentUsed) {
            response.percentUsed = percentUsed;
            return this;
        }
        
        public Builder category(CategoryResponse category) {
            response.category = category;
            return this;
        }
        
        public Builder periodType(PeriodType periodType) {
            response.periodType = periodType;
            return this;
        }
        
        public Builder startDate(LocalDate startDate) {
            response.startDate = startDate;
            return this;
        }
        
        public Builder endDate(LocalDate endDate) {
            response.endDate = endDate;
            return this;
        }
        
        public Builder alertThreshold(Integer alertThreshold) {
            response.alertThreshold = alertThreshold;
            return this;
        }
        
        public Builder alertEnabled(Boolean alertEnabled) {
            response.alertEnabled = alertEnabled;
            return this;
        }
        
        public Builder isActive(Boolean isActive) {
            response.isActive = isActive;
            return this;
        }
        
        public Builder isOverBudget(Boolean isOverBudget) {
            response.isOverBudget = isOverBudget;
            return this;
        }
        
        public Builder isNearThreshold(Boolean isNearThreshold) {
            response.isNearThreshold = isNearThreshold;
            return this;
        }
        
        public Builder createdAt(LocalDateTime createdAt) {
            response.createdAt = createdAt;
            return this;
        }
        
        public Builder updatedAt(LocalDateTime updatedAt) {
            response.updatedAt = updatedAt;
            return this;
        }
        
        public BudgetResponse build() {
            return response;
        }
    }
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public BigDecimal getSpent() {
        return spent;
    }
    
    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }
    
    public BigDecimal getRemaining() {
        return remaining;
    }
    
    public void setRemaining(BigDecimal remaining) {
        this.remaining = remaining;
    }
    
    public Double getPercentUsed() {
        return percentUsed;
    }
    
    public void setPercentUsed(Double percentUsed) {
        this.percentUsed = percentUsed;
    }
    
    public CategoryResponse getCategory() {
        return category;
    }
    
    public void setCategory(CategoryResponse category) {
        this.category = category;
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
    
    public Boolean getIsOverBudget() {
        return isOverBudget;
    }
    
    public void setIsOverBudget(Boolean isOverBudget) {
        this.isOverBudget = isOverBudget;
    }
    
    public Boolean getIsNearThreshold() {
        return isNearThreshold;
    }
    
    public void setIsNearThreshold(Boolean isNearThreshold) {
        this.isNearThreshold = isNearThreshold;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
