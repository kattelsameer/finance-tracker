-- =====================================================
-- Demo Categories and Tags - Finance Tracker Demo Mode
-- Creates custom subcategories and tags for demo user
-- =====================================================

-- Retrieve demo user ID
SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@example.com');

-- Get system category IDs for parent references
SET @food_cat = (SELECT id FROM categories WHERE category_name = 'Food & Dining' AND is_system = TRUE LIMIT 1);
SET @transport_cat = (SELECT id FROM categories WHERE category_name = 'Transportation' AND is_system = TRUE LIMIT 1);
SET @shopping_cat = (SELECT id FROM categories WHERE category_name = 'Shopping' AND is_system = TRUE LIMIT 1);
SET @entertainment_cat = (SELECT id FROM categories WHERE category_name = 'Entertainment' AND is_system = TRUE LIMIT 1);
SET @utilities_cat = (SELECT id FROM categories WHERE category_name = 'Utilities' AND is_system = TRUE LIMIT 1);
SET @healthcare_cat = (SELECT id FROM categories WHERE category_name = 'Healthcare' AND is_system = TRUE LIMIT 1);
SET @salary_cat = (SELECT id FROM categories WHERE category_name = 'Salary' AND is_system = TRUE LIMIT 1);
SET @investment_cat = (SELECT id FROM categories WHERE category_name = 'Investment Income' AND is_system = TRUE LIMIT 1);

-- Custom Subcategories for Food & Dining
INSERT INTO categories (user_id, parent_id, category_name, category_type, icon, color_code, display_order, created_at) VALUES
(@demo_user_id, @food_cat, 'Coffee Shops', 'EXPENSE', 'coffee', '#EF4444', 1, NOW()),
(@demo_user_id, @food_cat, 'Fast Food', 'EXPENSE', 'hamburger', '#EF4444', 2, NOW()),
(@demo_user_id, @food_cat, 'Restaurants', 'EXPENSE', 'utensils', '#EF4444', 3, NOW()),
(@demo_user_id, @food_cat, 'Groceries', 'EXPENSE', 'shopping-cart', '#EF4444', 4, NOW());

-- Custom Subcategories for Transportation
INSERT INTO categories (user_id, parent_id, category_name, category_type, icon, color_code, display_order, created_at) VALUES
(@demo_user_id, @transport_cat, 'Gas & Fuel', 'EXPENSE', 'fuel', '#F97316', 1, NOW()),
(@demo_user_id, @transport_cat, 'Public Transit', 'EXPENSE', 'train', '#F97316', 2, NOW()),
(@demo_user_id, @transport_cat, 'Parking', 'EXPENSE', 'parking', '#F97316', 3, NOW()),
(@demo_user_id, @transport_cat, 'Car Maintenance', 'EXPENSE', 'wrench', '#F97316', 4, NOW());

-- Custom Subcategories for Shopping
INSERT INTO categories (user_id, parent_id, category_name, category_type, icon, color_code, display_order, created_at) VALUES
(@demo_user_id, @shopping_cat, 'Clothing', 'EXPENSE', 'shirt', '#EC4899', 1, NOW()),
(@demo_user_id, @shopping_cat, 'Electronics', 'EXPENSE', 'laptop', '#EC4899', 2, NOW()),
(@demo_user_id, @shopping_cat, 'Home & Garden', 'EXPENSE', 'home', '#EC4899', 3, NOW());

-- Custom Subcategories for Entertainment
INSERT INTO categories (user_id, parent_id, category_name, category_type, icon, color_code, display_order, created_at) VALUES
(@demo_user_id, @entertainment_cat, 'Streaming Services', 'EXPENSE', 'film', '#8B5CF6', 1, NOW()),
(@demo_user_id, @entertainment_cat, 'Movies & Concerts', 'EXPENSE', 'ticket', '#8B5CF6', 2, NOW()),
(@demo_user_id, @entertainment_cat, 'Hobbies', 'EXPENSE', 'gamepad', '#8B5CF6', 3, NOW());

-- Demo Tags
INSERT INTO tags (user_id, tag_name, color_code, created_at) VALUES
(@demo_user_id, 'Work Related', '#3B82F6', NOW()),
(@demo_user_id, 'Tax Deductible', '#10B981', NOW()),
(@demo_user_id, 'Vacation', '#F59E0B', NOW()),
(@demo_user_id, 'Emergency', '#EF4444', NOW()),
(@demo_user_id, 'Business Expense', '#6366F1', NOW()),
(@demo_user_id, 'Gift', '#EC4899', NOW()),
(@demo_user_id, 'Reimbursable', '#14B8A6', NOW());

-- Store custom category IDs for transaction references
SET @coffee_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Coffee Shops');
SET @fastfood_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Fast Food');
SET @restaurants_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Restaurants');
SET @groceries_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Groceries');
SET @gas_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Gas & Fuel');
SET @transit_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Public Transit');
SET @parking_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Parking');
SET @maintenance_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Car Maintenance');
SET @clothing_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Clothing');
SET @electronics_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Electronics');
SET @home_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Home & Garden');
SET @streaming_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Streaming Services');
SET @movies_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Movies & Concerts');
SET @hobbies_cat = (SELECT id FROM categories WHERE user_id = @demo_user_id AND category_name = 'Hobbies');
