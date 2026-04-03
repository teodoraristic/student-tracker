import { isValidRedirectUrl, ALLOWED_INTERNAL_ROUTES } from './redirectValidator';

/**
 * Test cases demonstrating the redirect validator
 * Run with: npm test -- redirectValidator.test.js
 */

describe('Redirect Validator', () => {
  describe('Valid internal routes', () => {
    test('allows static routes', () => {
      expect(isValidRedirectUrl('/home')).toBe(true);
      expect(isValidRedirectUrl('/login')).toBe(true);
      expect(isValidRedirectUrl('/register')).toBe(true);
      expect(isValidRedirectUrl('/subjects')).toBe(true);
      expect(isValidRedirectUrl('/profile')).toBe(true);
    });

    test('allows dynamic routes with valid params', () => {
      expect(isValidRedirectUrl('/subjects/1')).toBe(true);
      expect(isValidRedirectUrl('/subjects/123')).toBe(true);
      expect(isValidRedirectUrl('/subjects/test-subject-slug')).toBe(true);
    });

    test('handles whitespace', () => {
      expect(isValidRedirectUrl('  /home  ')).toBe(true);
      expect(isValidRedirectUrl('\t/login\n')).toBe(true);
    });
  });

  describe('Invalid/blocked redirects', () => {
    test('blocks external URLs', () => {
      expect(isValidRedirectUrl('https://evil.com')).toBe(false);
      expect(isValidRedirectUrl('http://attacker.com')).toBe(false);
      expect(isValidRedirectUrl('//evil.com')).toBe(false);
      expect(isValidRedirectUrl('ftp://evil.com')).toBe(false);
    });

    test('blocks javascript protocols', () => {
      expect(isValidRedirectUrl('javascript:alert("xss")')).toBe(false);
      expect(isValidRedirectUrl('JAVASCRIPT:void(0)')).toBe(false);
    });

    test('blocks data URLs', () => {
      expect(isValidRedirectUrl('data:text/html,<script>alert("xss")</script>')).toBe(false);
      expect(isValidRedirectUrl('DATA:image/gif;base64,R0lGOD')).toBe(false);
    });

    test('blocks null/undefined', () => {
      expect(isValidRedirectUrl(null)).toBe(false);
      expect(isValidRedirectUrl(undefined)).toBe(false);
      expect(isValidRedirectUrl('')).toBe(false);
    });

    test('blocks non-string values', () => {
      expect(isValidRedirectUrl(123)).toBe(false);
      expect(isValidRedirectUrl({})).toBe(false);
      expect(isValidRedirectUrl([])).toBe(false);
    });

    test('blocks routes not in allowlist', () => {
      expect(isValidRedirectUrl('/admin')).toBe(false);
      expect(isValidRedirectUrl('/secret')).toBe(false);
      expect(isValidRedirectUrl('/subjects/1/edit')).toBe(false);
    });
  });

  describe('Custom allowlist', () => {
    test('uses custom allowlist when provided', () => {
      const customList = ['/home', '/custom-page'];
      expect(isValidRedirectUrl('/home', customList)).toBe(true);
      expect(isValidRedirectUrl('/custom-page', customList)).toBe(true);
      expect(isValidRedirectUrl('/login', customList)).toBe(false);
    });
  });
});
