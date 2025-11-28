package com.financetracker.dto;

import com.financetracker.entity.Notification.NotificationType;
import com.financetracker.entity.Notification.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private NotificationType notificationType;
    private String title;
    private String message;
    private Priority priority;
    private Boolean isRead;
    private Boolean isSent;
    private String relatedEntityType;
    private Long relatedEntityId;
    private String actionUrl;
    private Instant createdAt;
    private Instant readAt;
    private Instant sentAt;
}
