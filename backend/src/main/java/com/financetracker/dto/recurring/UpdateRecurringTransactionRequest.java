package com.financetracker.dto.recurring;

import com.financetracker.entity.RecurringTransaction.Frequency;
import com.financetracker.entity.Transaction.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
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
public class UpdateRecurringTransactionRequest {
    
    private Long accountId;
    
    private Long categoryId;
    
    private TransactionType transactionType;
    
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    
    private String currency;
    
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
    
    private Frequency frequency;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @Min(value = 1, message = "Day of month must be between 1 and 31")
    @Max(value = 31, message = "Day of month must be between 1 and 31")
    private Integer dayOfMonth;
    
    @Min(value = 1, message = "Day of week must be between 1 and 7")
    @Max(value = 7, message = "Day of week must be between 1 and 7")
    private Integer dayOfWeek;
    
    private Long transferToAccountId;
    
    private Boolean isActive;
    
    private Boolean autoPost;
}
