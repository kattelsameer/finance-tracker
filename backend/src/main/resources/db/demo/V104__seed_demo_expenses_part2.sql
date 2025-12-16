-- =====================================================
-- Demo Expense Transactions Part 2 - Finance Tracker
-- Shopping, Entertainment, Healthcare (40+ transactions)
-- =====================================================

-- Retrieve demo user and account IDs
SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@example.com');
SET @checking_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Main Checking');
SET @credit_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Rewards Credit Card');
SET @cash_id = (SELECT id FROM accounts WHERE user_id = @demo_user_id AND account_name = 'Cash Wallet');

-- Get category IDs
SET @clothing_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Clothing');
SET @electronics_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Electronics');
SET @home_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Home & Garden');
SET @streaming_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Streaming Services');
SET @movies_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Movies & Concerts');
SET @hobbies_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Hobbies');
SET @healthcare_cat = (SELECT id FROM categories WHERE category_name = 'Healthcare' AND is_system = TRUE LIMIT 1);
SET @insurance_cat = (SELECT id FROM categories WHERE category_name = 'Insurance' AND is_system = TRUE LIMIT 1);
SET @personal_cat = (SELECT id FROM categories WHERE category_name = 'Personal Care' AND is_system = TRUE LIMIT 1);

-- SHOPPING (18 transactions)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description,  created_at, updated_at) VALUES
-- Clothing
(@demo_user_id, @credit_id, @clothing_cat, 'EXPENSE', 89.99, DATE_SUB(NOW(), INTERVAL 163 DAY), 'Amazon - Summer Clothes',  DATE_SUB(NOW(), INTERVAL 163 DAY), DATE_SUB(NOW(), INTERVAL 163 DAY)),
(@demo_user_id, @credit_id, @clothing_cat, 'EXPENSE', 124.50, DATE_SUB(NOW(), INTERVAL 147 DAY), 'Macys - Work Shirts',  DATE_SUB(NOW(), INTERVAL 147 DAY), DATE_SUB(NOW(), INTERVAL 147 DAY)),
(@demo_user_id, @credit_id, @clothing_cat, 'EXPENSE', 67.85, DATE_SUB(NOW(), INTERVAL 118 DAY), 'Target - Casual Wear',  DATE_SUB(NOW(), INTERVAL 118 DAY), DATE_SUB(NOW(), INTERVAL 118 DAY)),
(@demo_user_id, @credit_id, @clothing_cat, 'EXPENSE', 156.75, DATE_SUB(NOW(), INTERVAL 92 DAY), 'Nordstrom - Dress Shoes',  DATE_SUB(NOW(), INTERVAL 92 DAY), DATE_SUB(NOW(), INTERVAL 92 DAY)),
(@demo_user_id, @credit_id, @clothing_cat, 'EXPENSE', 43.20, DATE_SUB(NOW(), INTERVAL 58 DAY), 'H&M - T-Shirts',  DATE_SUB(NOW(), INTERVAL 58 DAY), DATE_SUB(NOW(), INTERVAL 58 DAY)),
(@demo_user_id, @credit_id, @clothing_cat, 'EXPENSE', 98.50, DATE_SUB(NOW(), INTERVAL 31 DAY), 'Gap - Fall Wardrobe',  DATE_SUB(NOW(), INTERVAL 31 DAY), DATE_SUB(NOW(), INTERVAL 31 DAY)),

-- Electronics
(@demo_user_id, @credit_id, @electronics_cat, 'EXPENSE', 45.99, DATE_SUB(NOW(), INTERVAL 154 DAY), 'Amazon - USB-C Cable & Charger',  DATE_SUB(NOW(), INTERVAL 154 DAY), DATE_SUB(NOW(), INTERVAL 154 DAY)),
(@demo_user_id, @credit_id, @electronics_cat, 'EXPENSE', 89.99, DATE_SUB(NOW(), INTERVAL 134 DAY), 'Best Buy - Wireless Mouse',  DATE_SUB(NOW(), INTERVAL 134 DAY), DATE_SUB(NOW(), INTERVAL 134 DAY)),
(@demo_user_id, @credit_id, @electronics_cat, 'EXPENSE', 299.99, DATE_SUB(NOW(), INTERVAL 102 DAY), 'Apple Store - AirPods Pro',  DATE_SUB(NOW(), INTERVAL 102 DAY), DATE_SUB(NOW(), INTERVAL 102 DAY)),
(@demo_user_id, @credit_id, @electronics_cat, 'EXPENSE', 67.50, DATE_SUB(NOW(), INTERVAL 73 DAY), 'Amazon - Phone Case & Screen Protector',  DATE_SUB(NOW(), INTERVAL 73 DAY), DATE_SUB(NOW(), INTERVAL 73 DAY)),
(@demo_user_id, @credit_id, @electronics_cat, 'EXPENSE', 134.99, DATE_SUB(NOW(), INTERVAL 42 DAY), 'Best Buy - External Hard Drive',  DATE_SUB(NOW(), INTERVAL 42 DAY), DATE_SUB(NOW(), INTERVAL 42 DAY)),

