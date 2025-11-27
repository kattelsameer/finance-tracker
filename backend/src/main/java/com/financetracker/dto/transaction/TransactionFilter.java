package com.financetracker.dto.transaction;

import com.financetracker.entity.Transaction.TransactionType;
import java.time.LocalDate;
import java.util.Set;

/**
 * Filter criteria for querying transactions.
 */
public class TransactionFilter {
    
    private Long accountId;
    private Long categoryId;
    private TransactionType transactionType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String searchTerm;
    private Set<Long> tagIds;
    private Boolean isRecurring;
    
    public TransactionFilter() {
    }
    
    public Long getAccountId() {
        return accountId;
    }
    
    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
    
    public Long getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
    
    public TransactionType getTransactionType() {
        return transactionType;
    }
    
    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
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
    
    public String getSearchTerm() {
        return searchTerm;
    }
    
    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }
    
    public Set<Long> getTagIds() {
        return tagIds;
    }
    
    public void setTagIds(Set<Long> tagIds) {
        this.tagIds = tagIds;
    }
    
    public Boolean getIsRecurring() {
        return isRecurring;
    }
    
    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }
}
