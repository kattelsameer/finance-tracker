-- =====================================================
-- Demo Transfers and Investments - Finance Tracker
-- Transfers between accounts and loan payments (20 transactions)
-- =====================================================

-- Retrieve demo user and account IDs
SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@example.com');
SET @checking_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Main Checking');
SET @savings_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Emergency Savings');
SET @cash_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Cash Wallet');
SET @credit_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Rewards Credit Card');
SET @investment_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Investment Account');
SET @loan_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Car Loan');

-- Get transfer category
SET @transfer_cat = (SELECT id FROM categories WHERE category_name = 'Transfer' AND is_system = TRUE LIMIT 1);

-- TRANSFERS TO SAVINGS (Monthly contributions to emergency fund)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, transfer_to_account_id, status, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 500.00, DATE_SUB(NOW(), INTERVAL 165 DAY), 'Monthly Savings Transfer', @savings_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 165 DAY), DATE_SUB(NOW(), INTERVAL 165 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 500.00, DATE_SUB(NOW(), INTERVAL 135 DAY), 'Monthly Savings Transfer', @savings_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 135 DAY), DATE_SUB(NOW(), INTERVAL 135 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 500.00, DATE_SUB(NOW(), INTERVAL 105 DAY), 'Monthly Savings Transfer', @savings_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 105 DAY), DATE_SUB(NOW(), INTERVAL 105 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 500.00, DATE_SUB(NOW(), INTERVAL 75 DAY), 'Monthly Savings Transfer', @savings_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 75 DAY), DATE_SUB(NOW(), INTERVAL 75 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 500.00, DATE_SUB(NOW(), INTERVAL 45 DAY), 'Monthly Savings Transfer', @savings_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 500.00, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Monthly Savings Transfer', @savings_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY));

-- INVESTMENT CONTRIBUTIONS (Quarterly investment deposits)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, transfer_to_account_id, status, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 1000.00, DATE_SUB(NOW(), INTERVAL 150 DAY), 'Q2 Investment Contribution', @investment_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 150 DAY), DATE_SUB(NOW(), INTERVAL 150 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 1000.00, DATE_SUB(NOW(), INTERVAL 60 DAY), 'Q3 Investment Contribution', @investment_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 60 DAY));

-- CAR LOAN PAYMENTS (Monthly loan payments - reducing liability)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, transfer_to_account_id, status, reference_number, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 680.00, DATE_SUB(NOW(), INTERVAL 168 DAY), 'Car Loan Payment - May', @loan_id, 'COMPLETED', 'LOAN-05', DATE_SUB(NOW(), INTERVAL 168 DAY), DATE_SUB(NOW(), INTERVAL 168 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 680.00, DATE_SUB(NOW(), INTERVAL 138 DAY), 'Car Loan Payment - June', @loan_id, 'COMPLETED', 'LOAN-06', DATE_SUB(NOW(), INTERVAL 138 DAY), DATE_SUB(NOW(), INTERVAL 138 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 680.00, DATE_SUB(NOW(), INTERVAL 108 DAY), 'Car Loan Payment - July', @loan_id, 'COMPLETED', 'LOAN-07', DATE_SUB(NOW(), INTERVAL 108 DAY), DATE_SUB(NOW(), INTERVAL 108 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 680.00, DATE_SUB(NOW(), INTERVAL 78 DAY), 'Car Loan Payment - August', @loan_id, 'COMPLETED', 'LOAN-08', DATE_SUB(NOW(), INTERVAL 78 DAY), DATE_SUB(NOW(), INTERVAL 78 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 680.00, DATE_SUB(NOW(), INTERVAL 48 DAY), 'Car Loan Payment - September', @loan_id, 'COMPLETED', 'LOAN-09', DATE_SUB(NOW(), INTERVAL 48 DAY), DATE_SUB(NOW(), INTERVAL 48 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 680.00, DATE_SUB(NOW(), INTERVAL 18 DAY), 'Car Loan Payment - October', @loan_id, 'COMPLETED', 'LOAN-10', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY));

-- CREDIT CARD PAYMENTS (Monthly credit card payments)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, transfer_to_account_id, status, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 250.00, DATE_SUB(NOW(), INTERVAL 157 DAY), 'Credit Card Payment', @credit_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 157 DAY), DATE_SUB(NOW(), INTERVAL 157 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 320.00, DATE_SUB(NOW(), INTERVAL 127 DAY), 'Credit Card Payment', @credit_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 127 DAY), DATE_SUB(NOW(), INTERVAL 127 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 280.00, DATE_SUB(NOW(), INTERVAL 97 DAY), 'Credit Card Payment', @credit_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 97 DAY), DATE_SUB(NOW(), INTERVAL 97 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 310.00, DATE_SUB(NOW(), INTERVAL 67 DAY), 'Credit Card Payment', @credit_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 67 DAY), DATE_SUB(NOW(), INTERVAL 67 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 290.00, DATE_SUB(NOW(), INTERVAL 37 DAY), 'Credit Card Payment', @credit_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 37 DAY), DATE_SUB(NOW(), INTERVAL 37 DAY));

-- ATM CASH WITHDRAWALS (Cash top-ups from checking)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description, transfer_to_account_id, status, created_at, updated_at) VALUES
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 100.00, DATE_SUB(NOW(), INTERVAL 142 DAY), 'ATM Cash Withdrawal', @cash_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 142 DAY), DATE_SUB(NOW(), INTERVAL 142 DAY)),
(@demo_user_id, @checking_id, @transfer_cat, 'TRANSFER', 100.00, DATE_SUB(NOW(), INTERVAL 89 DAY), 'ATM Cash Withdrawal', @cash_id, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 89 DAY), DATE_SUB(NOW(), INTERVAL 89 DAY));
