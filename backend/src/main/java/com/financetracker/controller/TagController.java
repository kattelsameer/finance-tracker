package com.financetracker.controller;

import com.financetracker.dto.tag.CreateTagRequest;
import com.financetracker.dto.tag.TagResponse;
import com.financetracker.dto.tag.UpdateTagRequest;
import com.financetracker.security.CurrentUser;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.TagService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@SuppressWarnings("null")
public class TagController {
    
    private final TagService tagService;
    
    public TagController(TagService tagService) {
        this.tagService = tagService;
    }
    
    @PostMapping
    public ResponseEntity<TagResponse> createTag(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateTagRequest request) {
        TagResponse tag = tagService.createTag(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tag);
    }
    
    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags(
            @CurrentUser UserPrincipal currentUser) {
        List<TagResponse> tags = tagService.getAllTagsForUser(currentUser.getId());
        return ResponseEntity.ok(tags);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> getTagById(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id) {
        TagResponse tag = tagService.getTagById(currentUser.getId(), id);
        return ResponseEntity.ok(tag);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TagResponse> updateTag(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTagRequest request) {
        TagResponse tag = tagService.updateTag(currentUser.getId(), id, request);
        return ResponseEntity.ok(tag);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id) {
        tagService.deleteTag(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
