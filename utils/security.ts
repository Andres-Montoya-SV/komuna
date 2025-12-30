/**
 * Security utilities for sanitizing user input and preventing XSS attacks
 */

/**
 * Sanitizes a string by removing potentially dangerous HTML/script tags
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove script-related content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validates and sanitizes a search query
 */
export function sanitizeSearchQuery(query: string): string {
  const sanitized = sanitizeInput(query);

  // Limit length to prevent DoS
  const maxLength = 100;
  return sanitized.slice(0, maxLength);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates that a string contains only alphanumeric characters and common punctuation
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Allow letters, spaces, hyphens, apostrophes (for names like O'Connor)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(name.trim()) && name.trim().length >= 2;
}

/**
 * Validates zip code format (basic US/international format)
 */
export function isValidZipCode(zipCode: string): boolean {
  if (!zipCode || typeof zipCode !== 'string') {
    return false;
  }

  // Allow alphanumeric zip codes (e.g., US: 12345, UK: SW1A 1AA)
  const zipRegex = /^[A-Z0-9\s-]{4,10}$/i;
  return zipRegex.test(zipCode.trim());
}

/**
 * Validates price value to prevent negative numbers or extremely large values
 */
export function isValidPrice(price: number): boolean {
  if (typeof price !== 'number' || isNaN(price)) {
    return false;
  }

  return price >= 0 && price <= 999999.99;
}

/**
 * Escapes HTML entities to prevent XSS
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Validates that quantity is a positive integer within reasonable bounds
 */
export function isValidQuantity(quantity: number): boolean {
  if (!Number.isInteger(quantity)) {
    return false;
  }

  return quantity > 0 && quantity <= 999;
}
