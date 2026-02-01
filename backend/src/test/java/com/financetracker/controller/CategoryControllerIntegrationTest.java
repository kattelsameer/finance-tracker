package com.financetracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.auth.LoginRequest;
import com.financetracker.dto.auth.RegisterRequest;
import com.financetracker.dto.category.CreateCategoryRequest;
import com.financetracker.entity.Category;
import com.financetracker.entity.Category.CategoryType;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Category Controller Integration Tests")
@SuppressWarnings("null")
class CategoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    private Cookie authCookie;

    @BeforeEach
    void setUp() throws Exception {
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

        // Create system categories
        createSystemCategory("Salary", CategoryType.INCOME, "#22c55e", "briefcase");
        createSystemCategory("Groceries", CategoryType.EXPENSE, "#ef4444", "shopping-cart");
    }

    private void createSystemCategory(String name, CategoryType type, String color, String icon) {
        Category category = new Category();
        category.setCategoryName(name);
        category.setCategoryType(type);
        category.setColorCode(color);
        category.setIcon(icon);
        category.setIsSystem(true);
        category.setIsActive(true);
        category.setDisplayOrder(1);
        categoryRepository.save(category);
    }

    @Test
    @DisplayName("GET /api/v1/categories - Should return all categories")
    void getCategories_Success() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("GET /api/v1/categories?type=INCOME - Should return income categories")
    void getIncomeCategories_Success() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                        .param("type", "INCOME")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categoryType", is("INCOME")));
    }

    @Test
    @DisplayName("GET /api/v1/categories?type=EXPENSE - Should return expense categories")
    void getExpenseCategories_Success() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                        .param("type", "EXPENSE")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categoryType", is("EXPENSE")));
    }

    @Test
    @DisplayName("POST /api/v1/categories - Should create custom category")
    void createCategory_Success() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setCategoryName("Entertainment");
        request.setCategoryType(CategoryType.EXPENSE);
        request.setColorCode("#8b5cf6");
        request.setIcon("film");

        mockMvc.perform(post("/api/v1/categories")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.categoryName", is("Entertainment")))
                .andExpect(jsonPath("$.categoryType", is("EXPENSE")))
                .andExpect(jsonPath("$.isSystem", is(false)));
    }

    @Test
    @DisplayName("POST /api/v1/categories - Should fail without name")
    void createCategory_MissingName() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setCategoryType(CategoryType.EXPENSE);

        mockMvc.perform(post("/api/v1/categories")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/categories/{id} - Should return specific category")
    void getCategoryById_Success() throws Exception {
        // Create a category first
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setCategoryName("Travel");
        request.setCategoryType(CategoryType.EXPENSE);
        request.setColorCode("#f59e0b");
        request.setIcon("plane");

        MvcResult createResult = mockMvc.perform(post("/api/v1/categories")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long categoryId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Get category by ID
        mockMvc.perform(get("/api/v1/categories/" + categoryId)
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryName", is("Travel")));
    }

    @Test
    @DisplayName("PUT /api/v1/categories/{id} - Should update category")
    void updateCategory_Success() throws Exception {
        // Create a category first
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setCategoryName("Original Name");
        request.setCategoryType(CategoryType.EXPENSE);
        request.setColorCode("#000000");
        request.setIcon("star");

        MvcResult createResult = mockMvc.perform(post("/api/v1/categories")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long categoryId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Update category
        request.setCategoryName("Updated Name");
        request.setColorCode("#ffffff");

        mockMvc.perform(put("/api/v1/categories/" + categoryId)
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryName", is("Updated Name")))
                .andExpect(jsonPath("$.colorCode", is("#ffffff")));
    }

    @Test
    @DisplayName("DELETE /api/v1/categories/{id} - Should delete custom category")
    void deleteCategory_Success() throws Exception {
        // Create a category first
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setCategoryName("To Delete");
        request.setCategoryType(CategoryType.EXPENSE);
        request.setColorCode("#ff0000");
        request.setIcon("trash");

        MvcResult createResult = mockMvc.perform(post("/api/v1/categories")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long categoryId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Delete category
        mockMvc.perform(delete("/api/v1/categories/" + categoryId)
                        .with(csrf())
                        .cookie(authCookie))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/categories - Should return 401 without auth")
    void getCategories_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isUnauthorized());
    }
}
