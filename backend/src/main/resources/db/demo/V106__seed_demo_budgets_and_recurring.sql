-- =====================================================
-- Demo Budgets, Recurring, Notifications - Finance Tracker
-- Budgets, recurring transactions, notifications, saved searches
-- =====================================================

-- Retrieve demo user and account IDs
SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@example.com');
SET @checking_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Main Checking');

-- Get category IDs
SET @food_cat = (SELECT id FROM categories WHERE category_name = 'Food & Dining' AND is_system = TRUE LIMIT 1);
SET @transport_cat = (SELECT id FROM categories WHERE category_name = 'Transportation' AND is_system = TRUE LIMIT 1);
SET @groceries_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Groceries');
SET @gas_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Gas & Fuel');
SET @streaming_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Streaming Services');
SET @utilities_cat = (SELECT id FROM categories WHERE category_name = 'Utilities' AND is_system = TRUE LIMIT 1);
SET @housing_cat = (SELECT id FROM categories WHERE category_name = 'Housing' AND is_system = TRUE LIMIT 1);
SET @insurance_cat = (SELECT id FROM categories WHERE category_name = 'Insurance' AND is_system = TRUE LIMIT 1);
SET @entertainment_cat = (SELECT id FROM categories WHERE category_name = 'Entertainment' AND is_system = TRUE LIMIT 1);
SET @shopping_cat = (SELECT id FROM categories WHERE category_name = 'Shopping' AND is_system = TRUE LIMIT 1);

-- BUDGETS (10 budgets for different spending categories)
INSERT INTO budgets (user_id, category_id, budget_name, amount, period_type, start_date, end_date, alert_threshold, is_active, created_at, updated_at) VALUES
-- Monthly Budgets
(@demo_user_id, @food_cat, 'Monthly Food Budget', 600.00, 'MONTHLY', DATE_FORMAT(NOW(), '%Y-%m-01'), LAST_DAY(NOW()), 80, TRUE, NOW(), NOW()),
(@demo_user_id, @transport_cat, 'Monthly Transportation', 400.00, 'MONTHLY', DATE_FORMAT(NOW(), '%Y-%m-01'), LAST_DAY(NOW()), 75, TRUE, NOW(), NOW()),
(@demo_user_id, @entertainment_cat, 'Monthly Entertainment', 150.00, 'MONTHLY', DATE_FORMAT(NOW(), '%Y-%m-01'), LAST_DAY(NOW()), 85, TRUE, NOW(), NOW()),
(@demo_user_id, @shopping_cat, 'Monthly Shopping', 300.00, 'MONTHLY', DATE_FORMAT(NOW(), '%Y-%m-01'), LAST_DAY(NOW()), 80, TRUE, NOW(), NOW()),

-- Quarterly Budgets
(@demo_user_id, @food_cat, 'Quarterly Dining Out', 500.00, 'QUARTERLY', DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01'), DATE_ADD(DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01'), INTERVAL 3 MONTH), 70, TRUE, NOW(), NOW()),

-- Annual Budgets
(@demo_user_id, @insurance_cat, 'Annual Insurance Budget', 3500.00, 'YEARLY', DATE_FORMAT(NOW(), '%Y-01-01'), DATE_FORMAT(NOW(), '%Y-12-31'), 90, TRUE, NOW(), NOW());