-- Home & Garden
(@demo_user_id, @credit_id, @home_cat, 'EXPENSE', 78.45, DATE_SUB(NOW(), INTERVAL 168 DAY), 'HomeDepot - Garden Supplies',  DATE_SUB(NOW(), INTERVAL 168 DAY), DATE_SUB(NOW(), INTERVAL 168 DAY)),
(@demo_user_id, @credit_id, @home_cat, 'EXPENSE', 156.89, DATE_SUB(NOW(), INTERVAL 141 DAY), 'IKEA - Storage Organizers',  DATE_SUB(NOW(), INTERVAL 141 DAY), DATE_SUB(NOW(), INTERVAL 141 DAY)),
(@demo_user_id, @credit_id, @home_cat, 'EXPENSE', 234.50, DATE_SUB(NOW(), INTERVAL 114 DAY), 'Lowes - Kitchen Appliances',  DATE_SUB(NOW(), INTERVAL 114 DAY), DATE_SUB(NOW(), INTERVAL 114 DAY)),
(@demo_user_id, @credit_id, @home_cat, 'EXPENSE', 89.99, DATE_SUB(NOW(), INTERVAL 87 DAY), 'Bed Bath & Beyond - Bathroom Accessories',  DATE_SUB(NOW(), INTERVAL 87 DAY), DATE_SUB(NOW(), INTERVAL 87 DAY)),
(@demo_user_id, @credit_id, @home_cat, 'EXPENSE', 123.45, DATE_SUB(NOW(), INTERVAL 56 DAY), 'Target - Home Decor',  DATE_SUB(NOW(), INTERVAL 56 DAY), DATE_SUB(NOW(), INTERVAL 56 DAY)),
(@demo_user_id, @credit_id, @home_cat, 'EXPENSE', 67.30, DATE_SUB(NOW(), INTERVAL 28 DAY), 'HomeDepot - Light Fixtures',  DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(@demo_user_id, @credit_id, @home_cat, 'EXPENSE', 45.99, DATE_SUB(NOW(), INTERVAL 11 DAY), 'Amazon - Cleaning Supplies',  DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY));

