-- =====================================================
-- Demo 2026 Transactions - Finance Tracker Demo Mode
-- Creates recent transactions for January 2026
-- =====================================================

-- January 4, 2026 (Today) - Groceries
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) 
SELECT 
    u.id, 
    a.id,
    c.id,
    'EXPENSE', 45.67, CURDATE(), 'Whole Foods Market', 'Weekly grocery shopping', CURDATE(), CURDATE()
FROM users u
JOIN accounts a ON a.user_id = u.id AND a.account_name = 'Main Checking'
JOIN categories c ON c.category_name = 'Groceries' AND c.is_system = TRUE
WHERE u.email = 'demo@example.com'
LIMIT 1;

-- January 4, 2026 (Today) - Dining
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) 
SELECT 
    u.id, 
    a.id,
    c.id,
    'EXPENSE', 28.50, CURDATE(), 'Local Coffee Shop', 'Breakfast meeting', CURDATE(), CURDATE()
FROM users u
JOIN accounts a ON a.user_id = u.id AND a.account_name = 'Credit Card'
JOIN categories c ON c.category_name = 'Dining Out' AND c.is_system = TRUE
WHERE u.email = 'demo@example.com'
LIMIT 1;

-- January 3, 2026 - Transportation
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) 
SELECT 
    u.id, 
    a.id,
    c.id,
    'EXPENSE', 55.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Gas Station', 'Weekly fuel', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY)
FROM users u
JOIN accounts a ON a.user_id = u.id AND a.account_name = 'Credit Card'
JOIN categories c ON c.category_name = 'Transportation' AND c.is_system = TRUE
WHERE u.email = 'demo@example.com'
LIMIT 1;

-- January 3, 2026 - Entertainment
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) 
SELECT 
    u.id, 
    a.id,
    c.id,
    'EXPENSE', 15.99, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Netflix Subscription', 'Monthly subscription', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY)
FROM users u
JOIN accounts a ON a.user_id = u.id AND a.account_name = 'Main Checking'
JOIN categories c ON c.category_name = 'Entertainment' AND c.is_system = TRUE
WHERE u.email = 'demo@example.com'
LIMIT 1;

-- January 2, 2026 - Dining
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) 
SELECT 
    u.id, 
    a.id,
    c.id,
    'EXPENSE', 67.45, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Italian Restaurant', 'Dinner with family', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY)
FROM users u
JOIN accounts a ON a.user_id = u.id AND a.account_name = 'Credit Card'
JOIN categories c ON c.category_name = 'Dining Out' AND c.is_system = TRUE
WHERE u.email = 'demo@example.com'
LIMIT 1;

-- January 2, 2026 - Shopping
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) 
SELECT 
    u.id, 
    a.id,
    c.id,
    'EXPENSE', 89.99, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Amazon', 'Home supplies', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY)
FROM users u
JOIN accounts a ON a.user_id = u.id AND a.account_name = 'Main Checking'
JOIN categories c ON c.category_name = 'Shopping' AND c.is_system = TRUE
WHERE u.email = 'demo@example.com'
LIMIT 1;

-- January 1, 2026 - Utilities
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) 
SELECT 
    u.id, 
    a.id,
    c.id,
    'EXPENSE', 125.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Electric Company', 'December electric bill', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY)
FROM users u
JOIN accounts a ON a.user_id = u.id AND a.account_name = 'Main Checking'
JOIN categories c ON c.category_name = 'Utilities' AND c.is_system = TRUE
WHERE u.email = 'demo@example.com'
LIMIT 1;

-- January 1, 2026 - Groceries  
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) 
SELECT 
    u.id, 
    a.id,
    c.id,
    'EXPENSE', 72.34, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Supermarket', 'New Year party supplies', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY)
FROM users u
JOIN accounts a ON a.user_id = u.id AND a.account_name = 'Main Checking'
JOIN categories c ON c.category_name = 'Groceries' AND c.is_system = TRUE
WHERE u.email = 'demo@example.com'
LIMIT 1;

