package com.financetracker.dto.category;

import com.financetracker.entity.Category.CategoryType;
import java.time.LocalDateTime;
import java.util.List;

public class CategoryResponse {
    
    private Long id;
    private String categoryName;
    private CategoryType categoryType;
    private Long parentId;
    private String parentName;
    private String colorCode;
    private String icon;
    private Boolean isSystem;
    private Boolean isActive;
    private Integer displayOrder;
    private List<CategoryResponse> subcategories;
    private LocalDateTime createdAt;
    
    public CategoryResponse() {
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public String getParentName() {
        return parentName;
    }
    
    public void setParentName(String parentName) {
        this.parentName = parentName;
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
    
    public Boolean getIsSystem() {
        return isSystem;
    }
    
    public void setIsSystem(Boolean isSystem) {
        this.isSystem = isSystem;
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
    
    public List<CategoryResponse> getSubcategories() {
        return subcategories;
    }
    
    public void setSubcategories(List<CategoryResponse> subcategories) {
        this.subcategories = subcategories;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
