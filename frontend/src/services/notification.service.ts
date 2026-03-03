import { apiClient } from '../lib/api-client';
import type {
  Notification,
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
  PageResponse,
} from '../types';

export const notificationService = {
  /**
   * Get paginated notifications (matches Spring Data Page format)
   */
  async getNotifications(
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<Notification>> {
    return apiClient.get<PageResponse<Notification>>(
      'notifications',
      { params: { page, size } }
    );
  },

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>(
      'notifications/unread'
    );
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const data = await apiClient.get<{ count: number }>(
      'notifications/unread/count'
    );
    return data.count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('notifications/read-all');
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`notifications/${id}`);
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreference> {
    return apiClient.get<NotificationPreference>(
      'notifications/preferences'
    );
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    request: UpdateNotificationPreferenceRequest
  ): Promise<NotificationPreference> {
    return apiClient.put<NotificationPreference>(
      'notifications/preferences',
      request
    );
  },

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(): Promise<void> {
    await apiClient.delete('notifications/cleanup');
  },
};
