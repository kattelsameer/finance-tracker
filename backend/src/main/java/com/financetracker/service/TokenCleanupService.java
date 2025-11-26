package com.financetracker.service;

import com.financetracker.repository.RevokedTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TokenCleanupService {
    
    private static final Logger logger = LoggerFactory.getLogger(TokenCleanupService.class);
    
    private final RevokedTokenRepository revokedTokenRepository;
    
    public TokenCleanupService(RevokedTokenRepository revokedTokenRepository) {
        this.revokedTokenRepository = revokedTokenRepository;
    }
    
    /**
     * Cleanup expired revoked tokens every hour.
     * Expired tokens no longer need to be tracked since they're invalid anyway.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCount = revokedTokenRepository.deleteExpiredTokens(now);
        
        if (deletedCount > 0) {
            logger.info("Cleaned up {} expired revoked tokens", deletedCount);
        }
    }
}
