package com.financetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceResponse {
    private Long id;
    private Boolean budgetAlertsEnabled;
    private Boolean lowBalanceAlertsEnabled;
    private Boolean recurringRemindersEnabled;
    private Boolean largeTransactionAlertsEnabled;
    private Boolean unusualSpendingAlertsEnabled;
    private Boolean monthlySummaryEnabled;
    private Boolean emailNotificationsEnabled;
    private Boolean inAppNotificationsEnabled;
    private BigDecimal lowBalanceThreshold;
    private BigDecimal largeTransactionThreshold;
    private Instant createdAt;
    private Instant updatedAt;
}
