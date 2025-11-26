-- =====================================================
-- V12: Seed default categories
-- =====================================================

-- System expense categories (user_id = NULL for system defaults)
INSERT INTO categories (user_id, category_name, category_type, color_code, icon, is_system, display_order) VALUES
    (NULL, 'Housing', 'EXPENSE', '#ef4444', 'home', TRUE, 1),
    (NULL, 'Transportation', 'EXPENSE', '#f97316', 'car', TRUE, 2),
    (NULL, 'Food & Dining', 'EXPENSE', '#eab308', 'utensils', TRUE, 3),
    (NULL, 'Utilities', 'EXPENSE', '#84cc16', 'zap', TRUE, 4),
    (NULL, 'Healthcare', 'EXPENSE', '#22c55e', 'heart', TRUE, 5),
    (NULL, 'Insurance', 'EXPENSE', '#14b8a6', 'shield', TRUE, 6),
    (NULL, 'Entertainment', 'EXPENSE', '#06b6d4', 'film', TRUE, 7),
    (NULL, 'Shopping', 'EXPENSE', '#3b82f6', 'shopping-bag', TRUE, 8),
    (NULL, 'Personal Care', 'EXPENSE', '#6366f1', 'user', TRUE, 9),
    (NULL, 'Education', 'EXPENSE', '#8b5cf6', 'book', TRUE, 10),
    (NULL, 'Gifts & Donations', 'EXPENSE', '#a855f7', 'gift', TRUE, 11),
    (NULL, 'Travel', 'EXPENSE', '#d946ef', 'plane', TRUE, 12),
    (NULL, 'Subscriptions', 'EXPENSE', '#ec4899', 'repeat', TRUE, 13),
    (NULL, 'Taxes', 'EXPENSE', '#f43f5e', 'file-text', TRUE, 14),
    (NULL, 'Other Expense', 'EXPENSE', '#64748b', 'more-horizontal', TRUE, 15);

-- System income categories
INSERT INTO categories (user_id, category_name, category_type, color_code, icon, is_system, display_order) VALUES
    (NULL, 'Salary', 'INCOME', '#22c55e', 'briefcase', TRUE, 1),
    (NULL, 'Freelance', 'INCOME', '#14b8a6', 'laptop', TRUE, 2),
    (NULL, 'Investments', 'INCOME', '#06b6d4', 'trending-up', TRUE, 3),
    (NULL, 'Rental Income', 'INCOME', '#3b82f6', 'home', TRUE, 4),
    (NULL, 'Business', 'INCOME', '#6366f1', 'building', TRUE, 5),
    (NULL, 'Bonus', 'INCOME', '#8b5cf6', 'award', TRUE, 6),
    (NULL, 'Gifts Received', 'INCOME', '#a855f7', 'gift', TRUE, 7),
    (NULL, 'Refunds', 'INCOME', '#d946ef', 'rotate-ccw', TRUE, 8),
    (NULL, 'Other Income', 'INCOME', '#64748b', 'more-horizontal', TRUE, 9);

-- Add subcategories for Food & Dining
SET @food_id = (SELECT id FROM categories WHERE category_name = 'Food & Dining' AND is_system = TRUE);
INSERT INTO categories (user_id, parent_id, category_name, category_type, color_code, icon, is_system, display_order) VALUES
    (NULL, @food_id, 'Groceries', 'EXPENSE', '#eab308', 'shopping-cart', TRUE, 1),
    (NULL, @food_id, 'Restaurants', 'EXPENSE', '#eab308', 'utensils', TRUE, 2),
    (NULL, @food_id, 'Coffee Shops', 'EXPENSE', '#eab308', 'coffee', TRUE, 3),
    (NULL, @food_id, 'Fast Food', 'EXPENSE', '#eab308', 'package', TRUE, 4);

-- Add subcategories for Transportation
SET @transport_id = (SELECT id FROM categories WHERE category_name = 'Transportation' AND is_system = TRUE);
INSERT INTO categories (user_id, parent_id, category_name, category_type, color_code, icon, is_system, display_order) VALUES
    (NULL, @transport_id, 'Gas & Fuel', 'EXPENSE', '#f97316', 'droplet', TRUE, 1),
    (NULL, @transport_id, 'Public Transit', 'EXPENSE', '#f97316', 'train', TRUE, 2),
    (NULL, @transport_id, 'Parking', 'EXPENSE', '#f97316', 'square', TRUE, 3),
    (NULL, @transport_id, 'Car Maintenance', 'EXPENSE', '#f97316', 'tool', TRUE, 4),
    (NULL, @transport_id, 'Ride Share', 'EXPENSE', '#f97316', 'navigation', TRUE, 5);

-- Add subcategories for Housing
SET @housing_id = (SELECT id FROM categories WHERE category_name = 'Housing' AND is_system = TRUE);
INSERT INTO categories (user_id, parent_id, category_name, category_type, color_code, icon, is_system, display_order) VALUES
    (NULL, @housing_id, 'Rent/Mortgage', 'EXPENSE', '#ef4444', 'home', TRUE, 1),
    (NULL, @housing_id, 'Property Tax', 'EXPENSE', '#ef4444', 'file-text', TRUE, 2),
    (NULL, @housing_id, 'Home Maintenance', 'EXPENSE', '#ef4444', 'tool', TRUE, 3),
    (NULL, @housing_id, 'Home Improvement', 'EXPENSE', '#ef4444', 'hammer', TRUE, 4);
