import { describe, it, expect, vi } from 'vitest';
import { 
  sanitizeInput, 
  validateEmail, 
  validatePassword, 
  validateName,
  checkRateLimit,
  generateCSRFToken,
  validateCSRFToken
} from '../lib/security';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove dangerous HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeInput(input);
      expect(result).toBe('<div>Click me</div>');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeInput(input);
      expect(result).toBe('');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should preserve safe content', () => {
      const input = 'Hello World! This is safe content.';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World! This is safe content.');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('test123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should require uppercase letters', () => {
      const result = validatePassword('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should require lowercase letters', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should require numbers', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should require special characters', () => {
      const result = validatePassword('NoSpecial123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject common passwords', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is too common. Please choose a more unique password');
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      expect(validateName('John Doe')).toBe(true);
      expect(validateName("O'Connor")).toBe(true);
      expect(validateName('Jean-Pierre')).toBe(true);
      expect(validateName('Dr. Smith')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(validateName('')).toBe(false);
      expect(validateName('J')).toBe(false); // Too short
      expect(validateName('John123')).toBe(false); // Contains numbers
      expect(validateName('John@Doe')).toBe(false); // Contains special chars
    });

    it('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      expect(validateName(longName)).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('test-key', 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block after exceeding limit', () => {
      const key = 'test-key-limit';
      
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 5, 60000);
      }
      
      // 6th request should be blocked
      const result = checkRateLimit(key, 5, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      const key = 'test-key-reset';
      
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 5, 100); // Very short window
      }
      
      // Wait for window to expire
      setTimeout(() => {
        const result = checkRateLimit(key, 5, 100);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
      }, 150);
    });
  });

  describe('CSRF Token Functions', () => {
    it('should generate valid CSRF token', () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('should validate correct CSRF token', () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken(token, token)).toBe(true);
    });

    it('should reject invalid CSRF token', () => {
      const token = generateCSRFToken();
      const wrongToken = 'wrong-token';
      expect(validateCSRFToken(token, wrongToken)).toBe(false);
    });

    it('should reject malformed CSRF token', () => {
      expect(validateCSRFToken('short', 'short')).toBe(false);
      expect(validateCSRFToken('', '')).toBe(false);
    });
  });
});
