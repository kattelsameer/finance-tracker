-- =====================================================
-- Demo Expense Transactions Part 1 - Finance Tracker
-- Food, Transportation, and Utilities (60 transactions)
-- =====================================================

-- Retrieve demo user and account IDs
SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@example.com');
SET @checking_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Main Checking');
SET @cash_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Cash Wallet');
SET @credit_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Rewards Credit Card');

-- Get category IDs
SET @coffee_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Coffee Shops');
SET @fastfood_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Fast Food');
SET @restaurants_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Restaurants');
SET @groceries_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Groceries');
SET @gas_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Gas & Fuel');
SET @transit_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Public Transit');
SET @parking_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Parking');
SET @maintenance_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Car Maintenance');
SET @utilities_cat = (SELECT id FROM categories WHERE category_name = 'Utilities' AND is_system = TRUE LIMIT 1);
SET @housing_cat = (SELECT id FROM categories WHERE category_name = 'Housing' AND is_system = TRUE LIMIT 1);

-- FOOD & DINING (25 transactions - coffee, groceries, restaurants)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, status, created_at, updated_at) VALUES
-- Coffee (daily habit - ~3x per week)
(@demo_user_id, @cash_id, @coffee_cat, 'EXPENSE', 5.75, DATE_SUB(NOW(), INTERVAL 175 DAY), 'Starbucks - Morning Coffee', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 175 DAY), DATE_SUB(NOW(), INTERVAL 175 DAY)),
(@demo_user_id, @cash_id, @coffee_cat, 'EXPENSE', 6.20, DATE_SUB(NOW(), INTERVAL 170 DAY), 'Local Café - Latte', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 170 DAY), DATE_SUB(NOW(), INTERVAL 170 DAY)),
(@demo_user_id, @cash_id, @coffee_cat, 'EXPENSE', 5.50, DATE_SUB(NOW(), INTERVAL 160 DAY), 'Starbucks - Morning Coffee', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 160 DAY), DATE_SUB(NOW(), INTERVAL 160 DAY)),
(@demo_user_id, @cash_id, @coffee_cat, 'EXPENSE', 7.00, DATE_SUB(NOW(), INTERVAL 145 DAY), 'Coffee Bean - Cappuccino', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 145 DAY), DATE_SUB(NOW(), INTERVAL 145 DAY)),
(@demo_user_id, @cash_id, @coffee_cat, 'EXPENSE', 5.75, DATE_SUB(NOW(), INTERVAL 130 DAY), 'Starbucks - Morning Coffee', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 130 DAY), DATE_SUB(NOW(), INTERVAL 130 DAY)),
(@demo_user_id, @cash_id, @coffee_cat, 'EXPENSE', 6.50, DATE_SUB(NOW(), INTERVAL 115 DAY), 'Local Café - Americano', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 115 DAY), DATE_SUB(NOW(), INTERVAL 115 DAY)),
(@demo_user_id, @cash_id, @coffee_cat, 'EXPENSE', 5.75, DATE_SUB(NOW(), INTERVAL 90 DAY), 'Starbucks - Morning Coffee', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 90 DAY), DATE_SUB(NOW(), INTERVAL 90 DAY)),
(@demo_user_id, @cash_id, @coffee_cat, 'EXPENSE', 6.00, DATE_SUB(NOW(), INTERVAL 75 DAY), 'Coffee Bean - Latte', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 75 DAY), DATE_SUB(NOW(), INTERVAL 75 DAY)),

