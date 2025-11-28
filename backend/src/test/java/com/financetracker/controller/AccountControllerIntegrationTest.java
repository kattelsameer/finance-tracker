package com.financetracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.account.CreateAccountRequest;
import com.financetracker.dto.auth.LoginRequest;
import com.financetracker.dto.auth.RegisterRequest;
import com.financetracker.entity.AccountType;
import com.financetracker.repository.AccountTypeRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Account Controller Integration Tests")
class AccountControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountTypeRepository accountTypeRepository;

    private Cookie authCookie;
    private AccountType checkingType;

    @BeforeEach
    void setUp() throws Exception {
        // Create account type
        checkingType = new AccountType();
        checkingType.setTypeCode("CHECKING");
        checkingType.setTypeName("Checking Account");
        checkingType.setIsLiability(false);
        checkingType.setDisplayOrder(1);
        checkingType = accountTypeRepository.save(checkingType);

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
    }

    @Test
    @DisplayName("GET /api/v1/accounts/types - Should return all account types")
    void getAccountTypes_Success() throws Exception {
        mockMvc.perform(get("/api/v1/accounts/types")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].typeCode", is("CHECKING")));
    }

    @Test
    @DisplayName("POST /api/v1/accounts - Should create account successfully")
    void createAccount_Success() throws Exception {
        CreateAccountRequest request = new CreateAccountRequest();
        request.setAccountName("My Checking");
        request.setAccountTypeId(checkingType.getId());
        request.setInitialBalance(BigDecimal.valueOf(1000));
        request.setCurrency("USD");

        mockMvc.perform(post("/api/v1/accounts")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accountName", is("My Checking")))
                .andExpect(jsonPath("$.currency", is("USD")))
                .andExpect(jsonPath("$.accountType.typeCode", is("CHECKING")));
    }

    @Test
    @DisplayName("POST /api/v1/accounts - Should fail without account name")
    void createAccount_MissingName() throws Exception {
        CreateAccountRequest request = new CreateAccountRequest();
        request.setAccountTypeId(checkingType.getId());
        request.setCurrency("USD");

        mockMvc.perform(post("/api/v1/accounts")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("VALIDATION_FAILED")));
    }

    @Test
    @DisplayName("GET /api/v1/accounts - Should return user accounts")
    void getAccounts_Success() throws Exception {
        // Create an account first
        CreateAccountRequest request = new CreateAccountRequest();
        request.setAccountName("My Checking");
        request.setAccountTypeId(checkingType.getId());
        request.setInitialBalance(BigDecimal.valueOf(1000));
        request.setCurrency("USD");

        mockMvc.perform(post("/api/v1/accounts")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Get accounts
        mockMvc.perform(get("/api/v1/accounts")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].accountName", is("My Checking")));
    }

    @Test
    @DisplayName("GET /api/v1/accounts/{id} - Should return specific account")
    void getAccountById_Success() throws Exception {
        // Create an account first
        CreateAccountRequest request = new CreateAccountRequest();
        request.setAccountName("My Savings");
        request.setAccountTypeId(checkingType.getId());
        request.setInitialBalance(BigDecimal.valueOf(5000));
        request.setCurrency("USD");

        MvcResult createResult = mockMvc.perform(post("/api/v1/accounts")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long accountId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Get account by ID
        mockMvc.perform(get("/api/v1/accounts/" + accountId)
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountName", is("My Savings")));
    }

    @Test
    @DisplayName("PUT /api/v1/accounts/{id} - Should update account")
    void updateAccount_Success() throws Exception {
        // Create an account first
        CreateAccountRequest createRequest = new CreateAccountRequest();
        createRequest.setAccountName("Old Name");
        createRequest.setAccountTypeId(checkingType.getId());
        createRequest.setCurrency("USD");

        MvcResult createResult = mockMvc.perform(post("/api/v1/accounts")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long accountId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Update account
        createRequest.setAccountName("New Name");
        mockMvc.perform(put("/api/v1/accounts/" + accountId)
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountName", is("New Name")));
    }

    @Test
    @DisplayName("DELETE /api/v1/accounts/{id} - Should delete account")
    void deleteAccount_Success() throws Exception {
        // Create an account first
        CreateAccountRequest request = new CreateAccountRequest();
        request.setAccountName("To Delete");
        request.setAccountTypeId(checkingType.getId());
        request.setCurrency("USD");

        MvcResult createResult = mockMvc.perform(post("/api/v1/accounts")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long accountId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Delete account
        mockMvc.perform(delete("/api/v1/accounts/" + accountId)
                        .with(csrf())
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Account deleted successfully")));
    }

    @Test
    @DisplayName("GET /api/v1/accounts - Should return 401 without auth")
    void getAccounts_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/accounts"))
                .andExpect(status().isUnauthorized());
    }
}
