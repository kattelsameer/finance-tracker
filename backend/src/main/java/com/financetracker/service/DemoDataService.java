package com.financetracker.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Service for managing demo data in demo mode.
 * Automatically resets demo data daily at configured time.
 * Only active when app.demo.enabled=true.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
public class DemoDataService {

    private final JdbcTemplate jdbcTemplate;
    private final ResourceLoader resourceLoader;

    /**
     * Initialize demo data on application startup if not already present.
     */
    @PostConstruct
    @Transactional
    public void initializeDemoData() {
        log.info("Checking demo data initialization...");
        
        try {
            Long demoUserId = getDemoUserId();
            
            if (demoUserId == null) {
                log.info("Demo user not found. Running initial demo data setup...");
                executeDemoMigrations();
                log.info("Initial demo data setup completed successfully");
            } else {
                log.info("Demo user already exists. Skipping initial data setup.");
            }
        } catch (Exception e) {
            log.error("Failed to initialize demo data", e);
        }
    }

    /**
     * Reset demo data on a schedule (default: daily at 2 AM UTC).
     * Schedule is configurable via app.demo.reset-schedule property.
     */
    @Scheduled(cron = "${app.demo.reset-schedule:0 0 2 * * *}")
    @Transactional
    public void resetDemoData() {
        log.info("Starting demo data reset...");
        
        try {
            // 1. Get demo user ID
            Long demoUserId = getDemoUserId();
            
            if (demoUserId == null) {
                log.warn("Demo user not found. Running initial demo data setup...");
                executeDemoMigrations();
                log.info("Initial demo data setup completed successfully");
                return;
            }
            
            // 2. Delete all demo user data
            deleteDemoUserData(demoUserId);
            
            // 3. Re-seed demo data
            executeDemoMigrations();
            
            log.info("Demo data reset completed successfully");
        } catch (Exception e) {
            log.error("Failed to reset demo data", e);
        }
    }

    /**
     * Get the demo user ID from the database.
     * @return Demo user ID or null if not found
     */
    private Long getDemoUserId() {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT id FROM users WHERE email = 'demo@example.com'",
                Long.class
            );
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Delete all data associated with the demo user.
     * Executes deletions in correct order due to foreign key constraints.
     */
    private void deleteDemoUserData(Long userId) {
        log.info("Deleting existing demo user data for userId: {}", userId);
        
        // Delete in correct order due to foreign key constraints
        jdbcTemplate.update("DELETE FROM transaction_tags WHERE transaction_id IN (SELECT id FROM transactions WHERE user_id = ?)", userId);
        jdbcTemplate.update("DELETE FROM notifications WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM notification_preferences WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM saved_searches WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM tags WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM recurring_transactions WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM budgets WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM transactions WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM accounts WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM categories WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM audit_log WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM revoked_tokens WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", userId);
        
        log.info("Successfully deleted existing demo user data");
    }

    /**
     * Execute all demo data migration SQL files.
     * Reads V100-V106 SQL files and executes them.
     */
    private void executeDemoMigrations() throws Exception {
        log.info("Executing demo data migrations...");
        
        // List of demo migration files in order
        String[] migrationFiles = {
            "classpath:db/demo/V100__seed_demo_user_and_accounts.sql",
            "classpath:db/demo/V101__seed_demo_categories_and_tags.sql",
            "classpath:db/demo/V102__seed_demo_income_transactions.sql",
            "classpath:db/demo/V103__seed_demo_expenses_part1.sql",
            "classpath:db/demo/V104__seed_demo_expenses_part2.sql",
            "classpath:db/demo/V105__seed_demo_transfers_and_investments.sql",
            "classpath:db/demo/V106__seed_demo_budgets_and_recurring.sql",
            "classpath:db/demo/V107__seed_demo_2026_transactions.sql"
        };
        
        for (String migrationFile : migrationFiles) {
            executeSqlFile(migrationFile);
        }
        
        log.info("Successfully executed all demo data migrations");
    }

    /**
     * Execute a single SQL file.
     * Removes comment lines, then splits on semicolon and executes each statement.
     */
    @SuppressWarnings("null")
    private void executeSqlFile(String filePath) throws Exception {
        log.info("Executing SQL file: {}", filePath);
        
        Resource resource = resourceLoader.getResource(filePath);
        
        String sql;
        try (BufferedReader reader = new BufferedReader(
            new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            sql = reader.lines()
                // Remove comment lines and empty lines BEFORE joining
                .filter(line -> !line.trim().startsWith("--"))
                .filter(line -> !line.trim().isEmpty())
                .collect(Collectors.joining("\n"));
        }
        
        // Split by semicolon and execute each statement
        int statementCount = 0;
        for (String statement : sql.split(";")) {
            statement = statement.trim();
            if (statement.isEmpty() || statement.startsWith("/*")) {
                continue;
            }
            
            try {
                log.info("Executing statement: {}", statement.substring(0, Math.min(100, statement.length())));
                jdbcTemplate.execute(statement);
                statementCount++;
            } catch (Exception e) {
                log.error("Error executing statement: {}", statement, e);
                throw e; // Rethrow to fail fast
            }
        }
        
        log.info("Successfully executed {} statements from: {}", statementCount, filePath);
    }
}
