/**
 * Currency display symbol overrides.
 * Intl.NumberFormat (en-US) outputs the ISO code (e.g. "NPR", "INR") for
 * many non-USD/EUR currencies. This map replaces those codes with the
 * preferred compact display symbol so the UI looks cleaner.
 * Internal currency codes are NEVER changed — only the rendered string.
 */
const CURRENCY_DISPLAY_SYMBOLS: Record<string, string> = {
  NPR: 'रू',   // Nepalese Rupee
  USD: '$',    // US Dollar
  EUR: '€',    // Euro
  GBP: '£',    // British Pound
  INR: '₹',    // Indian Rupee
  JPY: '¥',    // Japanese Yen
  CNY: '¥',    // Chinese Yuan
  AUD: 'A$',   // Australian Dollar
  CAD: 'C$',   // Canadian Dollar
  CHF: 'CHF',  // Swiss Franc
  NZD: 'NZ$',  // New Zealand Dollar
  SGD: 'S$',   // Singapore Dollar
  HKD: 'HK$',  // Hong Kong Dollar
  KRW: '₩',    // South Korean Won
  BRL: 'R$',   // Brazilian Real
  ZAR: 'R',    // South African Rand
  AED: 'د.إ',  // UAE Dirham
  THB: '฿',    // Thai Baht
  IDR: 'Rp',   // Indonesian Rupiah
  MXN: 'MX$',  // Mexican Peso
};

/**
 * Format currency amount with symbol and proper decimal places.
 * Uses Intl.NumberFormat for correct number formatting (thousands separator,
 * decimal places) then substitutes the display symbol from the map above.
 */
export function formatCurrency(amount: number, currency: string = 'NPR', locale: string = 'en-US'): string {
  const code = currency.toUpperCase();
  const displaySymbol = CURRENCY_DISPLAY_SYMBOLS[code];

  if (displaySymbol) {
    // Format as decimal so we control the symbol ourselves
    const formatted = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
    const sign = amount < 0 ? '-' : '';
    return `${sign}${displaySymbol} ${formatted}`;
  }

  // Fallback: let Intl handle currencies not in our map
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date to a readable string
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    return formatRelativeDate(dateObj);
  }
  
  const options: Intl.DateTimeFormatOptions = format === 'long'
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
    
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
