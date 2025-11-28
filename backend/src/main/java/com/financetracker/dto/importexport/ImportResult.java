package com.financetracker.dto.importexport;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportResult {
    
    private int totalRecords;
    private int successfulImports;
    private int duplicatesSkipped;
    private int errors;
    private String message;
    
    public static ImportResult success(int total, int successful, int duplicates) {
        return ImportResult.builder()
                .totalRecords(total)
                .successfulImports(successful)
                .duplicatesSkipped(duplicates)
                .errors(0)
                .message("Import completed successfully")
                .build();
    }
    
    public static ImportResult withErrors(int total, int successful, int duplicates, int errors) {
        return ImportResult.builder()
                .totalRecords(total)
                .successfulImports(successful)
                .duplicatesSkipped(duplicates)
                .errors(errors)
                .message(String.format("Import completed with %d errors", errors))
                .build();
    }
}
