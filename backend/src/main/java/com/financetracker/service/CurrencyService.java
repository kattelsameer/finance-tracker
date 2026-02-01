package com.financetracker.service;

import com.financetracker.dto.currency.*;
import com.financetracker.entity.Currency;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.CurrencyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@SuppressWarnings({"null", "unchecked"})
public class CurrencyService {
    private final CurrencyRepository currencyRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    
    // Free API for exchange rates (no key required for basic usage)
    private static final String EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest/";
    
    /**
     * Get all active currencies
     */
    @Transactional(readOnly = true)
    public List<CurrencyDto> getAllActiveCurrencies() {
        return currencyRepository.findByIsActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all currencies (including inactive)
     */
    @Transactional(readOnly = true)
    public List<CurrencyDto> getAllCurrencies() {
        return currencyRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get currency by code
     */
    @Transactional(readOnly = true)
    public CurrencyDto getCurrencyByCode(String code) {
        Currency currency = currencyRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ApiException(
                        ErrorCode.CURRENCY_NOT_FOUND,
                        "Currency not found: " + code
                ));
        return mapToDto(currency);
    }
    
    /**
     * Get base currency
     */
    @Transactional(readOnly = true)
    public CurrencyDto getBaseCurrency() {
        Currency currency = currencyRepository.findByIsBaseCurrencyTrue()
                .orElseThrow(() -> new ApiException(
                        ErrorCode.CURRENCY_NOT_FOUND,
                        "Base currency not configured"
                ));
        return mapToDto(currency);
    }
    
    /**
     * Convert amount between currencies
     */
    @Cacheable(value = "currencyConversions", key = "#request.fromCurrency + '_' + #request.toCurrency")
    public CurrencyConversionResponse convertCurrency(CurrencyConversionRequest request) {
        String fromCode = request.getFromCurrency().toUpperCase();
        String toCode = request.getToCurrency().toUpperCase();
        
        // If same currency, no conversion needed
        if (fromCode.equals(toCode)) {
            return new CurrencyConversionResponse(
                    request.getAmount(),
                    fromCode,
                    request.getAmount(),
                    toCode,
                    BigDecimal.ONE,
                    LocalDateTime.now()
            );
        }
        
        Currency fromCurrency = currencyRepository.findByCode(fromCode.toUpperCase())
                .orElseThrow(() -> new ApiException(
                        ErrorCode.CURRENCY_NOT_FOUND,
                        "Source currency not found: " + fromCode
                ));
        
        Currency toCurrency = currencyRepository.findByCode(toCode)
                .orElseThrow(() -> new ApiException(
                        ErrorCode.CURRENCY_NOT_FOUND,
                        "Currency not found: " + toCode
                ));
        
        // Calculate conversion rate
        // Both rates are relative to base currency (USD)
        // To convert from A to B: amount * (rateB / rateA)
        BigDecimal conversionRate = toCurrency.getExchangeRate()
                .divide(fromCurrency.getExchangeRate(), 10, RoundingMode.HALF_UP);
        
        BigDecimal convertedAmount = request.getAmount()
                .multiply(conversionRate)
                .setScale(2, RoundingMode.HALF_UP);
        
        return new CurrencyConversionResponse(
                request.getAmount(),
                fromCode,
                convertedAmount,
                toCode,
                conversionRate,
                LocalDateTime.now()
        );
    }
    
    /**
     * Update exchange rates from external API
     */
    @CacheEvict(value = "currencyConversions", allEntries = true)
    public void updateExchangeRates() {
        log.info("Updating exchange rates from API...");
        
        Currency baseCurrency = currencyRepository.findByIsBaseCurrencyTrue()
                .orElseThrow(() -> new ApiException(
                        ErrorCode.CURRENCY_NOT_FOUND,
                        "Base currency not configured"
                ));
        
        try {
            // Fetch rates from API
            String url = EXCHANGE_RATE_API_URL + baseCurrency.getCode();
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("rates")) {
                Map<String, Double> rates = (Map<String, Double>) response.get("rates");
                
                // Update all currencies in database
                List<Currency> currencies = currencyRepository.findAll();
                for (Currency currency : currencies) {
                    if (currency.getIsBaseCurrency()) {
                        currency.setExchangeRate(BigDecimal.ONE);
                    } else if (rates.containsKey(currency.getCode())) {
                        Double rate = rates.get(currency.getCode());
                        currency.setExchangeRate(BigDecimal.valueOf(rate));
                    }
                    currency.setLastUpdated(LocalDateTime.now());
                }
                
                currencyRepository.saveAll(currencies);
                log.info("Successfully updated exchange rates for {} currencies", currencies.size());
            }
        } catch (Exception e) {
            log.error("Failed to update exchange rates from API", e);
            throw new ApiException(
                    ErrorCode.EXTERNAL_API_ERROR,
                    "Failed to update exchange rates: " + e.getMessage(),
                    e
            );
        }
    }
    
