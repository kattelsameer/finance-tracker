package com.financetracker.repository;

import com.financetracker.entity.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    
    boolean existsByTokenHash(String tokenHash);
    
    @Modifying
    @Query("DELETE FROM RevokedToken rt WHERE rt.expiresAt < :now")
    int deleteExpiredTokens(LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM RevokedToken rt WHERE rt.userId = :userId")
    int deleteByUserId(Long userId);
}
