package com.financetracker.repository;

import com.financetracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    List<Budget> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Budget> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);
    
    Optional<Budget> findByIdAndUserId(Long id, Long userId);
    
    boolean existsByIdAndUserId(Long id, Long userId);
    
    List<Budget> findByUserIdAndCategoryIdAndIsActiveTrue(Long userId, Long categoryId);
    
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
           "AND b.isActive = true " +
           "AND b.startDate <= :currentDate " +
           "AND (b.endDate IS NULL OR b.endDate >= :currentDate)")
    List<Budget> findActiveBudgetsForPeriod(
            @Param("userId") Long userId,
            @Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
           "AND b.category.id = :categoryId " +
           "AND b.isActive = true " +
           "AND b.startDate <= :currentDate " +
           "AND (b.endDate IS NULL OR b.endDate >= :currentDate)")
    List<Budget> findActiveBudgetsByCategoryForPeriod(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
           "AND b.isActive = true " +
           "AND b.alertEnabled = true " +
           "AND b.startDate <= :currentDate " +
           "AND (b.endDate IS NULL OR b.endDate >= :currentDate)")
    List<Budget> findActiveBudgetsWithAlertsEnabled(
            @Param("userId") Long userId,
            @Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.isActive = true")
    List<Budget> findActiveByUserId(@Param("userId") Long userId);
}
