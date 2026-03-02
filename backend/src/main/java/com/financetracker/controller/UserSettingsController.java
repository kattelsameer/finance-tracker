package com.financetracker.controller;

import com.financetracker.dto.currency.CurrencyChangeRequest;
import com.financetracker.dto.currency.CurrencyChangeResponse;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.UserCurrencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Handles user-level settings operations that don't belong to the auth controller,
 * such as changing the default currency with data conversion or reset.
 */
@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class UserSettingsController {

    private final UserCurrencyService userCurrencyService;

    /**
     * Change the authenticated user's default currency.
     *
     * <p>Two actions are supported:
     * <ul>
     *   <li><b>CONVERT</b> – convert all monetary values using the provided exchange rate.</li>
     *   <li><b>RESET</b> – delete all financial data and start fresh in the new currency.</li>
     * </ul>
     *
     * @param request body with newCurrency, action (CONVERT|RESET), and optional exchangeRate
     * @return a summary of what was changed/deleted
     */
    @PostMapping("/currency-change")
    public ResponseEntity<CurrencyChangeResponse> changeCurrency(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CurrencyChangeRequest request) {
        CurrencyChangeResponse response = userCurrencyService.changeCurrency(
                userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
