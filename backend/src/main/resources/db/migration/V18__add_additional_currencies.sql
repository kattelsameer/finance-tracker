-- =====================================================
-- V18: Add additional currencies including NPR
-- Extends V13 with currencies used by the UI defaults
-- =====================================================

-- Add NPR and other commonly used currencies if they don't already exist
INSERT IGNORE INTO currencies (code, name, symbol, exchange_rate, is_base_currency, is_active)
VALUES
    ('NPR', 'Nepalese Rupee',      'रू',   132.50, FALSE, TRUE),
    ('NZD', 'New Zealand Dollar',  'NZ$',    1.63,  FALSE, TRUE),
    ('SGD', 'Singapore Dollar',    'S$',     1.34,  FALSE, TRUE),
    ('HKD', 'Hong Kong Dollar',    'HK$',    7.82,  FALSE, TRUE),
    ('KRW', 'South Korean Won',    '₩',   1328.00,  FALSE, TRUE),
    ('BRL', 'Brazilian Real',      'R$',     4.95,  FALSE, TRUE),
    ('ZAR', 'South African Rand',  'R',     18.75,  FALSE, TRUE),
    ('AED', 'UAE Dirham',          'د.إ',    3.67,  FALSE, TRUE),
    ('THB', 'Thai Baht',           '฿',     35.50,  FALSE, TRUE),
    ('IDR', 'Indonesian Rupiah',   'Rp',  15750.00,  FALSE, TRUE);
