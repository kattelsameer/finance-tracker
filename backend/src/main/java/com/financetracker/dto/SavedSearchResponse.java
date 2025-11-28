package com.financetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedSearchResponse {
    private Long id;
    private String searchName;
    private String searchCriteria;
    private Boolean isDefault;
    private Instant createdAt;
    private Instant updatedAt;
}
