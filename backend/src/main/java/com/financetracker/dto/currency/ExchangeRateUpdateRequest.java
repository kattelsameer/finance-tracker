package com.financetracker.dto.currency;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateUpdateRequest {
    private String currencyCode;
    private BigDecimal exchangeRate;
}
