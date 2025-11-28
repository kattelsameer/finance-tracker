package com.financetracker.dto.recurring;

import com.financetracker.dto.account.AccountResponse;
import com.financetracker.dto.category.CategoryResponse;
import com.financetracker.entity.RecurringTransaction.Frequency;
import com.financetracker.entity.Transaction.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringTransactionResponse {
    
    private Long id;
    private Long accountId;
    private String accountName;
    private Long categoryId;
    private String categoryName;
    private TransactionType transactionType;
    private BigDecimal amount;
    private String currency;
    private String description;
    private Frequency frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextOccurrence;
    private Integer dayOfMonth;
    private Integer dayOfWeek;
    private Long transferToAccountId;
    private String transferToAccountName;
    private Boolean isActive;
    private Boolean autoPost;
    private Instant createdAt;
    private Instant updatedAt;
}
