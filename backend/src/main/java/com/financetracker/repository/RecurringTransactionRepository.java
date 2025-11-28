package com.financetracker.repository;

import com.financetracker.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    
    List<RecurringTransaction> findByUserIdOrderByNextOccurrenceAsc(Long userId);
    
    List<RecurringTransaction> findByUserIdAndIsActiveTrueOrderByNextOccurrenceAsc(Long userId);
    
    Optional<RecurringTransaction> findByIdAndUserId(Long id, Long userId);
    
    boolean existsByIdAndUserId(Long id, Long userId);
    
    @Query("SELECT rt FROM RecurringTransaction rt WHERE rt.user.id = :userId " +
           "AND rt.isActive = true " +
           "AND rt.autoPost = true " +
           "AND rt.nextOccurrence <= :date")
    List<RecurringTransaction> findDueRecurringTransactions(
            @Param("userId") Long userId,
            @Param("date") LocalDate date);
    
    @Query("SELECT rt FROM RecurringTransaction rt WHERE rt.isActive = true " +
           "AND rt.autoPost = true " +
           "AND rt.nextOccurrence <= :date")
    List<RecurringTransaction> findAllDueRecurringTransactions(@Param("date") LocalDate date);
    
    List<RecurringTransaction> findByUserIdAndAccountId(Long userId, Long accountId);
    
    List<RecurringTransaction> findByUserIdAndCategoryId(Long userId, Long categoryId);
    
    @Query("SELECT COUNT(rt) FROM RecurringTransaction rt " +
           "WHERE rt.user.id = :userId AND rt.isActive = true")
    long countActiveByUserId(@Param("userId") Long userId);
}
