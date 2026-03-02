-- =====================================================
-- Demo User and Accounts - Finance Tracker Demo Mode
-- Creates demo user with 6 diverse account types
-- =====================================================

-- Demo User (password: Demo123!)
-- Password hash generated with BCrypt strength 12
INSERT INTO users (username, email, password_hash, display_name, created_at, updated_at) VALUES
('demo', 'demo@example.com', '$2a$12$EusAAfsVCvPAzmgRMIymWOamYXL6cLtEVr7O55n.CM7lNH2MzEWnO', 'Demo User', DATE_SUB(NOW(), INTERVAL 6 MONTH), NOW());

-- Get demo user ID for foreign key references
SET @demo_user_id = LAST_INSERT_ID();

-- Demo Accounts (6 accounts showing different types and scenarios)
INSERT INTO accounts (user_id, account_type_id, account_name, currency, initial_balance, current_balance, institution_name, color_code, icon, is_active, include_in_net_worth, notes, created_at, updated_at) VALUES
-- 1. Main Checking Account - Primary transaction account
(@demo_user_id, 1, 'Main Checking', 'NPR', 5000.00, 3847.52, 'Demo Bank', '#3B82F6', 'wallet', TRUE, TRUE, 'Primary checking account for daily expenses', DATE_SUB(NOW(), INTERVAL 6 MONTH), NOW()),

-- 2. Emergency Savings - Growing savings account
(@demo_user_id, 2, 'Emergency Savings', 'NPR', 10000.00, 12543.18, 'Demo Bank', '#10B981', 'piggy-bank', TRUE, TRUE, 'Emergency fund - target NPR 15,000', DATE_SUB(NOW(), INTERVAL 6 MONTH), NOW()),

-- 3. Cash Wallet - Physical cash tracking
(@demo_user_id, 3, 'Cash Wallet', 'NPR', 200.00, 127.50, NULL, '#F59E0B', 'banknote', TRUE, TRUE, 'Physical cash on hand', DATE_SUB(NOW(), INTERVAL 6 MONTH), NOW()),

-- 4. Rewards Credit Card - Credit card with negative balance
(@demo_user_id, 4, 'Rewards Credit Card', 'NPR', 0.00, -847.32, 'Demo Credit Union', '#EF4444', 'credit-card', TRUE, TRUE, '2% cashback on all purchases', DATE_SUB(NOW(), INTERVAL 3 MONTH), NOW()),

-- 5. Investment Account - Brokerage with growth
(@demo_user_id, 5, 'Investment Account', 'NPR', 15000.00, 18234.67, 'Demo Brokerage', '#8B5CF6', 'trending-up', TRUE, TRUE, 'Long-term investment portfolio', DATE_SUB(NOW(), INTERVAL 12 MONTH), NOW()),

-- 6. Car Loan - Liability account being paid down
(@demo_user_id, 6, 'Car Loan', 'NPR', -18000.00, -14320.00, 'Demo Auto Finance', '#6B7280', 'car', TRUE, TRUE, '2023 Honda Civic - 4.5% APR', DATE_SUB(NOW(), INTERVAL 18 MONTH), NOW());

-- Store account IDs in session variables for use in subsequent migrations
SET @checking_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Main Checking');
SET @savings_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Emergency Savings');
SET @cash_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Cash Wallet');
SET @credit_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Rewards Credit Card');
SET @investment_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Investment Account');
SET @loan_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Car Loan');

-- Log demo user creation
INSERT INTO audit_log (user_id, entity_type, entity_id, action, old_values, new_values, ip_address, user_agent, created_at)
VALUES (@demo_user_id, 'USER', @demo_user_id, 'DEMO_USER_CREATED', NULL, '{"email":"demo@example.com","display_name":"Demo User"}', '127.0.0.1', 'Demo Setup Script', NOW());