-- RECURRING TRANSACTIONS (Active recurring expenses and income)
INSERT INTO recurring_transactions (user_id, account_id, category_id, transaction_type, amount, frequency, description, start_date, next_occurrence, is_active, created_at, updated_at) VALUES
-- Monthly Bills
(@demo_user_id, @checking_id, @housing_cat, 'EXPENSE', 1500.00, 'MONTHLY', 'Monthly Rent Payment', DATE_SUB(NOW(), INTERVAL 6 MONTH), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-01'), TRUE, NOW(), NOW()),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 110.00, 'MONTHLY', 'Electric Bill', DATE_SUB(NOW(), INTERVAL 6 MONTH), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-15'), TRUE, NOW(), NOW()),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 79.99, 'MONTHLY', 'Internet Service', DATE_SUB(NOW(), INTERVAL 6 MONTH), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-20'), TRUE, NOW(), NOW()),
(@demo_user_id, @checking_id, @insurance_cat, 'EXPENSE', 285.00, 'MONTHLY', 'Health Insurance Premium', DATE_SUB(NOW(), INTERVAL 6 MONTH), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-01'), TRUE, NOW(), NOW()),

-- Subscription Services
(@demo_user_id, @checking_id, @streaming_cat, 'EXPENSE', 15.99, 'MONTHLY', 'Netflix Subscription', DATE_SUB(NOW(), INTERVAL 6 MONTH), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-12'), TRUE, NOW(), NOW()),
(@demo_user_id, @checking_id, @streaming_cat, 'EXPENSE', 10.99, 'MONTHLY', 'Spotify Premium', DATE_SUB(NOW(), INTERVAL 6 MONTH), DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-18'), TRUE, NOW(), NOW()),

-- Bi-weekly Income
(@demo_user_id, @checking_id, (SELECT id FROM categories WHERE category_name = 'Salary' AND is_system = TRUE LIMIT 1), 'INCOME', 3200.00, 'BIWEEKLY', 'Salary - Direct Deposit', DATE_SUB(NOW(), INTERVAL 6 MONTH), DATE_ADD(NOW(), INTERVAL 2 DAY), TRUE, NOW(), NOW());

-- NOTIFICATIONS (Mix of read and unread notifications)
INSERT INTO notifications (user_id, notification_type, title, message, priority, is_read, sent_at, created_at) VALUES
-- Unread Notifications
(@demo_user_id, 'BUDGET_ALERT', 'Food Budget Alert', 'You have spent 87% of your monthly food budget. You have $78 remaining.', 'NORMAL', FALSE, NOW(), NOW()),
(@demo_user_id, 'RECURRING_TRANSACTION_DUE', 'Upcoming Bill Reminder', 'Electric bill of $110.00 is due in 3 days.', 'NORMAL', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@demo_user_id, 'BUDGET_ALERT', 'Transportation Budget Warning', 'You have exceeded your monthly transportation budget by $45.50.', 'HIGH', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Read Notifications
(@demo_user_id, 'RECURRING_TRANSACTION_DUE', 'Payment Reminder', 'Rent payment of $1500.00 is due tomorrow.', 'HIGH', TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(@demo_user_id, 'BUDGET_ALERT', 'Shopping Budget Alert', 'You have spent 75% of your monthly shopping budget.', 'NORMAL', TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(@demo_user_id, 'MONTHLY_SUMMARY', 'Welcome to Finance Tracker', 'Your demo account has been set up with realistic financial data. Explore all features!', 'LOW', TRUE, DATE_SUB(NOW(), INTERVAL 180 DAY), DATE_SUB(NOW(), INTERVAL 180 DAY)),
(@demo_user_id, 'MONTHLY_SUMMARY', 'February Financial Summary', 'Total Income: $6400.00 | Total Expenses: $4867.32 | Net Savings: $1532.68', 'NORMAL', TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY));

-- NOTIFICATION PREFERENCES
INSERT INTO notification_preferences (
    user_id, 
    budget_alerts_enabled, 
    low_balance_alerts_enabled, 
    recurring_reminders_enabled, 
    large_transaction_alerts_enabled, 
    unusual_spending_alerts_enabled, 
    monthly_summary_enabled, 
    email_notifications_enabled, 
    in_app_notifications_enabled, 
    low_balance_threshold, 
    large_transaction_threshold,
    created_at, 
    updated_at
) VALUES (
    @demo_user_id, 
    TRUE, 
    TRUE, 
    TRUE, 
    TRUE, 
    FALSE, 
    TRUE, 
    TRUE, 
    TRUE, 
    100.00, 
    1000.00,
    NOW(), 
    NOW()
);

-- SAVED SEARCHES (Common search patterns for power users)
INSERT INTO saved_searches (user_id, search_name, search_criteria, is_default, created_at, updated_at) VALUES
(@demo_user_id, 'Large Expenses (>$500)', '{"minAmount": 500, "type": "EXPENSE"}', FALSE, NOW(), NOW()),
(@demo_user_id, 'Last Month Income', '{"type": "INCOME", "dateRange": "last_month"}', FALSE, NOW(), NOW()),
(@demo_user_id, 'Food & Dining Expenses', CONCAT('{"categoryId": ', @food_cat, ', "type": "EXPENSE"}'), FALSE, NOW(), NOW()),
(@demo_user_id, 'Recent Transfers', '{"type": "TRANSFER", "dateRange": "last_30_days"}', FALSE, NOW(), NOW()),
(@demo_user_id, 'Credit Card Transactions', CONCAT('{"accountId": ', (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Rewards Credit Card'), '}'), FALSE, NOW(), NOW());

-- TAG ASSOCIATIONS (Link some transactions to tags)
SET @tax_tag = (SELECT id FROM tags WHERE user_id = @demo_user_id AND tag_name = 'Tax Deductible');
SET @work_tag = (SELECT id FROM tags WHERE user_id = @demo_user_id AND tag_name = 'Work Related');
SET @vacation_tag = (SELECT id FROM tags WHERE user_id = @demo_user_id AND tag_name = 'Vacation');

-- Find some transactions to tag
SET @healthcare_tx = (SELECT id FROM transactions WHERE user_id = @demo_user_id AND description LIKE '%Doctor%' LIMIT 1);
SET @maintenance_tx = (SELECT id FROM transactions WHERE user_id = @demo_user_id AND description LIKE '%Car%' LIMIT 1);
SET @restaurant_tx = (SELECT id FROM transactions WHERE user_id = @demo_user_id AND description LIKE '%Restaurant%' LIMIT 1);

-- Associate tags with transactions (only if transactions exist)
INSERT INTO transaction_tags (transaction_id, tag_id) 
SELECT @healthcare_tx, @tax_tag WHERE @healthcare_tx IS NOT NULL
UNION ALL
SELECT @maintenance_tx, @work_tag WHERE @maintenance_tx IS NOT NULL
UNION ALL
SELECT @restaurant_tx, @vacation_tag WHERE @restaurant_tx IS NOT NULL;
