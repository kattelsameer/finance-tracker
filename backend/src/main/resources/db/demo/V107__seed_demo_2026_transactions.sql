-- =====================================================
-- Demo Recent Transactions - Finance Tracker Demo Mode
-- Creates last-30-day transactions relative to CURDATE()
-- All variables explicitly declared (fully self-contained)
-- =====================================================

-- =====================================================
-- VARIABLE DECLARATIONS
-- =====================================================
SET @demo_user_id   = (SELECT id FROM users WHERE email = 'demo@example.com');
SET @checking_id    = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Main Checking');
SET @savings_id     = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Emergency Savings');
SET @cash_id        = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Cash Wallet');
SET @credit_id      = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Rewards Credit Card');
SET @investment_id  = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Investment Account');

-- User-defined subcategories (created in V101)
SET @groceries_cat  = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Groceries');
SET @restaurants_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Restaurants');
SET @coffee_cat     = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Coffee Shops');
SET @fastfood_cat   = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Fast Food');
SET @gas_cat        = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Gas & Fuel');
SET @parking_cat    = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Parking');
SET @streaming_cat  = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Streaming Services');
SET @movies_cat     = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Movies & Concerts');
SET @hobbies_cat    = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Hobbies');
SET @clothing_cat   = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Clothing');
SET @electronics_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Electronics');

-- System categories
SET @utilities_cat     = (SELECT id FROM categories WHERE category_name = 'Utilities'      AND is_system = TRUE LIMIT 1);
SET @housing_cat       = (SELECT id FROM categories WHERE category_name = 'Housing'        AND is_system = TRUE LIMIT 1);
SET @entertainment_cat = (SELECT id FROM categories WHERE category_name = 'Entertainment'  AND is_system = TRUE LIMIT 1);
SET @shopping_cat      = (SELECT id FROM categories WHERE category_name = 'Shopping'       AND is_system = TRUE LIMIT 1);
SET @healthcare_cat    = (SELECT id FROM categories WHERE category_name = 'Healthcare'     AND is_system = TRUE LIMIT 1);
SET @transportation_cat = (SELECT id FROM categories WHERE category_name = 'Transportation' AND is_system = TRUE LIMIT 1);
SET @salary_cat        = (SELECT id FROM categories WHERE category_name = 'Salary'         AND is_system = TRUE LIMIT 1);
SET @insurance_cat     = (SELECT id FROM categories WHERE category_name = 'Insurance'      AND is_system = TRUE LIMIT 1);

-- =====================================================
-- CURRENT MONTH INCOME (first paycheck)
-- =====================================================
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, reference_number, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_FORMAT(CURDATE(), '%Y-%m-01'), 'Salary - Direct Deposit', 'First paycheck of the month', 'DD-00016', DATE_FORMAT(CURDATE(), '%Y-%m-01'), DATE_FORMAT(CURDATE(), '%Y-%m-01'));

-- =====================================================
-- CURRENT MONTH FIXED BILLS (day 1 of this month)
-- These populate the Housing, Utilities budgets
-- =====================================================
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @housing_cat,   'EXPENSE', 1500.00, DATE_FORMAT(CURDATE(), '%Y-%m-01'), 'Monthly Rent Payment',  'Rent - auto pay',          DATE_FORMAT(CURDATE(), '%Y-%m-01'), DATE_FORMAT(CURDATE(), '%Y-%m-01')),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE',  110.00, DATE_FORMAT(CURDATE(), '%Y-%m-01'), 'Electric Bill',         'Monthly electricity',      DATE_FORMAT(CURDATE(), '%Y-%m-01'), DATE_FORMAT(CURDATE(), '%Y-%m-01')),
(@demo_user_id, @checking_id, @utilities_cat, 'EXPENSE',   79.99, DATE_FORMAT(CURDATE(), '%Y-%m-01'), 'Xfinity Internet',      'Monthly internet bill',    DATE_FORMAT(CURDATE(), '%Y-%m-01'), DATE_FORMAT(CURDATE(), '%Y-%m-01')),
(@demo_user_id, @checking_id, @insurance_cat, 'EXPENSE',  285.00, DATE_FORMAT(CURDATE(), '%Y-%m-01'), 'Health Insurance',      'Monthly premium',          DATE_FORMAT(CURDATE(), '%Y-%m-01'), DATE_FORMAT(CURDATE(), '%Y-%m-01'));

-- =====================================================
-- CURRENT MONTH VARIABLE EXPENSES (days 1-2)
-- These populate Food, Transportation, Shopping budgets
-- =====================================================
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @credit_id,   @groceries_cat,  'EXPENSE',  145.67, CURDATE(), 'Whole Foods Market', 'Weekly grocery shopping', CURDATE(), CURDATE()),
(@demo_user_id, @cash_id,     @coffee_cat,     'EXPENSE',    6.50, CURDATE(), 'Starbucks',          'Morning coffee',          CURDATE(), CURDATE()),
(@demo_user_id, @credit_id,   @restaurants_cat,'EXPENSE',   48.25, CURDATE(), 'Local Bistro',       'Lunch with colleague',    CURDATE(), CURDATE()),
(@demo_user_id, @credit_id,   @gas_cat,        'EXPENSE',   55.00, CURDATE(), 'Shell Gas Station',  'Weekly fuel top-up',      CURDATE(), CURDATE()),
(@demo_user_id, @checking_id, @streaming_cat,  'EXPENSE',   15.99, CURDATE(), 'Netflix',            'Monthly subscription',    CURDATE(), CURDATE());

