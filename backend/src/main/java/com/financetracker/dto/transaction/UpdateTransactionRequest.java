package com.financetracker.dto.transaction;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public class UpdateTransactionRequest {
    
    private Long accountId;
    
    private Long categoryId;
    
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @DecimalMax(value = "999999999999.99", message = "Amount is too large")
    private BigDecimal amount;
    
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code")
    private String currency;
    
    private LocalDate transactionDate;
    
    @Size(max = 255, message = "Description must be less than 255 characters")
    private String description;
    
    @Size(max = 1000, message = "Notes must be less than 1000 characters")
    private String notes;
    
    @Size(max = 50, message = "Reference number must be less than 50 characters")
    private String referenceNumber;
    
    private Set<Long> tagIds;
    
    public UpdateTransactionRequest() {
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
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public LocalDate getTransactionDate() {
        return transactionDate;
    }
    
    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getReferenceNumber() {
        return referenceNumber;
    }
    
    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }
    
    public Set<Long> getTagIds() {
        return tagIds;
    }
    
    public void setTagIds(Set<Long> tagIds) {
        this.tagIds = tagIds;
    }
}