-- Groceries (weekly shopping)
(@demo_user_id, @credit_id, @groceries_cat, 'EXPENSE', 127.43, DATE_SUB(NOW(), INTERVAL 172 DAY), 'Whole Foods - Weekly Groceries', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 172 DAY), DATE_SUB(NOW(), INTERVAL 172 DAY)),
(@demo_user_id, @credit_id, @groceries_cat, 'EXPENSE', 143.89, DATE_SUB(NOW(), INTERVAL 158 DAY), 'Trader Joes - Weekly Shopping', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 158 DAY), DATE_SUB(NOW(), INTERVAL 158 DAY)),
(@demo_user_id, @credit_id, @groceries_cat, 'EXPENSE', 134.21, DATE_SUB(NOW(), INTERVAL 144 DAY), 'Safeway - Weekly Groceries', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 144 DAY), DATE_SUB(NOW(), INTERVAL 144 DAY)),
(@demo_user_id, @credit_id, @groceries_cat, 'EXPENSE', 156.78, DATE_SUB(NOW(), INTERVAL 130 DAY), 'Whole Foods - Weekly Groceries', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 130 DAY), DATE_SUB(NOW(), INTERVAL 130 DAY)),
(@demo_user_id, @credit_id, @groceries_cat, 'EXPENSE', 118.45, DATE_SUB(NOW(), INTERVAL 116 DAY), 'Trader Joes - Weekly Shopping', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 116 DAY), DATE_SUB(NOW(), INTERVAL 116 DAY)),
(@demo_user_id, @credit_id, @groceries_cat, 'EXPENSE', 142.67, DATE_SUB(NOW(), INTERVAL 95 DAY), 'Safeway - Weekly Groceries', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 95 DAY), DATE_SUB(NOW(), INTERVAL 95 DAY)),
(@demo_user_id, @credit_id, @groceries_cat, 'EXPENSE', 139.12, DATE_SUB(NOW(), INTERVAL 81 DAY), 'Whole Foods - Weekly Groceries', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 81 DAY), DATE_SUB(NOW(), INTERVAL 81 DAY)),
(@demo_user_id, @credit_id, @groceries_cat, 'EXPENSE', 125.34, DATE_SUB(NOW(), INTERVAL 60 DAY), 'Trader Joes - Weekly Shopping', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 60 DAY)),
(@demo_user_id, @credit_id, @groceries_cat, 'EXPENSE', 147.89, DATE_SUB(NOW(), INTERVAL 45 DAY), 'Safeway - Weekly Groceries', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- Restaurants (occasional dining out)
(@demo_user_id, @credit_id, @restaurants_cat, 'EXPENSE', 67.85, DATE_SUB(NOW(), INTERVAL 165 DAY), 'Italian Restaurant - Dinner', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 165 DAY), DATE_SUB(NOW(), INTERVAL 165 DAY)),
(@demo_user_id, @credit_id, @restaurants_cat, 'EXPENSE', 54.32, DATE_SUB(NOW(), INTERVAL 148 DAY), 'Sushi Bar - Lunch Meeting', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 148 DAY), DATE_SUB(NOW(), INTERVAL 148 DAY)),
(@demo_user_id, @credit_id, @restaurants_cat, 'EXPENSE', 89.12, DATE_SUB(NOW(), INTERVAL 125 DAY), 'Steakhouse - Date Night', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 125 DAY), DATE_SUB(NOW(), INTERVAL 125 DAY)),
(@demo_user_id, @credit_id, @restaurants_cat, 'EXPENSE', 43.67, DATE_SUB(NOW(), INTERVAL 100 DAY), 'Thai Restaurant - Dinner', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 100 DAY), DATE_SUB(NOW(), INTERVAL 100 DAY)),
(@demo_user_id, @credit_id, @restaurants_cat, 'EXPENSE', 72.45, DATE_SUB(NOW(), INTERVAL 70 DAY), 'Mexican Restaurant - Family Dinner', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 70 DAY), DATE_SUB(NOW(), INTERVAL 70 DAY)),
(@demo_user_id, @credit_id, @restaurants_cat, 'EXPENSE', 56.89, DATE_SUB(NOW(), INTERVAL 35 DAY), 'Japanese Restaurant - Dinner', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),

-- Fast Food (quick meals)
(@demo_user_id, @cash_id, @fastfood_cat, 'EXPENSE', 12.45, DATE_SUB(NOW(), INTERVAL 155 DAY), 'Chipotle - Lunch', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 155 DAY), DATE_SUB(NOW(), INTERVAL 155 DAY)),
(@demo_user_id, @cash_id, @fastfood_cat, 'EXPENSE', 9.87, DATE_SUB(NOW(), INTERVAL 120 DAY), 'McDonalds - Quick Lunch', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 120 DAY), DATE_SUB(NOW(), INTERVAL 120 DAY)),
(@demo_user_id, @cash_id, @fastfood_cat, 'EXPENSE', 14.23, DATE_SUB(NOW(), INTERVAL 85 DAY), 'Panera - Lunch', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 85 DAY), DATE_SUB(NOW(), INTERVAL 85 DAY));

