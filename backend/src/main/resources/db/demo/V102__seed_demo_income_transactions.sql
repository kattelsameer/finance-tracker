-- =====================================================
-- Demo Income Transactions - Finance Tracker Demo Mode
-- Creates 13 bi-weekly salary deposits over 6 months
-- Plus bonuses and investment income
-- =====================================================

-- Retrieve demo user and account IDs
SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@example.com');
SET @checking_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Main Checking');
SET @investment_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Investment Account');
SET @salary_cat = (SELECT id FROM categories WHERE category_name = 'Salary' AND is_system = TRUE LIMIT 1);
SET @investment_cat = (SELECT id FROM categories WHERE category_name = 'Investment Income' AND is_system = TRUE LIMIT 1);
SET @bonus_cat = (SELECT id FROM categories WHERE category_name = 'Bonus' AND is_system = TRUE LIMIT 1);

-- Bi-weekly Salary Deposits (13 paychecks over 6 months)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, reference_number, created_at, updated_at) VALUES
-- Month 6 (oldest - 180 days ago)
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 180 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00001', DATE_SUB(NOW(), INTERVAL 180 DAY), DATE_SUB(NOW(), INTERVAL 180 DAY)),
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 166 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00002', DATE_SUB(NOW(), INTERVAL 166 DAY), DATE_SUB(NOW(), INTERVAL 166 DAY)),

-- Month 5 (152 days ago)
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 152 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00003',  DATE_SUB(NOW(), INTERVAL 152 DAY), DATE_SUB(NOW(), INTERVAL 152 DAY)),
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 138 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00004',  DATE_SUB(NOW(), INTERVAL 138 DAY), DATE_SUB(NOW(), INTERVAL 138 DAY)),

-- Month 4 (124 days ago)
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 124 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00005',  DATE_SUB(NOW(), INTERVAL 124 DAY), DATE_SUB(NOW(), INTERVAL 124 DAY)),
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 110 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00006',  DATE_SUB(NOW(), INTERVAL 110 DAY), DATE_SUB(NOW(), INTERVAL 110 DAY)),
-- Q2 Performance Bonus
(@demo_user_id, @checking_id, @bonus_cat, 'INCOME', 1500.00, DATE_SUB(NOW(), INTERVAL 105 DAY), 'Q2 Performance Bonus', 'Quarterly performance bonus', 'BONUS-Q2',  DATE_SUB(NOW(), INTERVAL 105 DAY), DATE_SUB(NOW(), INTERVAL 105 DAY)),

-- Month 3 (96 days ago)
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 96 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00007',  DATE_SUB(NOW(), INTERVAL 96 DAY), DATE_SUB(NOW(), INTERVAL 96 DAY)),
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 82 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00008',  DATE_SUB(NOW(), INTERVAL 82 DAY), DATE_SUB(NOW(), INTERVAL 82 DAY)),

-- Month 2 (68 days ago)
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 68 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00009',  DATE_SUB(NOW(), INTERVAL 68 DAY), DATE_SUB(NOW(), INTERVAL 68 DAY)),
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 54 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00010',  DATE_SUB(NOW(), INTERVAL 54 DAY), DATE_SUB(NOW(), INTERVAL 54 DAY)),

-- Month 1 (40 days ago)
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 40 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00011',  DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY)),
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 26 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00012',  DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),

-- Current month
(@demo_user_id, @checking_id, @salary_cat, 'INCOME', 3200.00, DATE_SUB(NOW(), INTERVAL 12 DAY), 'Salary - Direct Deposit', 'Bi-weekly paycheck', 'DD-00013',  DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY));

-- Investment Income (quarterly dividends)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, notes, created_at, updated_at) VALUES
(@demo_user_id, @investment_id, @investment_cat, 'INCOME', 234.56, DATE_SUB(NOW(), INTERVAL 150 DAY), 'Dividend Payment', 'Quarterly dividend from index fund',  DATE_SUB(NOW(), INTERVAL 150 DAY), DATE_SUB(NOW(), INTERVAL 150 DAY)),
(@demo_user_id, @investment_id, @investment_cat, 'INCOME', 287.43, DATE_SUB(NOW(), INTERVAL 60 DAY), 'Dividend Payment', 'Quarterly dividend from index fund',  DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 60 DAY));
