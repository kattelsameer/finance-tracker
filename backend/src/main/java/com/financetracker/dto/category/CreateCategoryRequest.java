package com.financetracker.dto.category;

import com.financetracker.entity.Category.CategoryType;
import jakarta.validation.constraints.*;

public class CreateCategoryRequest {
    
    @NotBlank(message = "Category name is required")
    @Size(min = 1, max = 50, message = "Category name must be between 1 and 50 characters")
    private String categoryName;
    
    @NotNull(message = "Category type is required")
    private CategoryType categoryType;
    
    private Long parentId;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color code must be a valid hex color")
    private String colorCode = "#6366f1";
    
    @Size(max = 50, message = "Icon name must be less than 50 characters")
    private String icon = "folder";
    
    private Integer displayOrder = 0;
    
    public CreateCategoryRequest() {
    }
    
    public String getCategoryName() {
        return categoryName;
    }
    
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    
    public CategoryType getCategoryType() {
        return categoryType;
    }
    
    public void setCategoryType(CategoryType categoryType) {
        this.categoryType = categoryType;
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
    
    public Integer getDisplayOrder() {
        return displayOrder;
    }
    
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
