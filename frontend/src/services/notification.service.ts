import apiClient from '../lib/api-client';
import {
  Notification,
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
  PaginatedResponse,
} from '../types/api';

export const notificationService = {
  /**
   * Get paginated notifications
   */
  async getNotifications(
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      '/api/notifications',
      { params: { page, size } }
    );
    return response.data;
  },

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>(
      '/api/notifications/unread'
    );
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      '/api/notifications/unread/count'
    );
    return response.data.count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`/api/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/api/notifications/read-all');
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/api/notifications/${id}`);
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreference> {
    const response = await apiClient.get<NotificationPreference>(
      '/api/notifications/preferences'
    );
    return response.data;
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    request: UpdateNotificationPreferenceRequest
  ): Promise<NotificationPreference> {
    const response = await apiClient.put<NotificationPreference>(
      '/api/notifications/preferences',
      request
    );
    return response.data;
  },

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(): Promise<void> {
    await apiClient.delete('/api/notifications/cleanup');
  },
};