-- ENTERTAINMENT (13 transactions)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description,  created_at, updated_at) VALUES
-- Streaming Services (monthly subscriptions)
(@demo_user_id, @credit_id, @streaming_cat, 'EXPENSE', 15.99, DATE_SUB(NOW(), INTERVAL 175 DAY), 'Netflix - Monthly Subscription',  DATE_SUB(NOW(), INTERVAL 175 DAY), DATE_SUB(NOW(), INTERVAL 175 DAY)),
(@demo_user_id, @credit_id, @streaming_cat, 'EXPENSE', 15.99, DATE_SUB(NOW(), INTERVAL 145 DAY), 'Netflix - Monthly Subscription',  DATE_SUB(NOW(), INTERVAL 145 DAY), DATE_SUB(NOW(), INTERVAL 145 DAY)),
(@demo_user_id, @credit_id, @streaming_cat, 'EXPENSE', 15.99, DATE_SUB(NOW(), INTERVAL 115 DAY), 'Netflix - Monthly Subscription',  DATE_SUB(NOW(), INTERVAL 115 DAY), DATE_SUB(NOW(), INTERVAL 115 DAY)),
(@demo_user_id, @credit_id, @streaming_cat, 'EXPENSE', 15.99, DATE_SUB(NOW(), INTERVAL 85 DAY), 'Netflix - Monthly Subscription',  DATE_SUB(NOW(), INTERVAL 85 DAY), DATE_SUB(NOW(), INTERVAL 85 DAY)),
(@demo_user_id, @credit_id, @streaming_cat, 'EXPENSE', 15.99, DATE_SUB(NOW(), INTERVAL 55 DAY), 'Netflix - Monthly Subscription',  DATE_SUB(NOW(), INTERVAL 55 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY)),
(@demo_user_id, @credit_id, @streaming_cat, 'EXPENSE', 15.99, DATE_SUB(NOW(), INTERVAL 25 DAY), 'Netflix - Monthly Subscription',  DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
(@demo_user_id, @credit_id, @streaming_cat, 'EXPENSE', 10.99, DATE_SUB(NOW(), INTERVAL 157 DAY), 'Spotify Premium - Monthly',  DATE_SUB(NOW(), INTERVAL 157 DAY), DATE_SUB(NOW(), INTERVAL 157 DAY)),
(@demo_user_id, @credit_id, @streaming_cat, 'EXPENSE', 10.99, DATE_SUB(NOW(), INTERVAL 97 DAY), 'Spotify Premium - Monthly',  DATE_SUB(NOW(), INTERVAL 97 DAY), DATE_SUB(NOW(), INTERVAL 97 DAY)),
(@demo_user_id, @credit_id, @streaming_cat, 'EXPENSE', 10.99, DATE_SUB(NOW(), INTERVAL 37 DAY), 'Spotify Premium - Monthly',  DATE_SUB(NOW(), INTERVAL 37 DAY), DATE_SUB(NOW(), INTERVAL 37 DAY)),

-- Movies & Concerts
(@demo_user_id, @cash_id, @movies_cat, 'EXPENSE', 34.50, DATE_SUB(NOW(), INTERVAL 133 DAY), 'Movie Tickets - 2 Adults',  DATE_SUB(NOW(), INTERVAL 133 DAY), DATE_SUB(NOW(), INTERVAL 133 DAY)),
(@demo_user_id, @credit_id, @movies_cat, 'EXPENSE', 187.50, DATE_SUB(NOW(), INTERVAL 98 DAY), 'Concert Tickets - Rock Band',  DATE_SUB(NOW(), INTERVAL 98 DAY), DATE_SUB(NOW(), INTERVAL 98 DAY)),

-- Hobbies
(@demo_user_id, @credit_id, @hobbies_cat, 'EXPENSE', 67.99, DATE_SUB(NOW(), INTERVAL 121 DAY), 'Amazon - Board Games',  DATE_SUB(NOW(), INTERVAL 121 DAY), DATE_SUB(NOW(), INTERVAL 121 DAY)),
(@demo_user_id, @credit_id, @hobbies_cat, 'EXPENSE', 89.50, DATE_SUB(NOW(), INTERVAL 64 DAY), 'Art Supply Store - Painting Materials',  DATE_SUB(NOW(), INTERVAL 64 DAY), DATE_SUB(NOW(), INTERVAL 64 DAY));

-- HEALTHCARE & INSURANCE (10 transactions)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description,  created_at, updated_at) VALUES
-- Healthcare
(@demo_user_id, @checking_id, @healthcare_cat, 'EXPENSE', 45.00, DATE_SUB(NOW(), INTERVAL 159 DAY), 'Doctor Co-pay - Annual Checkup',  DATE_SUB(NOW(), INTERVAL 159 DAY), DATE_SUB(NOW(), INTERVAL 159 DAY)),
(@demo_user_id, @checking_id, @healthcare_cat, 'EXPENSE', 23.50, DATE_SUB(NOW(), INTERVAL 151 DAY), 'Pharmacy - Prescription Refill',  DATE_SUB(NOW(), INTERVAL 151 DAY), DATE_SUB(NOW(), INTERVAL 151 DAY)),
(@demo_user_id, @checking_id, @healthcare_cat, 'EXPENSE', 125.00, DATE_SUB(NOW(), INTERVAL 113 DAY), 'Dentist - Cleaning & Exam',  DATE_SUB(NOW(), INTERVAL 113 DAY), DATE_SUB(NOW(), INTERVAL 113 DAY)),
(@demo_user_id, @checking_id, @healthcare_cat, 'EXPENSE', 18.75, DATE_SUB(NOW(), INTERVAL 79 DAY), 'Pharmacy - Over-the-counter Meds',  DATE_SUB(NOW(), INTERVAL 79 DAY), DATE_SUB(NOW(), INTERVAL 79 DAY)),
(@demo_user_id, @checking_id, @healthcare_cat, 'EXPENSE', 35.00, DATE_SUB(NOW(), INTERVAL 47 DAY), 'Doctor Co-pay - Follow-up',  DATE_SUB(NOW(), INTERVAL 47 DAY), DATE_SUB(NOW(), INTERVAL 47 DAY)),

