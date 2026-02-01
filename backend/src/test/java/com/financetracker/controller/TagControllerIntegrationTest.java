package com.financetracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.auth.LoginRequest;
import com.financetracker.dto.auth.RegisterRequest;
import com.financetracker.dto.tag.CreateTagRequest;
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
@DisplayName("Tag Controller Integration Tests")
@SuppressWarnings("null")
class TagControllerIntegrationTest {

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
    @DisplayName("POST /api/v1/tags - Should create tag successfully")
    void createTag_Success() throws Exception {
        CreateTagRequest request = new CreateTagRequest();
        request.setTagName("vacation");
        request.setColorCode("#3b82f6");

        mockMvc.perform(post("/api/v1/tags")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tagName", is("vacation")))
                .andExpect(jsonPath("$.colorCode", is("#3b82f6")));
    }

    @Test
    @DisplayName("POST /api/v1/tags - Should fail without tag name")
    void createTag_MissingName() throws Exception {
        CreateTagRequest request = new CreateTagRequest();
        request.setColorCode("#3b82f6");

        mockMvc.perform(post("/api/v1/tags")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/tags - Should return user tags")
    void getTags_Success() throws Exception {
        // Create a tag first
        CreateTagRequest request = new CreateTagRequest();
        request.setTagName("work");
        request.setColorCode("#10b981");

        mockMvc.perform(post("/api/v1/tags")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Get tags
        mockMvc.perform(get("/api/v1/tags")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].tagName", is("work")));
    }

    @Test
    @DisplayName("GET /api/v1/tags/{id} - Should return specific tag")
    void getTagById_Success() throws Exception {
        // Create a tag first
        CreateTagRequest request = new CreateTagRequest();
        request.setTagName("personal");
        request.setColorCode("#8b5cf6");

        MvcResult createResult = mockMvc.perform(post("/api/v1/tags")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long tagId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Get tag by ID
        mockMvc.perform(get("/api/v1/tags/" + tagId)
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tagName", is("personal")));
    }

    @Test
    @DisplayName("PUT /api/v1/tags/{id} - Should update tag")
    void updateTag_Success() throws Exception {
        // Create a tag first
        CreateTagRequest request = new CreateTagRequest();
        request.setTagName("oldname");
        request.setColorCode("#000000");

        MvcResult createResult = mockMvc.perform(post("/api/v1/tags")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long tagId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Update tag
        request.setTagName("newname");
        request.setColorCode("#ffffff");

        mockMvc.perform(put("/api/v1/tags/" + tagId)
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tagName", is("newname")))
                .andExpect(jsonPath("$.colorCode", is("#ffffff")));
    }

    @Test
    @DisplayName("DELETE /api/v1/tags/{id} - Should delete tag")
    void deleteTag_Success() throws Exception {
        // Create a tag first
        CreateTagRequest request = new CreateTagRequest();
        request.setTagName("todelete");
        request.setColorCode("#ff0000");

        MvcResult createResult = mockMvc.perform(post("/api/v1/tags")
                        .with(csrf())
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long tagId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Delete tag
        mockMvc.perform(delete("/api/v1/tags/" + tagId)
                        .with(csrf())
                        .cookie(authCookie))
                .andExpect(status().isNoContent());

        // Verify tag is deleted
        mockMvc.perform(get("/api/v1/tags/" + tagId)
                        .cookie(authCookie))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/tags - Should return 401 without auth")
    void getTags_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/tags"))
                .andExpect(status().isUnauthorized());
    }
}