-- January 2, 2026
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @credit_card_id, @dining_cat, 'EXPENSE', 67.45, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Italian Restaurant', 'Dinner with family', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(@demo_user_id, @checking_id, @shopping_cat, 'EXPENSE', 89.99, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Amazon', 'Home supplies', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY));

-- January 1, 2026 (New Year)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 125.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Electric Company', 'December electric bill', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(@demo_user_id, @checking_id, @groceries_cat, 'EXPENSE', 72.34, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Supermarket', 'New Year party supplies', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY));

-- =====================================================
-- LATE DECEMBER 2025 (Recent past)
-- =====================================================

-- December 31, 2025
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @credit_card_id, @entertainment_cat, 'EXPENSE', 120.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'New Year Eve Party', 'NYE celebration', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(@demo_user_id, @checking_id, @dining_cat, 'EXPENSE', 95.50, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Fine Dining Restaurant', 'New Year Eve dinner', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY));

-- December 30, 2025
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @groceries_cat, 'EXPENSE', 156.89, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Costco', 'Bulk shopping', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(@demo_user_id, @credit_card_id, @shopping_cat, 'EXPENSE', 45.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Pharmacy', 'Vitamins and supplements', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY));

-- December 28, 2025
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @transportation_cat, 'EXPENSE', 48.00, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Gas Station', 'Holiday travel fuel', DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
(@demo_user_id, @credit_card_id, @dining_cat, 'EXPENSE', 34.25, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Fast Food', 'Quick lunch', DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY));

-- December 27, 2025 (Salary - Bi-weekly)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, reference_number, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00014', DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(CURDATE(), INTERVAL 8 DAY));

-- December 26, 2025 (Day after Christmas)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @shopping_cat, 'EXPENSE', 234.50, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'Electronics Store', 'Boxing day sale purchase', DATE_SUB(CURDATE(), INTERVAL 9 DAY), DATE_SUB(CURDATE(), INTERVAL 9 DAY));

-- December 25, 2025 (Christmas)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @credit_card_id, @entertainment_cat, 'EXPENSE', 75.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Gift Cards', 'Christmas gifts', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY));

-- December 23, 2025
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @groceries_cat, 'EXPENSE', 198.76, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'Supermarket', 'Christmas dinner shopping', DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
(@demo_user_id, @credit_card_id, @healthcare_cat, 'EXPENSE', 35.00, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'Pharmacy', 'Prescription refill', DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(CURDATE(), INTERVAL 12 DAY));

-- December 20, 2025
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @transportation_cat, 'EXPENSE', 52.00, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'Gas Station', 'Weekly fuel', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
(@demo_user_id, @credit_card_id, @dining_cat, 'EXPENSE', 42.80, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'Thai Restaurant', 'Dinner out', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY));

-- December 18, 2025
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @groceries_cat, 'EXPENSE', 87.45, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 'Whole Foods Market', 'Weekly groceries', DATE_SUB(CURDATE(), INTERVAL 17 DAY), DATE_SUB(CURDATE(), INTERVAL 17 DAY));

-- December 15, 2025
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE', 89.50, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Internet Service', 'Monthly internet bill', DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(@demo_user_id, @credit_card_id, @shopping_cat, 'EXPENSE', 156.99, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Online Store', 'Winter clothes', DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY));

-- December 13, 2025 (Salary - Bi-weekly)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, reference_number, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(CURDATE(), INTERVAL 22 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00015', DATE_SUB(CURDATE(), INTERVAL 22 DAY), DATE_SUB(CURDATE(), INTERVAL 22 DAY));

-- December 10, 2025
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @groceries_cat, 'EXPENSE', 94.23, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Trader Joes', 'Weekly shopping', DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(@demo_user_id, @credit_card_id, @entertainment_cat, 'EXPENSE', 29.99, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Movie Theater', 'Weekend movie', DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 25 DAY));
