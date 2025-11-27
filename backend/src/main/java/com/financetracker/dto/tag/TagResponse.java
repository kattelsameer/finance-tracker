package com.financetracker.dto.tag;

import java.time.LocalDateTime;

public class TagResponse {
    
    private Long id;
    private String tagName;
    private String colorCode;
    private LocalDateTime createdAt;
    
    public TagResponse() {
    }
    
    public TagResponse(Long id, String tagName, String colorCode, LocalDateTime createdAt) {
        this.id = id;
        this.tagName = tagName;
        this.colorCode = colorCode;
        this.createdAt = createdAt;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTagName() {
        return tagName;
    }
    
    public void setTagName(String tagName) {
        this.tagName = tagName;
    }
    
    public String getColorCode() {
        return colorCode;
    }
    
    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