    /**
     * Manually update exchange rate for a specific currency
     */
    @CacheEvict(value = "currencyConversions", allEntries = true)
    public CurrencyDto updateExchangeRate(ExchangeRateUpdateRequest request) {
        Currency currency = currencyRepository.findByCode(request.getCurrencyCode().toUpperCase())
                .orElseThrow(() -> new ApiException(
                        ErrorCode.CURRENCY_NOT_FOUND,
                        "Currency not found: " + request.getCurrencyCode()
                ));
        
        if (currency.getIsBaseCurrency()) {
            throw new ApiException(
                    ErrorCode.INVALID_OPERATION,
                    "Cannot update exchange rate for base currency"
            );
        }
        
        currency.setExchangeRate(request.getExchangeRate());
        currency.setLastUpdated(LocalDateTime.now());
        currency = currencyRepository.save(currency);
        
        log.info("Manually updated exchange rate for {} to {}", currency.getCode(), request.getExchangeRate());
        return mapToDto(currency);
    }
    
    /**
     * Initialize default currencies
     */
    public void initializeDefaultCurrencies() {
        if (currencyRepository.count() > 0) {
            log.info("Currencies already initialized, skipping...");
            return;
        }
        
        log.info("Initializing default currencies...");
        
        List<Currency> defaultCurrencies = Arrays.asList(
                createCurrency("USD", "US Dollar", "$", BigDecimal.ONE, true),
                createCurrency("EUR", "Euro", "€", new BigDecimal("0.92"), false),
                createCurrency("GBP", "British Pound", "£", new BigDecimal("0.79"), false),
                createCurrency("JPY", "Japanese Yen", "¥", new BigDecimal("149.50"), false),
                createCurrency("CHF", "Swiss Franc", "CHF", new BigDecimal("0.88"), false),
                createCurrency("CAD", "Canadian Dollar", "C$", new BigDecimal("1.36"), false),
                createCurrency("AUD", "Australian Dollar", "A$", new BigDecimal("1.53"), false),
                createCurrency("CNY", "Chinese Yuan", "¥", new BigDecimal("7.24"), false),
                createCurrency("INR", "Indian Rupee", "₹", new BigDecimal("83.12"), false),
                createCurrency("MXN", "Mexican Peso", "$", new BigDecimal("17.05"), false)
        );
        
        currencyRepository.saveAll(defaultCurrencies);
        log.info("Initialized {} default currencies", defaultCurrencies.size());
    }
    
    /**
     * Scheduled task to update exchange rates daily
     */
    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
    public void scheduledExchangeRateUpdate() {
        try {
            updateExchangeRates();
        } catch (Exception e) {
            log.error("Scheduled exchange rate update failed", e);
        }
    }
    
    private Currency createCurrency(String code, String name, String symbol, BigDecimal rate, boolean isBase) {
        Currency currency = new Currency();
        currency.setCode(code);
        currency.setName(name);
        currency.setSymbol(symbol);
        currency.setExchangeRate(rate);
        currency.setIsBaseCurrency(isBase);
        currency.setIsActive(true);
        currency.setLastUpdated(LocalDateTime.now());
        return currency;
    }
    
    private CurrencyDto mapToDto(Currency currency) {
        return new CurrencyDto(
                currency.getId(),
                currency.getCode(),
                currency.getName(),
                currency.getSymbol(),
                currency.getExchangeRate(),
                currency.getLastUpdated(),
                currency.getIsActive(),
                currency.getIsBaseCurrency()
        );
    }
}
