export type NotificationType = 'BUDGET_ALERT' | 'BUDGET_EXCEEDED' | 'RECURRING_TRANSACTION_DUE' | 'LOW_BALANCE_WARNING' | 'LARGE_TRANSACTION' | 'UNUSUAL_SPENDING' | 'MONTHLY_SUMMARY' | 'ACCOUNT_INACTIVE' | 'CURRENCY_RATE_CHANGE';
// Based on backend Notification.Priority enum
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Notification {
  id: number;
  userId?: number;
  /** Matches backend field name `notificationType` */
  notificationType: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isSent: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  sentAt?: string;
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