-- =====================================================
-- RECENT PAST (days 3–25 ago) — relative to CURDATE()
-- =====================================================

-- 3 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @fastfood_cat,   'EXPENSE', 14.25, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Chipotle',              'Quick lunch',              DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(@demo_user_id, @credit_id,   @shopping_cat,   'EXPENSE', 45.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'CVS Pharmacy',          'Health & vitamins',        DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY));

-- 4 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @credit_id,   @entertainment_cat,'EXPENSE',120.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Comedy Club',          'Friday night out',         DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(@demo_user_id, @checking_id, @restaurants_cat,'EXPENSE',  95.50, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Upscale Steakhouse',   'Date night dinner',        DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY));

-- 5 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @groceries_cat,  'EXPENSE',156.89, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Costco',               'Bulk grocery run',         DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY));

-- 7 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @gas_cat,        'EXPENSE',  48.00, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'BP Gas Station',       'Weekly fuel',              DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
(@demo_user_id, @credit_id,   @restaurants_cat,'EXPENSE',  34.25, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Thai Noodle House',    'Lunch takeout',            DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY));

-- 8 days ago (Bi-weekly salary)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, reference_number, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @salary_cat,     'INCOME', 3200.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Salary - Direct Deposit','Bi-weekly paycheck',     'DD-00014', DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(CURDATE(), INTERVAL 8 DAY));

-- 9 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @credit_id,   @electronics_cat,'EXPENSE', 234.50, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'Best Buy',             'Wireless headphones',      DATE_SUB(CURDATE(), INTERVAL 9 DAY), DATE_SUB(CURDATE(), INTERVAL 9 DAY));

-- 10 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @credit_id,   @entertainment_cat,'EXPENSE', 75.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY),'Amazon - Gift Cards',  'Birthday gifts for friend',DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY));

-- 12 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @groceries_cat,  'EXPENSE', 198.76, DATE_SUB(CURDATE(), INTERVAL 12 DAY),'Trader Joe\'s',        'Weekly groceries + specials',DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
(@demo_user_id, @credit_id,   @healthcare_cat, 'EXPENSE',  35.00, DATE_SUB(CURDATE(), INTERVAL 12 DAY),'CVS Pharmacy',         'Prescription refill',      DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(CURDATE(), INTERVAL 12 DAY));

-- 15 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @gas_cat,        'EXPENSE',  52.00, DATE_SUB(CURDATE(), INTERVAL 15 DAY),'Chevron',              'Weekly fuel',              DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
(@demo_user_id, @credit_id,   @restaurants_cat,'EXPENSE',  42.80, DATE_SUB(CURDATE(), INTERVAL 15 DAY),'Thai Restaurant',      'Friday dinner',            DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY));

-- 17 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @groceries_cat,  'EXPENSE',  87.45, DATE_SUB(CURDATE(), INTERVAL 17 DAY),'Whole Foods Market',   'Weekly groceries',         DATE_SUB(CURDATE(), INTERVAL 17 DAY), DATE_SUB(CURDATE(), INTERVAL 17 DAY));

-- 20 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @credit_id,   @clothing_cat,   'EXPENSE', 156.99, DATE_SUB(CURDATE(), INTERVAL 20 DAY),'H&M',                  'Spring wardrobe update',   DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(@demo_user_id, @cash_id,     @coffee_cat,     'EXPENSE',   5.75, DATE_SUB(CURDATE(), INTERVAL 20 DAY),'Local Café',           'Morning coffee',           DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY));

-- 22 days ago (Bi-weekly salary)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, reference_number, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @salary_cat,     'INCOME', 3200.00, DATE_SUB(CURDATE(), INTERVAL 22 DAY),'Salary - Direct Deposit','Bi-weekly paycheck',     'DD-00015', DATE_SUB(CURDATE(), INTERVAL 22 DAY), DATE_SUB(CURDATE(), INTERVAL 22 DAY));

-- 25 days ago
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @groceries_cat,  'EXPENSE',  94.23, DATE_SUB(CURDATE(), INTERVAL 25 DAY),'Whole Foods Market',   'Weekly shopping',          DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(@demo_user_id, @credit_id,   @movies_cat,     'EXPENSE',  29.99, DATE_SUB(CURDATE(), INTERVAL 25 DAY),'AMC Theater',          'Weekend movie tickets',    DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(@demo_user_id, @credit_id,   @gas_cat,        'EXPENSE',  50.00, DATE_SUB(CURDATE(), INTERVAL 25 DAY),'Exxon',                'Weekly fuel',              DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 25 DAY));
