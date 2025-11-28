package com.financetracker.dto.importexport;

import com.financetracker.entity.Transaction;
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
public class TransactionImportRecord {
    
    private LocalDate date;
    private String description;
    private BigDecimal amount;
    private Transaction.TransactionType type;
    private String accountName;
    private String categoryName;
    private String notes;
    private String referenceNumber;
    
    // For duplicate detection
    private String uniqueKey;
    
    public String generateUniqueKey() {
        return String.format("%s_%s_%s_%s",
                date != null ? date.toString() : "",
                description != null ? description : "",
                amount != null ? amount.toString() : "",
                accountName != null ? accountName : ""
        );
    }
}
