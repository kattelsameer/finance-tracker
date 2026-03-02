-- =====================================================
-- Demo Enhanced Notifications - Finance Tracker Demo Mode
-- Adds realistic current-month notifications showing all
-- major notification types with correct enum values
-- =====================================================

SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@example.com');

-- Get related entity IDs for realistic links
SET @food_budget_id         = (SELECT id FROM budgets  WHERE user_id = @demo_user_id AND budget_name = 'Monthly Food Budget'      LIMIT 1);
SET @transport_budget_id    = (SELECT id FROM budgets  WHERE user_id = @demo_user_id AND budget_name = 'Monthly Transportation'   LIMIT 1);
SET @entertainment_budget_id = (SELECT id FROM budgets WHERE user_id = @demo_user_id AND budget_name = 'Monthly Entertainment'   LIMIT 1);
SET @checking_id            = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Main Checking');
SET @savings_id             = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Emergency Savings');
SET @rent_recurring_id      = (SELECT id FROM recurring_transactions WHERE user_id = @demo_user_id AND description = 'Monthly Rent Payment' LIMIT 1);
SET @electric_recurring_id  = (SELECT id FROM recurring_transactions WHERE user_id = @demo_user_id AND description = 'Electric Bill'        LIMIT 1);

-- =====================================================
-- NEW UNREAD NOTIFICATIONS (current month, recent)
-- =====================================================
INSERT INTO notifications
    (user_id, notification_type, title, message, priority, is_read, is_sent,
     related_entity_type, related_entity_id, action_url, sent_at, created_at)
VALUES
-- BUDGET_EXCEEDED — transportation budget crossed 100%
(@demo_user_id, 'BUDGET_EXCEEDED',
 'Transportation Budget Exceeded',
 'Your Monthly Transportation budget of $400.00 has been exceeded. You have spent $445.50 so far this month.',
 'HIGH', FALSE, TRUE,
 'BUDGET', @transport_budget_id, '/budgets',
 DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- LOW_BALANCE_WARNING — checking account running low
(@demo_user_id, 'LOW_BALANCE_WARNING',
 'Low Balance Warning',
 'Your Main Checking account balance is approaching the low-balance threshold. Current balance: $847.52.',
 'HIGH', FALSE, TRUE,
 'ACCOUNT', @checking_id, '/accounts',
 DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- LARGE_TRANSACTION — headphones purchase flagged
(@demo_user_id, 'LARGE_TRANSACTION',
 'Large Transaction Detected',
 'A transaction of $234.50 was recorded at Best Buy on your Rewards Credit Card. If this was not you, please review your account.',
 'NORMAL', FALSE, TRUE,
 'ACCOUNT', @checking_id, '/transactions',
 DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),

-- RECURRING_TRANSACTION_DUE — Netflix coming up
(@demo_user_id, 'RECURRING_TRANSACTION_DUE',
 'Subscription Renewal Tomorrow',
 'Your Netflix Subscription of $15.99 is due tomorrow (auto-debit from Main Checking).',
 'LOW', FALSE, TRUE,
 NULL, NULL, '/recurring-transactions',
 DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- BUDGET_ALERT — entertainment at 83%
(@demo_user_id, 'BUDGET_ALERT',
 'Entertainment Budget at 83%',
 'You have spent $124.50 of your $150.00 Monthly Entertainment budget. Only $25.50 remaining.',
 'NORMAL', FALSE, TRUE,
 'BUDGET', @entertainment_budget_id, '/budgets',
 NOW(), NOW()),

-- UNUSUAL_SPENDING — spike in shopping this week
(@demo_user_id, 'UNUSUAL_SPENDING',
 'Unusual Spending Pattern Detected',
 'Your shopping spending this week ($280.50) is 2.3× your normal weekly average. Review your recent transactions.',
 'NORMAL', FALSE, TRUE,
 NULL, NULL, '/transactions',
 DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- =====================================================
-- RECENT READ NOTIFICATIONS (last 2 weeks)
-- =====================================================
INSERT INTO notifications
    (user_id, notification_type, title, message, priority, is_read, is_sent,
     related_entity_type, related_entity_id, action_url, sent_at, read_at, created_at)
VALUES
-- RECURRING_TRANSACTION_DUE — rent was paid
(@demo_user_id, 'RECURRING_TRANSACTION_DUE',
 'Rent Payment Processed',
 'Your Monthly Rent Payment of $1,500.00 has been scheduled. Check your account for the debit.',
 'HIGH', TRUE, TRUE,
 'RECURRING_TRANSACTION', @rent_recurring_id, '/recurring-transactions',
 DATE_FORMAT(NOW(), '%Y-%m-01'), DATE_FORMAT(NOW(), '%Y-%m-01'), DATE_FORMAT(NOW(), '%Y-%m-01')),

-- BUDGET_ALERT — food budget at 75% (now read)
(@demo_user_id, 'BUDGET_ALERT',
 'Food Budget at 75%',
 'You are 75% through your Monthly Food Budget ($450 of $600 spent). You have $150 remaining for this month.',
 'NORMAL', TRUE, TRUE,
 'BUDGET', @food_budget_id, '/budgets',
 DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- RECURRING_TRANSACTION_DUE — electric bill
(@demo_user_id, 'RECURRING_TRANSACTION_DUE',
 'Electric Bill Auto-Paid',
 'Your Electric Bill of $110.00 was automatically deducted from Main Checking on the 1st.',
 'LOW', TRUE, TRUE,
 'RECURRING_TRANSACTION', @electric_recurring_id, '/recurring-transactions',
 DATE_FORMAT(NOW(), '%Y-%m-01'), DATE_FORMAT(NOW(), '%Y-%m-01'), DATE_FORMAT(NOW(), '%Y-%m-01')),

-- MONTHLY_SUMMARY — previous month wrap-up
(@demo_user_id, 'MONTHLY_SUMMARY',
 'January Financial Summary',
 'Great month! Income: $7,900.00 | Expenses: $5,234.17 | Net Savings: $2,665.83 | Savings Rate: 33.7%',
 'NORMAL', TRUE, TRUE,
 NULL, NULL, '/reports',
 DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-28'), DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-28'),
 DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-28'));
