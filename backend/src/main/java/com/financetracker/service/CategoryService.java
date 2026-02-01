package com.financetracker.service;

import com.financetracker.dto.category.*;
import com.financetracker.entity.Category;
import com.financetracker.entity.Category.CategoryType;
import com.financetracker.entity.User;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class CategoryService {
    
    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);
    
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    
    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public CategoryResponse createCategory(Long userId, CreateCategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        
        // Check for duplicate name under same parent
        if (categoryRepository.existsByNameAndTypeAndParent(userId, request.getCategoryName(), 
                request.getCategoryType(), request.getParentId())) {
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Category with this name already exists");
        }
        
        Category category = new Category();
        category.setUser(user);
        category.setCategoryName(request.getCategoryName());
        category.setCategoryType(request.getCategoryType());
        category.setColorCode(request.getColorCode());
        category.setIcon(request.getIcon());
        category.setDisplayOrder(request.getDisplayOrder());
        category.setIsSystem(false);
        
        // Set parent if provided
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findByIdAndUserId(request.getParentId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND, "Parent category not found"));
            
            // Validate parent has same type
            if (parent.getCategoryType() != request.getCategoryType()) {
                throw new ApiException(ErrorCode.INVALID_INPUT, "Subcategory must have same type as parent");
            }
            
            category.setParent(parent);
        }
        
        category = categoryRepository.save(category);
        
        logger.info("Category created: {} for user: {}", category.getId(), userId);
        
        return mapToResponse(category, false);
    }
    
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(Long userId, boolean includeSubcategories) {
        List<Category> categories = categoryRepository.findTopLevelByUserId(userId);
        return categories.stream()
                .map(c -> mapToResponse(c, includeSubcategories))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(Long userId, CategoryType type, boolean includeSubcategories) {
        List<Category> categories = categoryRepository.findTopLevelByUserIdAndType(userId, type);
        return categories.stream()
                .map(c -> mapToResponse(c, includeSubcategories))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(Long userId, Long categoryId) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));
        
        return mapToResponse(category, true);
    }
    
    @Transactional
    public CategoryResponse updateCategory(Long userId, Long categoryId, UpdateCategoryRequest request) {
        // Can only update user-owned categories (not system)
        Category category = categoryRepository.findUserOwnedCategory(categoryId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND, 
                        "Category not found or cannot be modified"));
        
        if (category.getIsSystem()) {
            throw new ApiException(ErrorCode.OPERATION_NOT_ALLOWED, "System categories cannot be modified");
        }
        
        if (request.getCategoryName() != null) {
            category.setCategoryName(request.getCategoryName());
        }
        if (request.getColorCode() != null) {
            category.setColorCode(request.getColorCode());
        }
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        
        // Handle parent change
        if (request.getParentId() != null) {
            if (request.getParentId().equals(categoryId)) {
                throw new ApiException(ErrorCode.INVALID_INPUT, "Category cannot be its own parent");
            }
            
            Category newParent = categoryRepository.findByIdAndUserId(request.getParentId(), userId)
                    .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND, "Parent category not found"));
            
            if (newParent.getCategoryType() != category.getCategoryType()) {
                throw new ApiException(ErrorCode.INVALID_INPUT, "Subcategory must have same type as parent");
            }
            
            category.setParent(newParent);
        }
        
        category = categoryRepository.save(category);
        
        logger.info("Category updated: {} for user: {}", categoryId, userId);
        
        return mapToResponse(category, false);
    }
    
    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        Category category = categoryRepository.findUserOwnedCategory(categoryId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.CATEGORY_NOT_FOUND));
        
        if (category.getIsSystem()) {
            throw new ApiException(ErrorCode.OPERATION_NOT_ALLOWED, "System categories cannot be deleted");
        }
        
        // Soft delete
        category.setIsActive(false);
        categoryRepository.save(category);
        
        logger.info("Category soft deleted: {} for user: {}", categoryId, userId);
    }
    
    private CategoryResponse mapToResponse(Category category, boolean includeSubcategories) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setCategoryName(category.getCategoryName());
        response.setCategoryType(category.getCategoryType());
        response.setColorCode(category.getColorCode());
        response.setIcon(category.getIcon());
        response.setIsSystem(category.getIsSystem());
        response.setIsActive(category.getIsActive());
        response.setDisplayOrder(category.getDisplayOrder());
        response.setCreatedAt(category.getCreatedAt());
        
        if (category.getParent() != null) {
            response.setParentId(category.getParent().getId());
            response.setParentName(category.getParent().getCategoryName());
        }
        
        if (includeSubcategories && category.getSubcategories() != null && !category.getSubcategories().isEmpty()) {
            response.setSubcategories(
                    category.getSubcategories().stream()
                            .filter(Category::getIsActive)
                            .map(c -> mapToResponse(c, true))
                            .collect(Collectors.toList())
            );
        }
        
        return response;
    }
}
