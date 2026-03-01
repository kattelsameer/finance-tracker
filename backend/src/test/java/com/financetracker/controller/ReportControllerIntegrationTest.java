package com.financetracker.controller;

import com.financetracker.dto.account.CreateAccountRequest;
import com.financetracker.dto.transaction.CreateTransactionRequest;
import com.financetracker.entity.AccountType;
import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction.TransactionType;
import com.financetracker.repository.AccountTypeRepository;
import com.financetracker.repository.CategoryRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for ReportController.
 *
 * Key coverage:
 *  - BUG-4: generateCategoryBreakdown() with hyphenated category names must NOT cause
 *    a 500 error (was caused by string split("-") on composite key).
 *  - Empty date range → returns HTTP 200 with zero totals (not an error).
 *  - Normal date range with transactions → correct amounts in the report.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Report Controller Integration Tests")
@SuppressWarnings("null")
class ReportControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private AccountTypeRepository accountTypeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Cookie authCookie;
    private Long accountId;
    private Long expenseCategoryId;
    private Long hyphenatedCategoryId;

    @BeforeEach
    void setUp() throws Exception {
        authCookie = registerAndLoginDefaultUser();

        // Find or create CHECKING account type (Flyway disabled in test profile)
        AccountType checkingType = accountTypeRepository.findByTypeCode("CHECKING")
                .orElseGet(() -> {
                    AccountType at = new AccountType();
                    at.setTypeCode("CHECKING");
                    at.setTypeName("Checking Account");
                    at.setIsLiability(false);
                    at.setDisplayOrder(1);
                    return accountTypeRepository.save(at);
                });

        // Create a plain expense category (no hyphen)
        Category expenseCategory = new Category();
        expenseCategory.setCategoryName("Groceries");
        expenseCategory.setCategoryType(Category.CategoryType.EXPENSE);
        expenseCategory.setColorCode("#ef4444");
        expenseCategory.setIcon("shopping-cart");
        expenseCategory.setIsSystem(true);
        expenseCategory.setIsActive(true);
        expenseCategory.setDisplayOrder(1);
        expenseCategory = categoryRepository.save(expenseCategory);
        expenseCategoryId = expenseCategory.getId();

        // BUG-4 regression test: category name containing a hyphen.
        // The old string-split approach would fail with an IllegalArgumentException
        // when this name appeared in the category breakdown key.
        Category hyphenatedCategory = new Category();
        hyphenatedCategory.setCategoryName("Self-Care");      // ← name with a hyphen
        hyphenatedCategory.setCategoryType(Category.CategoryType.EXPENSE);
        hyphenatedCategory.setColorCode("#8b5cf6");
        hyphenatedCategory.setIcon("heart");
        hyphenatedCategory.setIsSystem(false);
        hyphenatedCategory.setIsActive(true);
        hyphenatedCategory.setDisplayOrder(2);
        hyphenatedCategory = categoryRepository.save(hyphenatedCategory);
        hyphenatedCategoryId = hyphenatedCategory.getId();

        // Create account
        CreateAccountRequest accountRequest = new CreateAccountRequest();
        accountRequest.setAccountName("Test Checking");
        accountRequest.setAccountTypeId(checkingType.getId() != null ? checkingType.getId().intValue() : null);
        accountRequest.setInitialBalance(BigDecimal.ZERO);
        accountRequest.setCurrency("USD");

        MvcResult accountResult = mockMvc.perform(post("/api/v1/accounts")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        accountId = objectMapper.readTree(accountResult.getResponse().getContentAsString())
                .get("id").asLong();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Empty range tests
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/v1/reports/transactions - Empty date range returns 200 with zero totals")
    void testReportEmptyRange() throws Exception {
        // A range with no transactions should return a valid report (not an error)
        String startDate = LocalDate.now().minusYears(10).toString();
        String endDate   = LocalDate.now().minusYears(9).toString();

        mockMvc.perform(get("/api/v1/reports/transactions")
                        .cookie(authCookie)
                        .param("startDate", startDate)
                        .param("endDate",   endDate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome").value(0))
                .andExpect(jsonPath("$.totalExpenses").value(0))
                .andExpect(jsonPath("$.transactionCount").value(0))
                .andExpect(jsonPath("$.categoryBreakdown").isArray())
                .andExpect(jsonPath("$.dailyBreakdown").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/reports/transactions - Requires authentication")
    void testReportRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/v1/reports/transactions")
                        .param("startDate", LocalDate.now().minusMonths(1).toString())
                        .param("endDate",   LocalDate.now().toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/reports/transactions - Missing required params returns 400")
    void testReportMissingParams() throws Exception {
        mockMvc.perform(get("/api/v1/reports/transactions")
                        .cookie(authCookie))  // no startDate or endDate
                .andExpect(status().isBadRequest());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Real-data tests
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/v1/reports/transactions - Returns correct totals with plain category")
    void testReportWithPlainCategoryTransaction() throws Exception {
        // Create one expense transaction
        createTransaction(expenseCategoryId, "EXPENSE", new BigDecimal("50.00"),
                LocalDate.now(), "Supermarket run");

        String startDate = LocalDate.now().minusDays(1).toString();
        String endDate   = LocalDate.now().plusDays(1).toString();

        mockMvc.perform(get("/api/v1/reports/transactions")
                        .cookie(authCookie)
                        .param("startDate", startDate)
                        .param("endDate",   endDate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalExpenses").value(50.00))
                .andExpect(jsonPath("$.transactionCount").value(1))
                .andExpect(jsonPath("$.categoryBreakdown", hasSize(1)))
                .andExpect(jsonPath("$.categoryBreakdown[0].categoryName").value("Groceries"));
    }

    @Test
    @DisplayName("BUG-4 regression: category breakdown must not 500 with hyphenated category name")
    void testCategoryBreakdownWithHyphenatedCategoryName() throws Exception {
        // Using a category named "Self-Care" (contains a hyphen).
        // Old code: split("-") on "id-Self-Care-EXPENSE" produced wrong array → IllegalArgumentException → 500.
        // Fixed code: uses a typed CategoryKey, so hyphens in names are irrelevant.
        createTransaction(hyphenatedCategoryId, "EXPENSE", new BigDecimal("30.00"),
                LocalDate.now(), "Spa day");

        String startDate = LocalDate.now().minusDays(1).toString();
        String endDate   = LocalDate.now().plusDays(1).toString();

        mockMvc.perform(get("/api/v1/reports/transactions")
                        .cookie(authCookie)
                        .param("startDate", startDate)
                        .param("endDate",   endDate))
                // Must be 200, not 500
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryBreakdown", hasSize(1)))
                .andExpect(jsonPath("$.categoryBreakdown[0].categoryName").value("Self-Care"))
                .andExpect(jsonPath("$.categoryBreakdown[0].amount").value(30.00));
    }

    @Test
    @DisplayName("GET /api/v1/reports/transactions - Multiple categories with correct percentages")
    void testReportWithMultipleCategories() throws Exception {
        createTransaction(expenseCategoryId,    "EXPENSE", new BigDecimal("75.00"),
                LocalDate.now(), "Grocery shop");
        createTransaction(hyphenatedCategoryId, "EXPENSE", new BigDecimal("25.00"),
                LocalDate.now(), "Spa treatment");

        String startDate = LocalDate.now().minusDays(1).toString();
        String endDate   = LocalDate.now().plusDays(1).toString();

        mockMvc.perform(get("/api/v1/reports/transactions")
                        .cookie(authCookie)
                        .param("startDate", startDate)
                        .param("endDate",   endDate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalExpenses").value(100.00))
                .andExpect(jsonPath("$.categoryBreakdown", hasSize(2)))
                // Groceries should be first (largest amount)
                .andExpect(jsonPath("$.categoryBreakdown[0].categoryName").value("Groceries"))
                .andExpect(jsonPath("$.categoryBreakdown[0].percentage").value(75.0));
    }

    @Test
    @DisplayName("GET /api/v1/reports/transactions/export - Returns CSV for date range")
    void testExportCSV() throws Exception {
        createTransaction(expenseCategoryId, "EXPENSE", new BigDecimal("42.00"),
                LocalDate.now(), "CSV export test");

        String startDate = LocalDate.now().minusDays(1).toString();
        String endDate   = LocalDate.now().plusDays(1).toString();

        MvcResult result = mockMvc.perform(get("/api/v1/reports/transactions/export")
                        .cookie(authCookie)
                        .param("startDate", startDate)
                        .param("endDate",   endDate))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition",
                        containsString("attachment")))
                .andReturn();

        String csv = result.getResponse().getContentAsString();
        // Should contain the header row and the transaction
        assert csv.contains("Date,Type,Account,Category,Amount,Description");
        assert csv.contains("42.00");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helper
    // ──────────────────────────────────────────────────────────────────────────

    private void createTransaction(Long categoryId, String type, BigDecimal amount,
                                   LocalDate date, String description) throws Exception {
        CreateTransactionRequest req = new CreateTransactionRequest();
        req.setAccountId(accountId);
        req.setCategoryId(categoryId);
        req.setTransactionType(TransactionType.valueOf(type));
        req.setAmount(amount);
        req.setTransactionDate(date);
        req.setDescription(description);

        mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }
}
