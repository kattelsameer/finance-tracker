package com.financetracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.account.CreateAccountRequest;
import com.financetracker.dto.auth.LoginRequest;
import com.financetracker.dto.auth.RegisterRequest;
import com.financetracker.dto.recurring.CreateRecurringTransactionRequest;
import com.financetracker.entity.AccountType;
import com.financetracker.entity.Category;
import com.financetracker.entity.RecurringTransaction.Frequency;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Recurring Transaction Controller Integration Tests")
class RecurringTransactionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountTypeRepository accountTypeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Cookie authCookie;
    private Long accountId;
    private Long expenseCategoryId;

    @BeforeEach
    void setUp() throws Exception {
        // Create account type
        AccountType checkingType = new AccountType();
        checkingType.setTypeCode("CHECKING");
        checkingType.setTypeName("Checking Account");
        checkingType.setIsLiability(false);
        checkingType.setDisplayOrder(1);
        checkingType = accountTypeRepository.save(checkingType);

        // Create category
        Category expenseCategory = new Category();
        expenseCategory.setCategoryName("Bills");
        expenseCategory.setCategoryType(Category.CategoryType.EXPENSE);
        expenseCategory.setColorCode("#ef4444");
        expenseCategory.setIcon("receipt");
        expenseCategory.setIsSystem(true);
        expenseCategory.setIsActive(true);
        expenseCategory.setDisplayOrder(1);
        expenseCategory = categoryRepository.save(expenseCategory);
        expenseCategoryId = expenseCategory.getId();

        // Register and login user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("SecureP@ssw0rd!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("SecureP@ssw0rd!");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        authCookie = new Cookie("auth_token", loginResult.getResponse().getCookie("auth_token").getValue());

        // Create account
        CreateAccountRequest accountRequest = new CreateAccountRequest();
        accountRequest.setAccountName("My Checking");
        accountRequest.setAccountTypeId(checkingType.getId());
        accountRequest.setInitialBalance(BigDecimal.valueOf(1000));
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
    @DisplayName("POST /api/v1/recurring-transactions - Should create recurring transaction")
    void createRecurringTransaction_Success() throws Exception {
        CreateRecurringTransactionRequest request = new CreateRecurringTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(expenseCategoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(BigDecimal.valueOf(100));
        request.setDescription("Monthly Rent");
        request.setFrequency(Frequency.MONTHLY);
        request.setStartDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/recurring-transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description", is("Monthly Rent")))
                .andExpect(jsonPath("$.frequency", is("MONTHLY")));
    }

    @Test
    @DisplayName("GET /api/v1/recurring-transactions - Should return recurring transactions")
    void getRecurringTransactions_Success() throws Exception {
        // Create a recurring transaction first
        CreateRecurringTransactionRequest request = new CreateRecurringTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(expenseCategoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(BigDecimal.valueOf(50));
        request.setDescription("Weekly Subscription");
        request.setFrequency(Frequency.WEEKLY);
        request.setStartDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/recurring-transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Get recurring transactions
        mockMvc.perform(get("/api/v1/recurring-transactions")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("GET /api/v1/recurring-transactions/{id} - Should return specific recurring transaction")
    void getRecurringTransactionById_Success() throws Exception {
        // Create a recurring transaction first
        CreateRecurringTransactionRequest request = new CreateRecurringTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(expenseCategoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(BigDecimal.valueOf(75));
        request.setDescription("Specific Recurring");
        request.setFrequency(Frequency.MONTHLY);
        request.setStartDate(LocalDate.now());

        MvcResult createResult = mockMvc.perform(post("/api/v1/recurring-transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long recurringId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Get by ID
        mockMvc.perform(get("/api/v1/recurring-transactions/" + recurringId)
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", is("Specific Recurring")));
    }

    @Test
    @DisplayName("PUT /api/v1/recurring-transactions/{id} - Should update recurring transaction")
    void updateRecurringTransaction_Success() throws Exception {
        // Create a recurring transaction first
        CreateRecurringTransactionRequest request = new CreateRecurringTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(expenseCategoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(BigDecimal.valueOf(100));
        request.setDescription("Original");
        request.setFrequency(Frequency.MONTHLY);
        request.setStartDate(LocalDate.now());

        MvcResult createResult = mockMvc.perform(post("/api/v1/recurring-transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long recurringId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Update
        request.setDescription("Updated");
        request.setAmount(BigDecimal.valueOf(150));

        mockMvc.perform(put("/api/v1/recurring-transactions/" + recurringId)
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", is("Updated")))
                .andExpect(jsonPath("$.amount").value(150));
    }

    @Test
    @DisplayName("DELETE /api/v1/recurring-transactions/{id} - Should delete recurring transaction")
    void deleteRecurringTransaction_Success() throws Exception {
        // Create a recurring transaction first
        CreateRecurringTransactionRequest request = new CreateRecurringTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(expenseCategoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(BigDecimal.valueOf(25));
        request.setDescription("To Delete");
        request.setFrequency(Frequency.WEEKLY);
        request.setStartDate(LocalDate.now());

        MvcResult createResult = mockMvc.perform(post("/api/v1/recurring-transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long recurringId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Delete
        mockMvc.perform(delete("/api/v1/recurring-transactions/" + recurringId)
                        .with(csrf())
                        .cookie(authCookie))
                .andExpect(status().isNoContent());

        // Verify deleted
        mockMvc.perform(get("/api/v1/recurring-transactions/" + recurringId)
                        .cookie(authCookie))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/recurring-transactions - Should return 401 without auth")
    void getRecurringTransactions_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/recurring-transactions"))
                .andExpect(status().isUnauthorized());
    }
}
