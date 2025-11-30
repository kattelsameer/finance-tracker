export type NotificationType = 'BUDGET_ALERT' | 'RECURRING_TRANSACTION' | 'SYSTEM';
// Based on backend Notification.Priority enum
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isSent: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreference {
  id: number;
  budgetAlertsEnabled: boolean;
  lowBalanceAlertsEnabled: boolean;
  recurringRemindersEnabled: boolean;
  largeTransactionAlertsEnabled: boolean;
  unusualSpendingAlertsEnabled: boolean;
  monthlySummaryEnabled: boolean;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  lowBalanceThreshold: number;
  largeTransactionThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferenceRequest {
  budgetAlertsEnabled?: boolean;
  lowBalanceAlertsEnabled?: boolean;
  recurringRemindersEnabled?: boolean;
  largeTransactionAlertsEnabled?: boolean;
  unusualSpendingAlertsEnabled?: boolean;
  monthlySummaryEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  inAppNotificationsEnabled?: boolean;
  lowBalanceThreshold?: number;
  largeTransactionThreshold?: number;
}
