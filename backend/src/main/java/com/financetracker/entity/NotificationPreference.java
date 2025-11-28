package com.financetracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "budget_alerts_enabled")
    @Builder.Default
    private Boolean budgetAlertsEnabled = true;
    
    @Column(name = "low_balance_alerts_enabled")
    @Builder.Default
    private Boolean lowBalanceAlertsEnabled = true;
    
    @Column(name = "recurring_reminders_enabled")
    @Builder.Default
    private Boolean recurringRemindersEnabled = true;
    
    @Column(name = "large_transaction_alerts_enabled")
    @Builder.Default
    private Boolean largeTransactionAlertsEnabled = true;
    
    @Column(name = "unusual_spending_alerts_enabled")
    @Builder.Default
    private Boolean unusualSpendingAlertsEnabled = false;
    
    @Column(name = "monthly_summary_enabled")
    @Builder.Default
    private Boolean monthlySummaryEnabled = true;
    
    @Column(name = "email_notifications_enabled")
    @Builder.Default
    private Boolean emailNotificationsEnabled = true;
    
    @Column(name = "in_app_notifications_enabled")
    @Builder.Default
    private Boolean inAppNotificationsEnabled = true;
    
    @Column(name = "low_balance_threshold", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal lowBalanceThreshold = new BigDecimal("100.00");
    
    @Column(name = "large_transaction_threshold", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal largeTransactionThreshold = new BigDecimal("1000.00");
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
