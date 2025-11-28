package com.financetracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.account.CreateAccountRequest;
import com.financetracker.dto.auth.LoginRequest;
import com.financetracker.dto.auth.RegisterRequest;
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
@DisplayName("Transaction Controller Integration Tests")
class TransactionControllerIntegrationTest {

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
    private Long incomeCategoryId;
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

        // Create categories
        Category incomeCategory = new Category();
        incomeCategory.setCategoryName("Salary");
        incomeCategory.setCategoryType(Category.CategoryType.INCOME);
        incomeCategory.setColorCode("#22c55e");
        incomeCategory.setIcon("briefcase");
        incomeCategory.setIsSystem(true);
        incomeCategory.setIsActive(true);
        incomeCategory.setDisplayOrder(1);
        incomeCategory = categoryRepository.save(incomeCategory);
        incomeCategoryId = incomeCategory.getId();

        Category expenseCategory = new Category();
        expenseCategory.setCategoryName("Groceries");
        expenseCategory.setCategoryType(Category.CategoryType.EXPENSE);
        expenseCategory.setColorCode("#ef4444");
        expenseCategory.setIcon("shopping-cart");
        expenseCategory.setIsSystem(true);
        expenseCategory.setIsActive(true);
        expenseCategory.setDisplayOrder(2);
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
    @DisplayName("POST /api/v1/transactions - Should create income transaction")
    void createIncomeTransaction_Success() throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(incomeCategoryId);
        request.setTransactionType(TransactionType.INCOME);
        request.setAmount(BigDecimal.valueOf(2000));
        request.setDescription("Monthly Salary");
        request.setTransactionDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionType", is("INCOME")))
                .andExpect(jsonPath("$.amount").value(2000))
                .andExpect(jsonPath("$.description", is("Monthly Salary")));
    }

    @Test
    @DisplayName("POST /api/v1/transactions - Should create expense transaction")
    void createExpenseTransaction_Success() throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(expenseCategoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(BigDecimal.valueOf(150));
        request.setDescription("Weekly Groceries");
        request.setTransactionDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionType", is("EXPENSE")))
                .andExpect(jsonPath("$.amount").value(150))
                .andExpect(jsonPath("$.description", is("Weekly Groceries")));
    }

    @Test
    @DisplayName("POST /api/v1/transactions - Should fail without amount")
    void createTransaction_MissingAmount() throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(incomeCategoryId);
        request.setTransactionType(TransactionType.INCOME);
        request.setDescription("No Amount");
        request.setTransactionDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("VALIDATION_FAILED")));
    }

    @Test
    @DisplayName("GET /api/v1/transactions - Should return paginated transactions")
    void getTransactions_Success() throws Exception {
        // Create a transaction first
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(incomeCategoryId);
        request.setTransactionType(TransactionType.INCOME);
        request.setAmount(BigDecimal.valueOf(1000));
        request.setDescription("Test Income");
        request.setTransactionDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Get transactions
        mockMvc.perform(get("/api/v1/transactions")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[0].description", is("Test Income")));
    }

    @Test
    @DisplayName("GET /api/v1/transactions/{id} - Should return specific transaction")
    void getTransactionById_Success() throws Exception {
        // Create a transaction first
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(expenseCategoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(BigDecimal.valueOf(50));
        request.setDescription("Coffee");
        request.setTransactionDate(LocalDate.now());

        MvcResult createResult = mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long transactionId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Get transaction by ID
        mockMvc.perform(get("/api/v1/transactions/" + transactionId)
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", is("Coffee")));
    }

    @Test
    @DisplayName("PUT /api/v1/transactions/{id} - Should update transaction")
    void updateTransaction_Success() throws Exception {
        // Create a transaction first
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(expenseCategoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(BigDecimal.valueOf(100));
        request.setDescription("Original");
        request.setTransactionDate(LocalDate.now());

        MvcResult createResult = mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long transactionId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Update transaction
        request.setDescription("Updated");
        request.setAmount(BigDecimal.valueOf(200));

        mockMvc.perform(put("/api/v1/transactions/" + transactionId)
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", is("Updated")))
                .andExpect(jsonPath("$.amount").value(200));
    }

    @Test
    @DisplayName("DELETE /api/v1/transactions/{id} - Should delete transaction")
    void deleteTransaction_Success() throws Exception {
        // Create a transaction first
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(expenseCategoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(BigDecimal.valueOf(25));
        request.setDescription("To Delete");
        request.setTransactionDate(LocalDate.now());

        MvcResult createResult = mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long transactionId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Delete transaction
        mockMvc.perform(delete("/api/v1/transactions/" + transactionId)
                        .with(csrf())
                        .cookie(authCookie))
                .andExpect(status().isOk());

        // Verify transaction is deleted
        mockMvc.perform(get("/api/v1/transactions/" + transactionId)
                        .cookie(authCookie))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/transactions - Should return 401 without auth")
    void getTransactions_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/transactions"))
                .andExpect(status().isUnauthorized());
    }
}
