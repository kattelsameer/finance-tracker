package com.financetracker.controller;

import com.financetracker.dto.currency.*;
import com.financetracker.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/currencies")
@RequiredArgsConstructor
public class CurrencyController {
    private final CurrencyService currencyService;
    
    /**
     * Get all active currencies
     */
    @GetMapping
    public ResponseEntity<List<CurrencyDto>> getAllActiveCurrencies() {
        return ResponseEntity.ok(currencyService.getAllActiveCurrencies());
    }
    
    /**
     * Get all currencies (including inactive)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CurrencyDto>> getAllCurrencies() {
        return ResponseEntity.ok(currencyService.getAllCurrencies());
    }
    
    /**
     * Get currency by code
     */
    @GetMapping("/{code}")
    public ResponseEntity<CurrencyDto> getCurrencyByCode(@PathVariable String code) {
        return ResponseEntity.ok(currencyService.getCurrencyByCode(code));
    }
    
    /**
     * Get base currency
     */
    @GetMapping("/base")
    public ResponseEntity<CurrencyDto> getBaseCurrency() {
        return ResponseEntity.ok(currencyService.getBaseCurrency());
    }
    
    /**
     * Convert currency
     */
    @PostMapping("/convert")
    public ResponseEntity<CurrencyConversionResponse> convertCurrency(
            @RequestBody CurrencyConversionRequest request) {
        return ResponseEntity.ok(currencyService.convertCurrency(request));
    }
    
    /**
     * Update exchange rates from API
     */
    @PostMapping("/update-rates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateExchangeRates() {
        currencyService.updateExchangeRates();
        return ResponseEntity.ok().build();
    }

    /**
     * Alias for /update-rates — kept for backward compatibility with older frontend clients.
     * FIX (ISSUE-5.1): The frontend originally called /refresh-rates which did not exist.
     */
    @PostMapping("/refresh-rates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> refreshExchangeRates() {
        currencyService.updateExchangeRates();
        return ResponseEntity.ok().build();
    }
    
    /**
     * Manually update exchange rate for a currency
     */
    @PutMapping("/exchange-rate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CurrencyDto> updateExchangeRate(
            @RequestBody ExchangeRateUpdateRequest request) {
        return ResponseEntity.ok(currencyService.updateExchangeRate(request));
    }
    
    /**
     * Initialize default currencies
     */
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> initializeDefaultCurrencies() {
        currencyService.initializeDefaultCurrencies();
        return ResponseEntity.ok().build();
    }
}
