package com.financetracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.UpdateNotificationPreferenceRequest;
import com.financetracker.dto.auth.LoginRequest;
import com.financetracker.dto.auth.RegisterRequest;
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
@DisplayName("Notification Controller Integration Tests")
class NotificationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

        authCookie = new Cookie("auth_token", loginResult.getResponse().getCookie("auth_token").getValue());
    }

    @Test
    @DisplayName("GET /api/v1/notifications - Should return user notifications")
    void getNotifications_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications")
                        .cookie(authCookie))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/notifications/unread - Should return unread notifications")
    void getUnreadNotifications_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/unread")
                        .cookie(authCookie))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/notifications/unread/count - Should return unread count")
    void getUnreadCount_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/unread/count")
                        .cookie(authCookie))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/notifications/preferences - Should return notification preferences")
    void getPreferences_Success() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/preferences")
                        .cookie(authCookie))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/v1/notifications/preferences - Should update notification preferences")
    void updatePreferences_Success() throws Exception {
        UpdateNotificationPreferenceRequest request = new UpdateNotificationPreferenceRequest();
        request.setBudgetAlertsEnabled(true);
        request.setLowBalanceAlertsEnabled(true);
        request.setRecurringRemindersEnabled(false);
        request.setLargeTransactionAlertsEnabled(true);
        request.setEmailNotificationsEnabled(true);
        request.setInAppNotificationsEnabled(true);

        mockMvc.perform(put("/api/v1/notifications/preferences")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/notifications - Should return 401 without auth")
    void getNotifications_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isUnauthorized());
    }
}
