package com.financetracker.dto.recurring;

import com.financetracker.entity.RecurringTransaction.Frequency;
import com.financetracker.entity.Transaction.TransactionType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRecurringTransactionRequest {
    
    @NotNull(message = "Account ID is required")
    private Long accountId;
    
    private Long categoryId;
    
    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    
    private String currency;
    
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
    
    @NotNull(message = "Frequency is required")
    private Frequency frequency;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @Min(value = 1, message = "Day of month must be between 1 and 31")
    @Max(value = 31, message = "Day of month must be between 1 and 31")
    private Integer dayOfMonth;
    
    @Min(value = 1, message = "Day of week must be between 1 and 7")
    @Max(value = 7, message = "Day of week must be between 1 and 7")
    private Integer dayOfWeek;
    
    private Long transferToAccountId;
    
    private Boolean autoPost;
}
