/**
 * Security utilities for the fitness tracker application
 * Provides protection against XSS, CSRF, and other common vulnerabilities
 */

// XSS Protection
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  // First, remove script tags and their content completely
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove iframe, object, and embed tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // Remove event handlers from tags (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // Check for malicious protocols - if entire input is a protocol call, remove it completely
  if (/^(javascript|data|vbscript):/i.test(input)) {
    return '';
  }

  // Remove javascript:, data:, and vbscript: protocols from anywhere in the string
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');

  const result = sanitized.trim();
  
  // If result would be empty after protocol removal, return empty string
  if (!result) return '';
  
  return result;
};

export const sanitizeHtml = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, ''); // Remove vbscript: protocol
};

// Input Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const sanitized = sanitizeInput(name);
  return sanitized.length >= 2 && sanitized.length <= 50 && /^[a-zA-Z\s\-'\.]+$/.test(sanitized);
};

export const validateWorkoutPlanName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const sanitized = sanitizeInput(name);
  return sanitized.length >= 3 && sanitized.length <= 100;
};

export const validateGoalTitle = (title: string): boolean => {
  if (!title || typeof title !== 'string') return false;
  
  const sanitized = sanitizeInput(title);
  return sanitized.length >= 3 && sanitized.length <= 100;
};

// CSRF Protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};

// Rate Limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const checkRateLimit = (
  key: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowMs
    };
  }
  
  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetTime: entry.resetTime
  };
};

// Content Security Policy
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.googleapis.com https://*.firebase.com https://*.firebaseapp.com wss://*.firebase.com",
    "frame-src 'self' https://*.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

// Secure Headers
export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': getCSPHeader(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
};

// Input Sanitization for different data types
export const sanitizeWorkoutData = (data: any) => {
  if (!data || typeof data !== 'object') return {};
  
  const sanitized: any = {};
  
  if (data.name) {
    sanitized.name = sanitizeInput(data.name);
  }
  
  if (data.description) {
    sanitized.description = sanitizeInput(data.description);
  }
  
  if (data.exercises && Array.isArray(data.exercises)) {
    sanitized.exercises = data.exercises.map((exercise: any) => ({
      ...exercise,
      name: sanitizeInput(exercise.name || ''),
      notes: sanitizeInput(exercise.notes || '')
    }));
  }
  
  // Validate numeric fields
  if (typeof data.duration === 'number' && data.duration > 0 && data.duration <= 480) {
    sanitized.duration = data.duration;
  }
  
  if (typeof data.difficulty === 'string' && ['beginner', 'intermediate', 'advanced'].includes(data.difficulty)) {
    sanitized.difficulty = data.difficulty;
  }
  
  if (typeof data.category === 'string' && data.category.length <= 50) {
    sanitized.category = sanitizeInput(data.category);
  }
  
  return sanitized;
};

export const sanitizeGoalData = (data: any) => {
  if (!data || typeof data !== 'object') return {};
  
  const sanitized: any = {};
  
  if (data.title) {
    sanitized.title = sanitizeInput(data.title);
  }
  
  if (data.description) {
    sanitized.description = sanitizeInput(data.description);
  }
  
  if (typeof data.targetValue === 'number' && data.targetValue > 0) {
    sanitized.targetValue = data.targetValue;
  }
  
  if (typeof data.currentValue === 'number' && data.currentValue >= 0) {
    sanitized.currentValue = data.currentValue;
  }
  
  if (typeof data.priority === 'string' && ['low', 'medium', 'high'].includes(data.priority)) {
    sanitized.priority = data.priority;
  }
  
  if (typeof data.type === 'string' && ['weight', 'reps', 'time', 'distance', 'other'].includes(data.type)) {
    sanitized.type = data.type;
  }
  
  return sanitized;
};

// Session Security
export const generateSecureSessionId = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// File Upload Security
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'Invalid file extension' };
  }
  
  return { isValid: true };
};

// Environment Security
export const isSecureEnvironment = (): boolean => {
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

// Logging Security Events
export const logSecurityEvent = (event: string, details: any) => {
  console.warn(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    details
  });
};