-- TRANSPORTATION (20 transactions - gas, transit, parking, maintenance)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, status, created_at, updated_at) VALUES
-- Gas & Fuel (every 2 weeks)
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 58.34, DATE_SUB(NOW(), INTERVAL 178 DAY), 'Shell - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 178 DAY), DATE_SUB(NOW(), INTERVAL 178 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 62.45, DATE_SUB(NOW(), INTERVAL 164 DAY), 'Chevron - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 164 DAY), DATE_SUB(NOW(), INTERVAL 164 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 55.89, DATE_SUB(NOW(), INTERVAL 150 DAY), 'Shell - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 150 DAY), DATE_SUB(NOW(), INTERVAL 150 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 61.23, DATE_SUB(NOW(), INTERVAL 136 DAY), 'Chevron - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 136 DAY), DATE_SUB(NOW(), INTERVAL 136 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 59.78, DATE_SUB(NOW(), INTERVAL 122 DAY), 'Shell - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 122 DAY), DATE_SUB(NOW(), INTERVAL 122 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 64.12, DATE_SUB(NOW(), INTERVAL 108 DAY), 'Chevron - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 108 DAY), DATE_SUB(NOW(), INTERVAL 108 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 57.45, DATE_SUB(NOW(), INTERVAL 94 DAY), 'Shell - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 94 DAY), DATE_SUB(NOW(), INTERVAL 94 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 60.89, DATE_SUB(NOW(), INTERVAL 80 DAY), 'Chevron - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 80 DAY), DATE_SUB(NOW(), INTERVAL 80 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 63.23, DATE_SUB(NOW(), INTERVAL 66 DAY), 'Shell - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 66 DAY), DATE_SUB(NOW(), INTERVAL 66 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 58.67, DATE_SUB(NOW(), INTERVAL 52 DAY), 'Chevron - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 52 DAY), DATE_SUB(NOW(), INTERVAL 52 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 61.45, DATE_SUB(NOW(), INTERVAL 38 DAY), 'Shell - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 38 DAY), DATE_SUB(NOW(), INTERVAL 38 DAY)),
(@demo_user_id, @credit_id, @gas_cat, 'EXPENSE', 59.12, DATE_SUB(NOW(), INTERVAL 24 DAY), 'Chevron - Gas Fill-up', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 24 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),

-- Public Transit
(@demo_user_id, @cash_id, @transit_cat, 'EXPENSE', 45.00, DATE_SUB(NOW(), INTERVAL 165 DAY), 'Monthly Metro Pass', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 165 DAY), DATE_SUB(NOW(), INTERVAL 165 DAY)),
(@demo_user_id, @cash_id, @transit_cat, 'EXPENSE', 45.00, DATE_SUB(NOW(), INTERVAL 135 DAY), 'Monthly Metro Pass', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 135 DAY), DATE_SUB(NOW(), INTERVAL 135 DAY)),
(@demo_user_id, @cash_id, @transit_cat, 'EXPENSE', 45.00, DATE_SUB(NOW(), INTERVAL 105 DAY), 'Monthly Metro Pass', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 105 DAY), DATE_SUB(NOW(), INTERVAL 105 DAY)),
(@demo_user_id, @cash_id, @transit_cat, 'EXPENSE', 45.00, DATE_SUB(NOW(), INTERVAL 75 DAY), 'Monthly Metro Pass', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 75 DAY), DATE_SUB(NOW(), INTERVAL 75 DAY)),

