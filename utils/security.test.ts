import {
  sanitizeInput,
  sanitizeSearchQuery,
  isValidEmail,
  isValidName,
  isValidZipCode,
  isValidPrice,
  escapeHtml,
  isValidQuantity,
} from './security';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('removes javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    });

    it('removes event handlers', () => {
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('sanitizes and limits length', () => {
      const longString = 'a'.repeat(200);
      const result = sanitizeSearchQuery(longString);
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('removes dangerous content', () => {
      expect(sanitizeSearchQuery('<script>test</script>')).toBe('test');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('validates correct name', () => {
      expect(isValidName('John Doe')).toBe(true);
    });

    it('rejects names with numbers', () => {
      expect(isValidName('John123')).toBe(false);
    });
  });

  describe('isValidZipCode', () => {
    it('validates US zip code', () => {
      expect(isValidZipCode('12345')).toBe(true);
    });

    it('validates UK postcode format', () => {
      expect(isValidZipCode('SW1A 1AA')).toBe(true);
    });
  });

  describe('isValidPrice', () => {
    it('validates correct price', () => {
      expect(isValidPrice(29.99)).toBe(true);
    });

    it('rejects negative prices', () => {
      expect(isValidPrice(-10)).toBe(false);
    });
  });

  describe('escapeHtml', () => {
    it('escapes HTML entities', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });
  });

  describe('isValidQuantity', () => {
    it('validates correct quantity', () => {
      expect(isValidQuantity(5)).toBe(true);
    });

    it('rejects negative quantities', () => {
      expect(isValidQuantity(-1)).toBe(false);
    });
  });
});
