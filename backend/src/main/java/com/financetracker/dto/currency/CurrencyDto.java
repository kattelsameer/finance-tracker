package com.financetracker.dto.currency;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyDto {
    private Long id;
    private String code;
    private String name;
    private String symbol;
    private BigDecimal exchangeRate;
    private LocalDateTime lastUpdated;
    private Boolean isActive;
    private Boolean isBaseCurrency;
}
