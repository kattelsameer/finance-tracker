package com.financetracker.service;

import com.financetracker.dto.currency.*;
import com.financetracker.entity.Currency;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.CurrencyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.event.EventListener;
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

    // Primary CDN (jsdelivr) — fetches USD-based rates
    private static final String FAWAZ_PRIMARY_URL =
            "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json";
    // Cloudflare fallback
    private static final String FAWAZ_FALLBACK_URL =
            "https://latest.currency-api.pages.dev/v1/currencies/usd.min.json";
    
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
     * Update exchange rates from fawazahmed0/exchange-api (free, no key, 200+ currencies).
     * Primary: jsdelivr CDN. Fallback: Cloudflare Pages.
     * Response format: { "date": "YYYY-MM-DD", "usd": { "eur": 0.92, "gbp": 0.79, ... } }
     * Rates are USD-based (1 USD = X currency), matching our DB storage convention.
     */
    @CacheEvict(value = "currencyConversions", allEntries = true)
    public void updateExchangeRates() {
        log.info("Updating exchange rates from fawazahmed0/exchange-api...");

        Map<String, Object> response = fetchExchangeRates();
        if (response == null) {
            log.warn("Could not fetch exchange rates from any source; rates remain unchanged");
            return;
        }

        // The "usd" key holds a map of lowercase currency codes → rate (1 USD = X)
        Object ratesObj = response.get("usd");
        if (!(ratesObj instanceof Map)) {
            log.warn("Unexpected API response format; rates remain unchanged");
            return;
        }

        Map<String, Object> rawRates = (Map<String, Object>) ratesObj;

        List<Currency> currencies = currencyRepository.findAll();
        int updated = 0;
        LocalDateTime now = LocalDateTime.now();

        for (Currency currency : currencies) {
            if (Boolean.TRUE.equals(currency.getIsBaseCurrency())) {
                currency.setExchangeRate(BigDecimal.ONE);
                currency.setLastUpdated(now);
                updated++;
                continue;
            }
            String key = currency.getCode().toLowerCase();
            Object rateRaw = rawRates.get(key);
            if (rateRaw != null) {
                double rate = ((Number) rateRaw).doubleValue();
                if (rate > 0) {
                    currency.setExchangeRate(BigDecimal.valueOf(rate));
                    currency.setLastUpdated(now);
                    updated++;
                }
            }
        }

        currencyRepository.saveAll(currencies);
        log.info("Successfully updated exchange rates for {}/{} currencies", updated, currencies.size());
    }

    /** Try primary CDN, then Cloudflare fallback. Returns null on total failure. */
    private Map<String, Object> fetchExchangeRates() {
        for (String url : List.of(FAWAZ_PRIMARY_URL, FAWAZ_FALLBACK_URL)) {
            try {
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                if (response != null && response.containsKey("usd")) {
                    log.info("Fetched exchange rates from: {}", url);
                    return response;
                }
            } catch (Exception e) {
                log.warn("Failed to fetch rates from {}: {}", url, e.getMessage());
            }
        }
        return null;
    }

    /**
     * Refresh rates once the application is fully started.
     * Wrapped in try-catch so a CDN outage never prevents startup.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void refreshRatesOnStartup() {
        log.info("Application ready — refreshing exchange rates on startup...");
        try {
            updateExchangeRates();
        } catch (Exception e) {
            log.warn("Startup exchange rate refresh failed (non-fatal): {}", e.getMessage());
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
