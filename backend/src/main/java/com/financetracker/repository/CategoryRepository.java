package com.financetracker.repository;

import com.financetracker.entity.Category;
import com.financetracker.entity.Category.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find all categories for a user (including system categories)
    @Query("SELECT c FROM Category c WHERE (c.user.id = :userId OR c.user IS NULL) AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Category> findAllActiveByUserId(@Param("userId") Long userId);
    
    // Find all top-level categories (no parent)
    @Query("SELECT c FROM Category c WHERE (c.user.id = :userId OR c.user IS NULL) AND c.parent IS NULL AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Category> findTopLevelByUserId(@Param("userId") Long userId);
    
    // Find categories by type
    @Query("SELECT c FROM Category c WHERE (c.user.id = :userId OR c.user IS NULL) AND c.categoryType = :type AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Category> findByUserIdAndType(@Param("userId") Long userId, @Param("type") CategoryType type);
    
    // Find top-level categories by type
    @Query("SELECT c FROM Category c WHERE (c.user.id = :userId OR c.user IS NULL) AND c.categoryType = :type AND c.parent IS NULL AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Category> findTopLevelByUserIdAndType(@Param("userId") Long userId, @Param("type") CategoryType type);
    
    // Find subcategories of a parent
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Category> findSubcategoriesByParentId(@Param("parentId") Long parentId);
    
    // Find a category by ID that belongs to user or is a system category
    @Query("SELECT c FROM Category c WHERE c.id = :id AND (c.user.id = :userId OR c.user IS NULL)")
    Optional<Category> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
    
    // Find user-owned category (not system)
    @Query("SELECT c FROM Category c WHERE c.id = :id AND c.user.id = :userId")
    Optional<Category> findUserOwnedCategory(@Param("id") Long id, @Param("userId") Long userId);
    
    // Check if a category name exists for user under same parent
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE (c.user.id = :userId OR c.user IS NULL) " +
           "AND c.categoryName = :name AND c.categoryType = :type " +
           "AND (:parentId IS NULL AND c.parent IS NULL OR c.parent.id = :parentId)")
    boolean existsByNameAndTypeAndParent(@Param("userId") Long userId, 
                                          @Param("name") String name, 
                                          @Param("type") CategoryType type,
                                          @Param("parentId") Long parentId);
}
