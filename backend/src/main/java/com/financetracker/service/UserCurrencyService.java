package com.financetracker.service;

import com.financetracker.dto.currency.CurrencyChangeRequest;
import com.financetracker.dto.currency.CurrencyChangeResponse;
import com.financetracker.entity.*;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Handles user-initiated currency change operations.
 *
 * <p>Two modes are supported:
 * <ul>
 *   <li><b>CONVERT</b> – multiply every stored monetary value by the supplied
 *       exchange-rate factor and re-label all currency codes.</li>
 *   <li><b>RESET</b> – delete all financial data for the user so they can
 *       start fresh in the new currency.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserCurrencyService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final BudgetRepository budgetRepository;

    /**
     * Change the user's default currency, either by converting existing data or
     * resetting (deleting) it, depending on the action specified in the request.
     */
    @Transactional
    public CurrencyChangeResponse changeCurrency(Long userId, CurrencyChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        String oldCurrency = user.getDefaultCurrency();
        String newCurrency = request.getNewCurrency().toUpperCase().trim();

        if (oldCurrency.equalsIgnoreCase(newCurrency)) {
            return new CurrencyChangeResponse(
                    oldCurrency, newCurrency, request.getAction().name(),
                    0, 0, 0, 0, "Currency is already set to " + newCurrency + ". No changes made.");
        }

        CurrencyChangeResponse response;
        if (request.getAction() == CurrencyChangeRequest.CurrencyChangeAction.CONVERT) {
            response = convertUserData(userId, oldCurrency, newCurrency, request.getExchangeRate());
        } else {
            response = resetUserData(userId, oldCurrency, newCurrency);
        }

        // Update the user's default currency
        user.setDefaultCurrency(newCurrency);
        userRepository.save(user);

        return response;
    }

    // -------------------------------------------------------------------------
    // CONVERT path
    // -------------------------------------------------------------------------

    private CurrencyChangeResponse convertUserData(Long userId, String oldCurrency,
                                                    String newCurrency, BigDecimal rate) {
        if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(ErrorCode.INVALID_OPERATION,
                    "A valid exchange rate (> 0) is required for the CONVERT action.");
        }

        log.info("Converting financial data for userId={} from {} to {} at rate {}",
                userId, oldCurrency, newCurrency, rate);

        int accountsUpdated = convertAccounts(userId, newCurrency, rate);
        int transactionsUpdated = convertTransactions(userId, newCurrency, rate);
        int recurringUpdated = convertRecurring(userId, newCurrency, rate);
        int budgetsUpdated = convertBudgets(userId, rate);

        log.info("Conversion complete for userId={}: accounts={}, transactions={}, recurring={}, budgets={}",
                userId, accountsUpdated, transactionsUpdated, recurringUpdated, budgetsUpdated);

        return new CurrencyChangeResponse(
                oldCurrency, newCurrency, "CONVERT",
                accountsUpdated, transactionsUpdated, recurringUpdated, budgetsUpdated,
                String.format("Data converted from %s to %s (rate: 1 %s = %s %s).",
                        oldCurrency, newCurrency, oldCurrency, rate.toPlainString(), newCurrency));
    }

    private int convertAccounts(Long userId, String newCurrency, BigDecimal rate) {
        List<Account> accounts = accountRepository.findByUserIdOrderByAccountNameAsc(userId);
        for (Account a : accounts) {
            a.setCurrentBalance(scale(a.getCurrentBalance(), rate));
            a.setInitialBalance(scale(a.getInitialBalance(), rate));
            a.setCurrency(newCurrency);
        }
        accountRepository.saveAll(accounts);
        return accounts.size();
    }

    private int convertTransactions(Long userId, String newCurrency, BigDecimal rate) {
        List<Transaction> txns = transactionRepository.findByUserId(userId,
                org.springframework.data.domain.Pageable.unpaged()).getContent();
        for (Transaction t : txns) {
            t.setAmount(scale(t.getAmount(), rate));
            t.setCurrency(newCurrency);
        }
        transactionRepository.saveAll(txns);
        return txns.size();
    }

    private int convertRecurring(Long userId, String newCurrency, BigDecimal rate) {
        List<RecurringTransaction> rec = recurringTransactionRepository.findByUserId(userId);
        for (RecurringTransaction r : rec) {
            r.setAmount(scale(r.getAmount(), rate));
            r.setCurrency(newCurrency);
        }
        recurringTransactionRepository.saveAll(rec);
        return rec.size();
    }

    private int convertBudgets(Long userId, BigDecimal rate) {
        List<Budget> budgets = budgetRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Budget b : budgets) {
            b.setAmount(scale(b.getAmount(), rate));
        }
        budgetRepository.saveAll(budgets);
        return budgets.size();
    }

    /** Multiply and round to 2 decimal places, never returning null. */
    private BigDecimal scale(BigDecimal value, BigDecimal rate) {
        if (value == null) return BigDecimal.ZERO;
        return value.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    // -------------------------------------------------------------------------
    // RESET path
    // -------------------------------------------------------------------------

    private CurrencyChangeResponse resetUserData(Long userId, String oldCurrency, String newCurrency) {
        log.info("Resetting all financial data for userId={} (switching {} → {})",
                userId, oldCurrency, newCurrency);

        // Count before deletion for the response
        int accountsCount = (int) accountRepository.countActiveAccountsByUserId(userId);
        int transactionsCount = (int) transactionRepository.findByUserId(userId,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        int recurringCount = recurringTransactionRepository.findByUserId(userId).size();
        int budgetsCount = budgetRepository.findByUserIdOrderByCreatedAtDesc(userId).size();

        // Delete in FK-safe order
        transactionRepository.deleteAllByUserId(userId);
        recurringTransactionRepository.deleteAllByUserId(userId);
        budgetRepository.deleteAllByUserId(userId);
        accountRepository.deleteAllByUserId(userId);

        log.info("Reset complete for userId={}: deleted accounts={}, transactions={}, recurring={}, budgets={}",
                userId, accountsCount, transactionsCount, recurringCount, budgetsCount);

        return new CurrencyChangeResponse(
                oldCurrency, newCurrency, "RESET",
                accountsCount, transactionsCount, recurringCount, budgetsCount,
                "All financial data has been cleared. You can now create new accounts in " + newCurrency + ".");
    }
}
