package com.financetracker.dto.category;


import jakarta.validation.constraints.*;

public class UpdateCategoryRequest {
    
    @Size(min = 1, max = 50, message = "Category name must be between 1 and 50 characters")
    private String categoryName;
    
    private Long parentId;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color code must be a valid hex color")
    private String colorCode;
    
    @Size(max = 50, message = "Icon name must be less than 50 characters")
    private String icon;
    
    private Boolean isActive;
    
    private Integer displayOrder;
    
    public UpdateCategoryRequest() {
    }
    
    public String getCategoryName() {
        return categoryName;
    }
    
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    
    public Long getParentId() {
        return parentId;
    }
    
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
    
    public String getColorCode() {
        return colorCode;
    }
    
    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
    }
    
    public String getIcon() {
        return icon;
    }
    
    public void setIcon(String icon) {
        this.icon = icon;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Integer getDisplayOrder() {
        return displayOrder;
    }
    
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
