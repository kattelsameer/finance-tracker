package com.financetracker.service;

import com.financetracker.dto.NotificationPreferenceResponse;
import com.financetracker.dto.NotificationResponse;
import com.financetracker.dto.UpdateNotificationPreferenceRequest;
import com.financetracker.entity.Notification;
import com.financetracker.entity.Notification.NotificationType;
import com.financetracker.entity.Notification.Priority;
import com.financetracker.entity.NotificationPreference;
import com.financetracker.entity.User;
import com.financetracker.exception.ApiException;
import com.financetracker.exception.ErrorCode;
import com.financetracker.repository.NotificationPreferenceRepository;
import com.financetracker.repository.NotificationRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    
    /**
     * Get paginated notifications for a user
     */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(this::mapToResponse);
    }
    
    /**
     * Get unread notifications for a user
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get unread notification count
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    /**
     * Mark a notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId, Instant.now());
        if (updated == 0) {
            throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Notification not found");
        }
    }
    
    /**
     * Mark all notifications as read
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId, Instant.now());
    }
    
    /**
     * Delete a notification
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Notification not found"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Notification not found");
        }
        
        notificationRepository.delete(notification);
    }
    
    /**
     * Create a notification
     */
    @Transactional
    public NotificationResponse createNotification(
            Long userId,
            NotificationType type,
            String title,
            String message,
            Priority priority,
            String relatedEntityType,
            Long relatedEntityId,
            String actionUrl) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
        
        // Check user preferences
        NotificationPreference pref = getOrCreatePreference(userId);
        if (!shouldSendNotification(pref, type)) {
            logger.debug("Notification type {} disabled for user {}", type, userId);
            return null;
        }
        
        Notification notification = Notification.builder()
                .user(user)
                .notificationType(type)
                .title(title)
                .message(message)
                .priority(priority)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .actionUrl(actionUrl)
                .build();
        
        notification = notificationRepository.save(notification);
        logger.info("Created notification: {} for user: {}", type, userId);
        
        return mapToResponse(notification);
    }
    
    /**
     * Get or create notification preferences for a user
     */
    @Transactional
    public NotificationPreferenceResponse getOrCreatePreferences(Long userId) {
        NotificationPreference preference = getOrCreatePreference(userId);
        return mapPreferenceToResponse(preference);
    }
    
    /**
     * Update notification preferences
     */
    @Transactional
    public NotificationPreferenceResponse updatePreferences(Long userId, UpdateNotificationPreferenceRequest request) {
        NotificationPreference preference = getOrCreatePreference(userId);
        
        if (request.getBudgetAlertsEnabled() != null) {
            preference.setBudgetAlertsEnabled(request.getBudgetAlertsEnabled());
        }
        if (request.getLowBalanceAlertsEnabled() != null) {
            preference.setLowBalanceAlertsEnabled(request.getLowBalanceAlertsEnabled());
        }
        if (request.getRecurringRemindersEnabled() != null) {
            preference.setRecurringRemindersEnabled(request.getRecurringRemindersEnabled());
        }
        if (request.getLargeTransactionAlertsEnabled() != null) {
            preference.setLargeTransactionAlertsEnabled(request.getLargeTransactionAlertsEnabled());
        }
        if (request.getUnusualSpendingAlertsEnabled() != null) {
            preference.setUnusualSpendingAlertsEnabled(request.getUnusualSpendingAlertsEnabled());
        }
        if (request.getMonthlySummaryEnabled() != null) {
            preference.setMonthlySummaryEnabled(request.getMonthlySummaryEnabled());
        }
        if (request.getEmailNotificationsEnabled() != null) {
            preference.setEmailNotificationsEnabled(request.getEmailNotificationsEnabled());
        }
        if (request.getInAppNotificationsEnabled() != null) {
            preference.setInAppNotificationsEnabled(request.getInAppNotificationsEnabled());
        }
        if (request.getLowBalanceThreshold() != null) {
            preference.setLowBalanceThreshold(request.getLowBalanceThreshold());
        }
        if (request.getLargeTransactionThreshold() != null) {
            preference.setLargeTransactionThreshold(request.getLargeTransactionThreshold());
        }
        
        preference = preferenceRepository.save(preference);
        return mapPreferenceToResponse(preference);
    }
    
    /**
     * Clean up old read notifications (older than 30 days)
     */
    @Transactional
    public void cleanupOldNotifications(Long userId) {
        Instant cutoffTime = Instant.now().minus(30, ChronoUnit.DAYS);
        notificationRepository.deleteByUserIdAndCreatedAtBefore(userId, cutoffTime);
    }
    
    private NotificationPreference getOrCreatePreference(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
                    
                    NotificationPreference pref = NotificationPreference.builder()
                            .user(user)
                            .build();
                    return preferenceRepository.save(pref);
                });
    }
    
    private boolean shouldSendNotification(NotificationPreference pref, NotificationType type) {
        if (!pref.getInAppNotificationsEnabled()) {
            return false;
        }
        
        return switch (type) {
            case BUDGET_ALERT, BUDGET_EXCEEDED -> pref.getBudgetAlertsEnabled();
            case RECURRING_TRANSACTION_DUE -> pref.getRecurringRemindersEnabled();
            case LOW_BALANCE_WARNING -> pref.getLowBalanceAlertsEnabled();
            case LARGE_TRANSACTION -> pref.getLargeTransactionAlertsEnabled();
            case UNUSUAL_SPENDING -> pref.getUnusualSpendingAlertsEnabled();
            case MONTHLY_SUMMARY -> pref.getMonthlySummaryEnabled();
            default -> true;
        };
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .notificationType(notification.getNotificationType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .priority(notification.getPriority())
                .isRead(notification.getIsRead())
                .isSent(notification.getIsSent())
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .actionUrl(notification.getActionUrl())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .sentAt(notification.getSentAt())
                .build();
    }
    
    private NotificationPreferenceResponse mapPreferenceToResponse(NotificationPreference pref) {
        return NotificationPreferenceResponse.builder()
                .id(pref.getId())
                .budgetAlertsEnabled(pref.getBudgetAlertsEnabled())
                .lowBalanceAlertsEnabled(pref.getLowBalanceAlertsEnabled())
                .recurringRemindersEnabled(pref.getRecurringRemindersEnabled())
                .largeTransactionAlertsEnabled(pref.getLargeTransactionAlertsEnabled())
                .unusualSpendingAlertsEnabled(pref.getUnusualSpendingAlertsEnabled())
                .monthlySummaryEnabled(pref.getMonthlySummaryEnabled())
                .emailNotificationsEnabled(pref.getEmailNotificationsEnabled())
                .inAppNotificationsEnabled(pref.getInAppNotificationsEnabled())
                .lowBalanceThreshold(pref.getLowBalanceThreshold())
                .largeTransactionThreshold(pref.getLargeTransactionThreshold())
                .createdAt(pref.getCreatedAt())
                .updatedAt(pref.getUpdatedAt())
                .build();
    }
}
