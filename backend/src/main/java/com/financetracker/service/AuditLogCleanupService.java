package com.financetracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogCleanupService.class);

    private final JdbcTemplate jdbcTemplate;

    public AuditLogCleanupService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Scheduled(cron = "0 30 2 * * *")
    @Transactional
    public void purgeOldAuditLogs() {
        int deleted = jdbcTemplate.update(
            "DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 365 DAY)"
        );
        if (deleted > 0) {
            logger.info("Purged {} audit log entries older than 1 year", deleted);
        }
    }
}
