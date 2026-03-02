package com.financetracker.dto.currency;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Request body for changing a user's default currency.
 * The client must choose between CONVERT (scale all monetary values by an
 * exchange-rate factor) or RESET (delete all financial data).
 */
public class CurrencyChangeRequest {

    public enum CurrencyChangeAction {
        /** Scale all monetary amounts by the supplied exchange rate. */
        CONVERT,
        /** Delete all financial data for the user and start fresh. */
        RESET
    }

    /** The 3-letter ISO 4217 currency code to switch to (e.g. "NPR"). */
    @NotBlank(message = "New currency code is required")
    @Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
    private String newCurrency;

    /** Whether to convert existing data or wipe it. */
    @NotNull(message = "Action is required (CONVERT or RESET)")
    private CurrencyChangeAction action;

    /**
     * Exchange rate: 1 unit of the OLD currency = X units of the NEW currency.
     * Required when action == CONVERT.
     */
    private BigDecimal exchangeRate;

    public CurrencyChangeRequest() {
    }

    public String getNewCurrency() {
        return newCurrency;
    }

    public void setNewCurrency(String newCurrency) {
        this.newCurrency = newCurrency;
    }

    public CurrencyChangeAction getAction() {
        return action;
    }

    public void setAction(CurrencyChangeAction action) {
        this.action = action;
    }

    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(BigDecimal exchangeRate) {
        this.exchangeRate = exchangeRate;
    }
}
