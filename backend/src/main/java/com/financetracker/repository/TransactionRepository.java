package com.financetracker.repository;

import com.financetracker.entity.Transaction;
import com.financetracker.entity.Transaction.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);
    
    boolean existsByIdAndUserId(Long id, Long userId);
    
    Page<Transaction> findByUserId(Long userId, Pageable pageable);
    
    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long userId, LocalDate startDate, LocalDate endDate);
    
    List<Transaction> findByUserIdAndAccountIdOrderByTransactionDateDesc(
            Long userId, Long accountId);
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.account.id = :accountId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByAccountAndDateRange(@Param("userId") Long userId, 
                                                 @Param("accountId") Long accountId,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.transactionType = :type " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByTypeAndDateRange(@Param("userId") Long userId,
                                      @Param("type") TransactionType type,
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.category.id = :categoryId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByCategoryAndDateRange(@Param("userId") Long userId,
                                          @Param("categoryId") Long categoryId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t.category.id, t.category.categoryName, SUM(t.amount) " +
           "FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.transactionType = :type AND t.category IS NOT NULL " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category.id, t.category.categoryName ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumByTypeGroupedByCategory(@Param("userId") Long userId,
                                               @Param("type") TransactionType type,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    long countByUserIdAndDateRange(@Param("userId") Long userId,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);
    
    List<Transaction> findByRecurringTransactionId(Long recurringTransactionId);
    
    List<Transaction> findByUserIdAndCategoryIdAndTransactionDateBetween(
            Long userId, Long categoryId, LocalDate startDate, LocalDate endDate);

    /**
     * FIX (BUG-1): Finds EXPENSE transactions for a category AND any of its direct
     * subcategories within the given date range.
     * The original single-category query returned 0 results when a budget was set on a
     * parent category (e.g. "Food & Dining") but transactions were recorded against
     * child categories (e.g. "Groceries", "Dining Out").
     */
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.transactionType = :transactionType " +
           "AND t.category.id IN (" +
           "  SELECT c.id FROM Category c WHERE c.id = :categoryId OR c.parent.id = :categoryId" +
           ") " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findExpensesByUserIdAndCategoryOrSubcategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("transactionType") TransactionType transactionType);

    List<Transaction> findByUserIdAndTransactionDateBetween(
            Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * FIX (ISSUE-7.4): Aggregates EXPENSE spending for multiple categories (and their subcategories)
     * in a single query, avoiding the N+1 pattern where one query fired per budget.
     * Returns rows of [categoryId, parentCategoryId, totalAmount] for all expense transactions
     * within the date range for the given user.
     */
    @Query("SELECT cat.id, par.id, SUM(t.amount) " +
           "FROM Transaction t " +
           "LEFT JOIN t.category cat " +
           "LEFT JOIN cat.parent par " +
           "WHERE t.user.id = :userId " +
           "AND t.transactionType = :transactionType " +
           "AND cat IS NOT NULL " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY cat.id, par.id")
    List<Object[]> sumExpensesByCategoryAndDateRange(@Param("userId") Long userId,
                                                      @Param("startDate") LocalDate startDate,
                                                      @Param("endDate") LocalDate endDate,
                                                      @Param("transactionType") TransactionType transactionType);

    void deleteAllByUserId(Long userId);
}