-- Parking
(@demo_user_id, @cash_id, @parking_cat, 'EXPENSE', 15.00, DATE_SUB(NOW(), INTERVAL 142 DAY), 'Downtown Parking - 4 hours', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 142 DAY), DATE_SUB(NOW(), INTERVAL 142 DAY)),
(@demo_user_id, @cash_id, @parking_cat, 'EXPENSE', 20.00, DATE_SUB(NOW(), INTERVAL 89 DAY), 'Airport Parking - Full Day', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 89 DAY), DATE_SUB(NOW(), INTERVAL 89 DAY)),

-- Car Maintenance
(@demo_user_id, @checking_id, @maintenance_cat, 'EXPENSE', 145.67, DATE_SUB(NOW(), INTERVAL 127 DAY), 'Oil Change & Tire Rotation', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 127 DAY), DATE_SUB(NOW(), INTERVAL 127 DAY)),
(@demo_user_id, @checking_id, @maintenance_cat, 'EXPENSE', 89.32, DATE_SUB(NOW(), INTERVAL 43 DAY), 'Car Wash & Detail', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 43 DAY), DATE_SUB(NOW(), INTERVAL 43 DAY));

-- UTILITIES & HOUSING (15 transactions - recurring bills)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, status, created_at, updated_at) VALUES
-- Monthly Electric Bill
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 112.34, DATE_SUB(NOW(), INTERVAL 165 DAY), 'Electric Bill - May', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 165 DAY), DATE_SUB(NOW(), INTERVAL 165 DAY)),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 98.76, DATE_SUB(NOW(), INTERVAL 135 DAY), 'Electric Bill - June', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 135 DAY), DATE_SUB(NOW(), INTERVAL 135 DAY)),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 145.23, DATE_SUB(NOW(), INTERVAL 105 DAY), 'Electric Bill - July (AC usage)', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 105 DAY), DATE_SUB(NOW(), INTERVAL 105 DAY)),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 132.45, DATE_SUB(NOW(), INTERVAL 75 DAY), 'Electric Bill - August', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 75 DAY), DATE_SUB(NOW(), INTERVAL 75 DAY)),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 107.89, DATE_SUB(NOW(), INTERVAL 45 DAY), 'Electric Bill - September', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY)),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 95.67, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Electric Bill - October', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- Monthly Rent
(@demo_user_id, @checking_id, @housing_cat, 'EXPENSE', 1500.00, DATE_SUB(NOW(), INTERVAL 170 DAY), 'Rent Payment - May', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 170 DAY), DATE_SUB(NOW(), INTERVAL 170 DAY)),
(@demo_user_id, @checking_id, @housing_cat, 'EXPENSE', 1500.00, DATE_SUB(NOW(), INTERVAL 140 DAY), 'Rent Payment - June', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 140 DAY), DATE_SUB(NOW(), INTERVAL 140 DAY)),
(@demo_user_id, @checking_id, @housing_cat, 'EXPENSE', 1500.00, DATE_SUB(NOW(), INTERVAL 110 DAY), 'Rent Payment - July', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 110 DAY), DATE_SUB(NOW(), INTERVAL 110 DAY)),
(@demo_user_id, @checking_id, @housing_cat, 'EXPENSE', 1500.00, DATE_SUB(NOW(), INTERVAL 80 DAY), 'Rent Payment - August', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 80 DAY), DATE_SUB(NOW(), INTERVAL 80 DAY)),
(@demo_user_id, @checking_id, @housing_cat, 'EXPENSE', 1500.00, DATE_SUB(NOW(), INTERVAL 50 DAY), 'Rent Payment - September', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY)),
(@demo_user_id, @checking_id, @housing_cat, 'EXPENSE', 1500.00, DATE_SUB(NOW(), INTERVAL 20 DAY), 'Rent Payment - October', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- Internet
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 79.99, DATE_SUB(NOW(), INTERVAL 160 DAY), 'Internet Service - Monthly', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 160 DAY), DATE_SUB(NOW(), INTERVAL 160 DAY)),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 79.99, DATE_SUB(NOW(), INTERVAL 100 DAY), 'Internet Service - Monthly', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 100 DAY), DATE_SUB(NOW(), INTERVAL 100 DAY)),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 79.99, DATE_SUB(NOW(), INTERVAL 40 DAY), 'Internet Service - Monthly', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY));
