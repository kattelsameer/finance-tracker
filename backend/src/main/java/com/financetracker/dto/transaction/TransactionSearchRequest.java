package com.financetracker.dto.transaction;

import com.financetracker.entity.Transaction.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionSearchRequest {
    
    private String searchTerm; // Search in description and notes
    private LocalDate startDate;
    private LocalDate endDate;
    private Long accountId;
    private Long categoryId;
    private TransactionType transactionType;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private List<Long> tagIds;
    private Boolean isRecurring;
    private String currency;
    
    // Pagination
    private Integer page;
    private Integer size;
    private String sortBy; // e.g., "transactionDate", "amount", "description"
    private String sortDirection; // "ASC" or "DESC"
}
