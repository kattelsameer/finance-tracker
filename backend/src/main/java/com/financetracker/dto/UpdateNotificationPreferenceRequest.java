package com.financetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateNotificationPreferenceRequest {
    
    private Boolean budgetAlertsEnabled;
    private Boolean lowBalanceAlertsEnabled;
    private Boolean recurringRemindersEnabled;
    private Boolean largeTransactionAlertsEnabled;
    private Boolean unusualSpendingAlertsEnabled;
    private Boolean monthlySummaryEnabled;
    private Boolean emailNotificationsEnabled;
    private Boolean inAppNotificationsEnabled;
    
    @DecimalMin(value = "0.0", message = "Low balance threshold must be positive")
    private BigDecimal lowBalanceThreshold;
    
    @DecimalMin(value = "0.0", message = "Large transaction threshold must be positive")
    private BigDecimal largeTransactionThreshold;
}
