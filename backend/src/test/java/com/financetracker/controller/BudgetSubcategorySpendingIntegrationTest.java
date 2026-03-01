package com.financetracker.controller;

import com.financetracker.dto.account.CreateAccountRequest;
import com.financetracker.dto.budget.CreateBudgetRequest;
import com.financetracker.dto.transaction.CreateTransactionRequest;
import com.financetracker.entity.AccountType;
import com.financetracker.entity.Budget.PeriodType;
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
 * Tests specifically for BUG-1: Budget spending must include transactions recorded
 * against child (sub)categories of the budget's category.
 *
 * Scenario:
 *  - Budget is set on parent category "Food & Dining"
 *  - Actual transactions have category "Groceries" (child of "Food & Dining")
 *  - Expected: budget shows non-zero "spent" amount
 *  - Previous bug: spent was always $0.00 because query used exact category_id match
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Budget Subcategory Spending Integration Tests")
@SuppressWarnings("null")
class BudgetSubcategorySpendingIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private AccountTypeRepository accountTypeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Cookie authCookie;
    private Long accountId;
    private Long parentCategoryId;
    private Long childCategoryId;

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

        // Create parent category: "Food & Dining"
        Category parentCategory = new Category();
        parentCategory.setCategoryName("Food & Dining");
        parentCategory.setCategoryType(Category.CategoryType.EXPENSE);
        parentCategory.setColorCode("#eab308");
        parentCategory.setIcon("utensils");
        parentCategory.setIsSystem(true);
        parentCategory.setIsActive(true);
        parentCategory.setDisplayOrder(1);
        parentCategory = categoryRepository.save(parentCategory);
        parentCategoryId = parentCategory.getId();

        // Create child category: "Groceries" (sub-category of "Food & Dining")
        Category childCategory = new Category();
        childCategory.setCategoryName("Groceries");
        childCategory.setCategoryType(Category.CategoryType.EXPENSE);
        childCategory.setParent(parentCategory);
        childCategory.setColorCode("#ef4444");
        childCategory.setIcon("shopping-cart");
        childCategory.setIsSystem(false);
        childCategory.setIsActive(true);
        childCategory.setDisplayOrder(1);
        childCategory = categoryRepository.save(childCategory);
        childCategoryId = childCategory.getId();

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

    @Test
    @DisplayName("BUG-1 regression: Budget on parent category must count subcategory transactions")
    void testBudgetSpentIncludesSubcategoryTransactions() throws Exception {
        // Create a budget on the PARENT category
        CreateBudgetRequest budgetRequest = new CreateBudgetRequest();
        budgetRequest.setBudgetName("Food Budget");
        budgetRequest.setCategoryId(parentCategoryId);    // ← parent category
        budgetRequest.setAmount(BigDecimal.valueOf(500));
        budgetRequest.setPeriodType(PeriodType.MONTHLY);
        budgetRequest.setStartDate(LocalDate.now().withDayOfMonth(1));
        budgetRequest.setEndDate(LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1));

        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(budgetRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long budgetId = objectMapper.readTree(budgetResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Record expense in the CHILD category
        CreateTransactionRequest txRequest = new CreateTransactionRequest();
        txRequest.setAccountId(accountId);
        txRequest.setCategoryId(childCategoryId);          // ← child category
        txRequest.setTransactionType(TransactionType.EXPENSE);
        txRequest.setAmount(new BigDecimal("120.00"));
        txRequest.setTransactionDate(LocalDate.now());
        txRequest.setDescription("Whole Foods grocery run");

        mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txRequest)))
                .andExpect(status().isCreated());

        // Fetch the budget and assert the spent amount reflects the child-category transaction
        mockMvc.perform(get("/api/v1/budgets/" + budgetId)
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.spent").value(120.00))     // ← $0.00 before the fix
                .andExpect(jsonPath("$.percentUsed").value(greaterThan(0.0)))
                .andExpect(jsonPath("$.remaining").value(380.00));
    }

    @Test
    @DisplayName("Budget on parent category counts BOTH parent and child transactions")
    void testBudgetSpentCountsParentAndChildTransactions() throws Exception {
        CreateBudgetRequest budgetRequest = new CreateBudgetRequest();
        budgetRequest.setBudgetName("Food Budget");
        budgetRequest.setCategoryId(parentCategoryId);
        budgetRequest.setAmount(BigDecimal.valueOf(500));
        budgetRequest.setPeriodType(PeriodType.MONTHLY);
        budgetRequest.setStartDate(LocalDate.now().withDayOfMonth(1));
        budgetRequest.setEndDate(LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1));

        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(budgetRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long budgetId = objectMapper.readTree(budgetResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Transaction directly in parent category
        createExpense(parentCategoryId, new BigDecimal("50.00"), LocalDate.now(), "Dinner");
        // Transaction in child category
        createExpense(childCategoryId, new BigDecimal("80.00"), LocalDate.now(), "Groceries");

        // Total: $130.00 across parent + child
        mockMvc.perform(get("/api/v1/budgets/" + budgetId)
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.spent").value(130.00))
                .andExpect(jsonPath("$.remaining").value(370.00));
    }

    @Test
    @DisplayName("Budget on explicit child category only counts that category, not siblings")
    void testBudgetOnChildCategoryNotSiblings() throws Exception {
        // Create a second child category (sibling)
        Category siblingCategory = new Category();
        siblingCategory.setCategoryName("Dining Out");
        siblingCategory.setCategoryType(Category.CategoryType.EXPENSE);
        Category parentRef = new Category();
        parentRef.setId(parentCategoryId);
        siblingCategory.setParent(parentRef);
        siblingCategory.setColorCode("#ef4444");
        siblingCategory.setIcon("utensils");
        siblingCategory.setIsSystem(false);
        siblingCategory.setIsActive(true);
        siblingCategory.setDisplayOrder(2);
        siblingCategory = categoryRepository.save(siblingCategory);
        Long siblingCategoryId = siblingCategory.getId();

        // Budget on the first CHILD category (Groceries) only
        CreateBudgetRequest budgetRequest = new CreateBudgetRequest();
        budgetRequest.setBudgetName("Grocery Budget");
        budgetRequest.setCategoryId(childCategoryId);         // ← Groceries (child)
        budgetRequest.setAmount(BigDecimal.valueOf(200));
        budgetRequest.setPeriodType(PeriodType.MONTHLY);
        budgetRequest.setStartDate(LocalDate.now().withDayOfMonth(1));
        budgetRequest.setEndDate(LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1));

        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(budgetRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long budgetId = objectMapper.readTree(budgetResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Spend in Groceries (should count)
        createExpense(childCategoryId, new BigDecimal("90.00"), LocalDate.now(), "Grocery spend");
        // Spend in Dining Out (sibling, should NOT count toward Groceries budget)
        createExpense(siblingCategoryId, new BigDecimal("60.00"), LocalDate.now(), "Dinner out");

        mockMvc.perform(get("/api/v1/budgets/" + budgetId)
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.spent").value(90.00));   // Only Groceries, not Dining Out
    }

    private void createExpense(Long categoryId, BigDecimal amount, LocalDate date, String desc) throws Exception {
        CreateTransactionRequest req = new CreateTransactionRequest();
        req.setAccountId(accountId);
        req.setCategoryId(categoryId);
        req.setTransactionType(TransactionType.EXPENSE);
        req.setAmount(amount);
        req.setTransactionDate(date);
        req.setDescription(desc);

        mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }
}
