package com.financetracker.controller;

import com.financetracker.dto.NotificationPreferenceResponse;
import com.financetracker.dto.NotificationResponse;
import com.financetracker.dto.UpdateNotificationPreferenceRequest;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    /**
     * Get paginated notifications for the current user
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(
                userPrincipal.getId(), pageable);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread notifications
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(
                userPrincipal.getId());
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread notification count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long count = notificationService.getUnreadCount(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    /**
     * Mark a notification as read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAsRead(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Mark all notifications as read
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Delete a notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.deleteNotification(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get notification preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> getPreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        NotificationPreferenceResponse preferences = notificationService.getOrCreatePreferences(
                userPrincipal.getId());
        return ResponseEntity.ok(preferences);
    }
    
    /**
     * Update notification preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> updatePreferences(
            @Valid @RequestBody UpdateNotificationPreferenceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        NotificationPreferenceResponse preferences = notificationService.updatePreferences(
                userPrincipal.getId(), request);
        return ResponseEntity.ok(preferences);
    }
    
    /**
     * Clean up old notifications
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<Void> cleanupOldNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        notificationService.cleanupOldNotifications(userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
