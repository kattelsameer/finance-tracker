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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Import/Export Controller Integration Tests")
@SuppressWarnings("null")
class ImportExportControllerIntegrationTest {

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
    private Long categoryId;

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
        expenseCategory.setCategoryName("Groceries");
        expenseCategory.setCategoryType(Category.CategoryType.EXPENSE);
        expenseCategory.setColorCode("#ef4444");
        expenseCategory.setIcon("shopping-cart");
        expenseCategory.setIsSystem(true);
        expenseCategory.setIsActive(true);
        expenseCategory.setDisplayOrder(1);
        expenseCategory = categoryRepository.save(expenseCategory);
        categoryId = expenseCategory.getId();

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

        Cookie cookie = loginResult.getResponse().getCookie("auth_token");
        if (cookie == null) {
            throw new IllegalStateException("auth_token cookie not found after login");
        }
        authCookie = new Cookie("auth_token", cookie.getValue());

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

        // Create a transaction for export
        createTransaction("Test Transaction", BigDecimal.valueOf(50));
    }

    private void createTransaction(String description, BigDecimal amount) throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setAccountId(accountId);
        request.setCategoryId(categoryId);
        request.setTransactionType(TransactionType.EXPENSE);
        request.setAmount(amount);
        request.setDescription(description);
        request.setTransactionDate(LocalDate.now());

        mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("GET /api/v1/import-export/export/csv - Should export transactions to CSV")
    void exportTransactions_Success() throws Exception {
        mockMvc.perform(get("/api/v1/import-export/export/csv")
                        .cookie(authCookie)
                        .param("startDate", LocalDate.now().minusDays(30).toString())
                        .param("endDate", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"));
    }

    @Test
    @DisplayName("POST /api/v1/import-export/import/csv - Should import transactions from CSV")
    void importTransactions_Success() throws Exception {
        String csvContent = "date,description,amount,type,category,account\n" +
                LocalDate.now() + ",Test Import,25.00,EXPENSE,Groceries,My Checking";

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "transactions.csv",
                "text/csv",
                csvContent.getBytes()
        );

        mockMvc.perform(multipart("/api/v1/import-export/import/csv")
                        .file(file)
                        .with(csrf())
                        .cookie(authCookie))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/import-export/export/csv - Should return 401 without auth")
    void exportTransactions_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/import-export/export/csv")
                        .param("startDate", LocalDate.now().minusDays(30).toString())
                        .param("endDate", LocalDate.now().toString()))
                .andExpect(status().isUnauthorized());
    }
}
