package com.financetracker.repository;

import com.financetracker.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    List<Account> findByUserIdOrderByAccountNameAsc(Long userId);
    
    List<Account> findByUserIdAndIsActiveOrderByAccountNameAsc(Long userId, Boolean isActive);
    
    Page<Account> findByUserId(Long userId, Pageable pageable);
    
    Optional<Account> findByIdAndUserId(Long id, Long userId);
    
    boolean existsByIdAndUserId(Long id, Long userId);
    
    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.includeInNetWorth = true AND a.isActive = true")
    List<Account> findAccountsForNetWorth(@Param("userId") Long userId);
    
    @Query("SELECT COALESCE(SUM(CASE WHEN at.isLiability = false THEN a.currentBalance ELSE 0 END), 0) - " +
           "COALESCE(SUM(CASE WHEN at.isLiability = true THEN a.currentBalance ELSE 0 END), 0) " +
           "FROM Account a JOIN a.accountType at " +
           "WHERE a.user.id = :userId AND a.includeInNetWorth = true AND a.isActive = true")
    BigDecimal calculateNetWorth(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(a) FROM Account a WHERE a.user.id = :userId AND a.isActive = true")
    long countActiveAccountsByUserId(@Param("userId") Long userId);
    
    List<Account> findByUserIdAndAccountTypeId(Long userId, Integer accountTypeId);
    
    @Query("SELECT COALESCE(SUM(a.currentBalance), 0) FROM Account a WHERE a.user.id = :userId AND a.isActive = true")
    BigDecimal sumCurrentBalanceByUserId(@Param("userId") Long userId);
    
    long countByUserIdAndIsActive(Long userId, Boolean isActive);
}
