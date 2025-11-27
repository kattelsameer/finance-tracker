package com.financetracker.dto.transaction;

import com.financetracker.dto.tag.TagResponse;
import com.financetracker.entity.Transaction.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class TransactionResponse {
    
    private Long id;
    private Long accountId;
    private String accountName;
    private Long categoryId;
    private String categoryName;
    private TransactionType transactionType;
    private BigDecimal amount;
    private String currency;
    private LocalDate transactionDate;
    private String description;
    private String notes;
    private String referenceNumber;
    private Boolean isRecurring;
    private Long recurringTransactionId;
    private Long transferToAccountId;
    private String transferToAccountName;
    private Long transferTransactionId;
    private List<TagResponse> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public TransactionResponse() {
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public TransactionType getTransactionType() {
        return transactionType;
    }
    
    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
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
    
    public Boolean getIsRecurring() {
        return isRecurring;
    }
    
    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }
    
    public Long getRecurringTransactionId() {
        return recurringTransactionId;
    }
    
    public void setRecurringTransactionId(Long recurringTransactionId) {
        this.recurringTransactionId = recurringTransactionId;
    }
    
    public Long getTransferToAccountId() {
        return transferToAccountId;
    }
    
    public void setTransferToAccountId(Long transferToAccountId) {
        this.transferToAccountId = transferToAccountId;
    }
    
    public String getTransferToAccountName() {
        return transferToAccountName;
    }
    
    public void setTransferToAccountName(String transferToAccountName) {
        this.transferToAccountName = transferToAccountName;
    }
    
    public Long getTransferTransactionId() {
        return transferTransactionId;
    }
    
    public void setTransferTransactionId(Long transferTransactionId) {
        this.transferTransactionId = transferTransactionId;
    }
    
    public List<TagResponse> getTags() {
        return tags;
    }
    
    public void setTags(List<TagResponse> tags) {
        this.tags = tags;
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
