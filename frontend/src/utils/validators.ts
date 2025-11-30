/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Returns true if password meets minimum requirements
 */
export function isValidPassword(password: string): boolean {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);
}

/**
 * Get password strength level
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';
  
  let strength = 0;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  if (password.length >= 12) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

/**
 * Validate amount (must be positive number)
 */
export function isValidAmount(amount: number | string): boolean {
  const num = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  return !Number.isNaN(num) && num > 0;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !Number.isNaN(date.getTime());
}

/**
 * Validate required field
 */
export function isRequired(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Validate min length
 */
export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}

/**
 * Validate max length
 */
export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Validate min value
 */
export function minValue(value: number, min: number): boolean {
  return value >= min;
}

/**
 * Validate max value
 */
export function maxValue(value: number, max: number): boolean {
  return value <= max;
}

/**
 * Validate phone number (basic international format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?\(?\d{1,4}\)?[-\s./\d]*$/;
  return phoneRegex.test(phone) && phone.replaceAll(/\D/g, '').length >= 10;
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize input string (remove potentially harmful characters)
 */
export function sanitizeString(input: string): string {
  return input.replaceAll(/[<>]/g, '');
}
