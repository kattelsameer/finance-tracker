package com.financetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSavedSearchRequest {
    
    @NotBlank(message = "Search name is required")
    @Size(max = 100, message = "Search name must not exceed 100 characters")
    private String searchName;
    
    private String searchCriteria; // JSON string
    
    @Builder.Default
    private Boolean isDefault = false;
}
