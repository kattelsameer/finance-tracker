package com.financetracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 50)
    private NotificationType notificationType;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private Priority priority;
    
    @Column(name = "is_read")
    private Boolean isRead;
    
    @Column(name = "is_sent")
    private Boolean isSent;
    
    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType; // e.g., "TRANSACTION", "BUDGET", "RECURRING_TRANSACTION"
    
    @Column(name = "related_entity_id")
    private Long relatedEntityId;
    
    @Column(name = "action_url", length = 500)
    private String actionUrl;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "read_at")
    private Instant readAt;
    
    @Column(name = "sent_at")
    private Instant sentAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (isRead == null) {
            isRead = false;
        }
        if (isSent == null) {
            isSent = false;
        }
        if (priority == null) {
            priority = Priority.NORMAL;
        }
    }
    
    public enum NotificationType {
        BUDGET_ALERT,
        BUDGET_EXCEEDED,
        RECURRING_TRANSACTION_DUE,
        LOW_BALANCE_WARNING,
        LARGE_TRANSACTION,
        UNUSUAL_SPENDING,
        MONTHLY_SUMMARY,
        ACCOUNT_INACTIVE,
        CURRENCY_RATE_CHANGE
    }
    
    public enum Priority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
}
