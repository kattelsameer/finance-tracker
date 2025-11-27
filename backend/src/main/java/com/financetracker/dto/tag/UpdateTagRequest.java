package com.financetracker.dto.tag;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateTagRequest {
    
    @Size(max = 30, message = "Tag name must not exceed 30 characters")
    private String tagName;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color code must be a valid hex color (e.g., #6366f1)")
    private String colorCode;
    
    public UpdateTagRequest() {
    }
    
    public UpdateTagRequest(String tagName, String colorCode) {
        this.tagName = tagName;
        this.colorCode = colorCode;
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
}