-- Insurance (monthly health insurance premium)
(@demo_user_id, @checking_id, @insurance_cat, 'EXPENSE', 285.00, DATE_SUB(NOW(), INTERVAL 170 DAY), 'Health Insurance Premium - May',  DATE_SUB(NOW(), INTERVAL 170 DAY), DATE_SUB(NOW(), INTERVAL 170 DAY)),
(@demo_user_id, @checking_id, @insurance_cat, 'EXPENSE', 285.00, DATE_SUB(NOW(), INTERVAL 140 DAY), 'Health Insurance Premium - June',  DATE_SUB(NOW(), INTERVAL 140 DAY), DATE_SUB(NOW(), INTERVAL 140 DAY)),
(@demo_user_id, @checking_id, @insurance_cat, 'EXPENSE', 285.00, DATE_SUB(NOW(), INTERVAL 110 DAY), 'Health Insurance Premium - July',  DATE_SUB(NOW(), INTERVAL 110 DAY), DATE_SUB(NOW(), INTERVAL 110 DAY)),
(@demo_user_id, @checking_id, @insurance_cat, 'EXPENSE', 285.00, DATE_SUB(NOW(), INTERVAL 80 DAY), 'Health Insurance Premium - August',  DATE_SUB(NOW(), INTERVAL 80 DAY), DATE_SUB(NOW(), INTERVAL 80 DAY)),
(@demo_user_id, @checking_id, @insurance_cat, 'EXPENSE', 285.00, DATE_SUB(NOW(), INTERVAL 50 DAY), 'Health Insurance Premium - September',  DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY));

-- PERSONAL CARE (6 transactions)
INSERT INTO transactions (user_id, account_id, category_id, transaction_type, amount, transaction_date, description,  created_at, updated_at) VALUES
(@demo_user_id, @cash_id, @personal_cat, 'EXPENSE', 45.00, DATE_SUB(NOW(), INTERVAL 162 DAY), 'Haircut',  DATE_SUB(NOW(), INTERVAL 162 DAY), DATE_SUB(NOW(), INTERVAL 162 DAY)),
(@demo_user_id, @cash_id, @personal_cat, 'EXPENSE', 45.00, DATE_SUB(NOW(), INTERVAL 132 DAY), 'Haircut',  DATE_SUB(NOW(), INTERVAL 132 DAY), DATE_SUB(NOW(), INTERVAL 132 DAY)),
(@demo_user_id, @cash_id, @personal_cat, 'EXPENSE', 45.00, DATE_SUB(NOW(), INTERVAL 102 DAY), 'Haircut',  DATE_SUB(NOW(), INTERVAL 102 DAY), DATE_SUB(NOW(), INTERVAL 102 DAY)),
(@demo_user_id, @cash_id, @personal_cat, 'EXPENSE', 45.00, DATE_SUB(NOW(), INTERVAL 72 DAY), 'Haircut',  DATE_SUB(NOW(), INTERVAL 72 DAY), DATE_SUB(NOW(), INTERVAL 72 DAY)),
(@demo_user_id, @credit_id, @personal_cat, 'EXPENSE', 34.99, DATE_SUB(NOW(), INTERVAL 129 DAY), 'Target - Toiletries & Personal Care',  DATE_SUB(NOW(), INTERVAL 129 DAY), DATE_SUB(NOW(), INTERVAL 129 DAY)),
(@demo_user_id, @credit_id, @personal_cat, 'EXPENSE', 27.85, DATE_SUB(NOW(), INTERVAL 61 DAY), 'CVS - Personal Care Products',  DATE_SUB(NOW(), INTERVAL 61 DAY), DATE_SUB(NOW(), INTERVAL 61 DAY));
