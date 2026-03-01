package com.financetracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.auth.LoginRequest;
import com.financetracker.dto.auth.RegisterRequest;
import com.financetracker.dto.budget.CreateBudgetRequest;
import com.financetracker.entity.Budget.PeriodType;
import com.financetracker.entity.Category;
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
@DisplayName("Budget Controller Integration Tests")
@SuppressWarnings("null")
class BudgetControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    private Cookie authCookie;
    private Long expenseCategoryId;

    @BeforeEach
    void setUp() throws Exception {
        // Create expense category
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
    }

    @Test
    @DisplayName("POST /api/v1/budgets - Should create budget successfully")
    void createBudget_Success() throws Exception {
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setBudgetName("Grocery Budget");
        request.setCategoryId(expenseCategoryId);
        request.setAmount(BigDecimal.valueOf(500));
        request.setPeriodType(PeriodType.MONTHLY);
        request.setStartDate(LocalDate.now().withDayOfMonth(1));
        request.setEndDate(LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1));

        mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.budgetName", is("Grocery Budget")))
                .andExpect(jsonPath("$.amount").value(500));
    }

    @Test
    @DisplayName("POST /api/v1/budgets - Should fail without budget name")
    void createBudget_MissingName() throws Exception {
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setCategoryId(expenseCategoryId);
        request.setAmount(BigDecimal.valueOf(500));
        request.setPeriodType(PeriodType.MONTHLY);
        request.setStartDate(LocalDate.now().withDayOfMonth(1));

        mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/budgets - Should return user budgets")
    void getBudgets_Success() throws Exception {
        // Create a budget first
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setBudgetName("Test Budget");
        request.setCategoryId(expenseCategoryId);
        request.setAmount(BigDecimal.valueOf(300));
        request.setPeriodType(PeriodType.MONTHLY);
        request.setStartDate(LocalDate.now().withDayOfMonth(1));
        request.setEndDate(LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1));

        mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Get budgets
        mockMvc.perform(get("/api/v1/budgets")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("GET /api/v1/budgets/{id} - Should return specific budget")
    void getBudgetById_Success() throws Exception {
        // Create a budget first
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setBudgetName("Specific Budget");
        request.setCategoryId(expenseCategoryId);
        request.setAmount(BigDecimal.valueOf(400));
        request.setPeriodType(PeriodType.MONTHLY);
        request.setStartDate(LocalDate.now().withDayOfMonth(1));
        request.setEndDate(LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1));

        MvcResult createResult = mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long budgetId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Get budget by ID
        mockMvc.perform(get("/api/v1/budgets/" + budgetId)
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.budgetName", is("Specific Budget")));
    }

    @Test
    @DisplayName("PUT /api/v1/budgets/{id} - Should update budget")
    void updateBudget_Success() throws Exception {
        // Create a budget first
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setBudgetName("Original");
        request.setCategoryId(expenseCategoryId);
        request.setAmount(BigDecimal.valueOf(100));
        request.setPeriodType(PeriodType.MONTHLY);
        request.setStartDate(LocalDate.now().withDayOfMonth(1));
        request.setEndDate(LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1));

        MvcResult createResult = mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long budgetId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Update budget
        request.setBudgetName("Updated");
        request.setAmount(BigDecimal.valueOf(600));

        mockMvc.perform(put("/api/v1/budgets/" + budgetId)
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.budgetName", is("Updated")))
                .andExpect(jsonPath("$.amount").value(600));
    }

    @Test
    @DisplayName("DELETE /api/v1/budgets/{id} - Should delete budget")
    void deleteBudget_Success() throws Exception {
        // Create a budget first
        CreateBudgetRequest request = new CreateBudgetRequest();
        request.setBudgetName("To Delete");
        request.setCategoryId(expenseCategoryId);
        request.setAmount(BigDecimal.valueOf(200));
        request.setPeriodType(PeriodType.MONTHLY);
        request.setStartDate(LocalDate.now().withDayOfMonth(1));
        request.setEndDate(LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1));

        MvcResult createResult = mockMvc.perform(post("/api/v1/budgets")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long budgetId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Delete budget
        mockMvc.perform(delete("/api/v1/budgets/" + budgetId)
                        .with(csrf())
                        .cookie(authCookie))
                .andExpect(status().isNoContent());

        // Verify budget is deleted
        mockMvc.perform(get("/api/v1/budgets/" + budgetId)
                        .cookie(authCookie))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/budgets - Should return 401 without auth")
    void getBudgets_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/budgets"))
                .andExpect(status().isUnauthorized());
    }
}
