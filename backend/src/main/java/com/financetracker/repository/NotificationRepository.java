package com.financetracker.repository;

import com.financetracker.entity.Notification;
import com.financetracker.entity.Notification.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    Long countByUserIdAndIsReadFalse(Long userId);
    
    List<Notification> findByUserIdAndNotificationTypeOrderByCreatedAtDesc(
            Long userId, NotificationType notificationType);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id AND n.user.id = :userId")
    int markAsRead(Long id, Long userId, Instant readAt);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsRead(Long userId, Instant readAt);
    
    @Query("SELECT n FROM Notification n WHERE n.isSent = false AND n.createdAt < :cutoffTime")
    List<Notification> findUnsentNotificationsBeforeTime(Instant cutoffTime);
    
    void deleteByUserIdAndCreatedAtBefore(Long userId, Instant cutoffTime);

    /**
     * Check if an unread notification of a specific type already exists for a related entity.
     * Used to prevent duplicate budget alert / exceeded notifications.
     */
    boolean existsByUserIdAndRelatedEntityIdAndNotificationTypeAndIsReadFalse(
            Long userId, Long relatedEntityId, NotificationType notificationType);
}
