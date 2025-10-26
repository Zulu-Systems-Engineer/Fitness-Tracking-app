/**
 * Enhanced form validation with security measures
 */

import { useState, useCallback } from 'react';
import { 
  validateEmail, 
  validatePassword, 
  validateName,
  validateWorkoutPlanName,
  validateGoalTitle,
  sanitizeInput,
  logSecurityEvent
} from '../../lib/security';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  sanitize?: boolean;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormErrors {
  [key: string]: string;
}

interface UseSecureFormValidationReturn {
  errors: FormErrors;
  validateField: (name: string, value: any) => string | null;
  validateForm: (data: Record<string, any>) => boolean;
  clearError: (name: string) => void;
  clearAllErrors: () => void;
  setError: (name: string, message: string) => void;
  sanitizeField: (name: string, value: any) => any;
}

export const useSecureFormValidation = (rules: ValidationRules): UseSecureFormValidationReturn => {
  const [errors, setErrors] = useState<FormErrors>({});

  const sanitizeField = useCallback((name: string, value: any): any => {
    const rule = rules[name];
    if (!rule || !rule.sanitize) return value;
    
    if (typeof value === 'string') {
      return sanitizeInput(value);
    }
    
    return value;
  }, [rules]);

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    // Sanitize value if required
    const sanitizedValue = sanitizeField(name, value);

    // Required validation
    if (rule.required && (!sanitizedValue || (typeof sanitizedValue === 'string' && sanitizedValue.trim() === ''))) {
      return `${name} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!sanitizedValue || (typeof sanitizedValue === 'string' && sanitizedValue.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof sanitizedValue === 'string' && sanitizedValue.length < rule.minLength) {
      return `${name} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && typeof sanitizedValue === 'string' && sanitizedValue.length > rule.maxLength) {
      return `${name} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && typeof sanitizedValue === 'string' && !rule.pattern.test(sanitizedValue)) {
      return `${name} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(sanitizedValue);
    }

    return null;
  }, [rules, sanitizeField]);

  const validateForm = useCallback((data: Record<string, any>): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    if (!isValid) {
      logSecurityEvent('Form Validation Failed', {
        errors: newErrors,
        fields: Object.keys(data)
      });
    }

    return isValid;
  }, [rules, validateField]);

  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((name: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: message,
    }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    setError,
    sanitizeField,
  };
};

// Predefined validation rules for common form fields
export const validationRules = {
  email: {
    required: true,
    minLength: 5,
    maxLength: 254,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    sanitize: true,
    custom: (value: string) => {
      if (!validateEmail(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    sanitize: true,
    custom: (value: string) => {
      const result = validatePassword(value);
      if (!result.isValid) {
        return result.errors[0]; // Return first error
      }
      return null;
    }
  },
  
  confirmPassword: {
    required: true,
    sanitize: true,
    custom: (value: string) => {
      // This will be validated against the password field in the form
      return null;
    }
  },
  
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    sanitize: true,
    custom: (value: string) => {
      if (!validateName(value)) {
        return 'Please enter a valid name (letters, spaces, hyphens, apostrophes, and periods only)';
      }
      return null;
    }
  },
  
  workoutPlanName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    sanitize: true,
    custom: (value: string) => {
      if (!validateWorkoutPlanName(value)) {
        return 'Please enter a valid workout plan name';
      }
      return null;
    }
  },
  
  goalTitle: {
    required: true,
    minLength: 3,
    maxLength: 100,
    sanitize: true,
    custom: (value: string) => {
      if (!validateGoalTitle(value)) {
        return 'Please enter a valid goal title';
      }
      return null;
    }
  },
  
  description: {
    required: false,
    maxLength: 500,
    sanitize: true,
    custom: (value: string) => {
      if (value && value.length > 500) {
        return 'Description must be no more than 500 characters';
      }
      return null;
    }
  },
  
  duration: {
    required: true,
    custom: (value: number) => {
      if (!value || value < 1 || value > 480) {
        return 'Duration must be between 1 and 480 minutes';
      }
      return null;
    }
  },
  
  targetValue: {
    required: true,
    custom: (value: number) => {
      if (!value || value <= 0) {
        return 'Target value must be greater than 0';
      }
      return null;
    }
  },
  
  currentValue: {
    required: false,
    custom: (value: number) => {
      if (value !== undefined && value < 0) {
        return 'Current value cannot be negative';
      }
      return null;
    }
  }
};

// Form validation helpers
export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateTermsAcceptance = (accepted: boolean): string | null => {
  if (!accepted) {
    return 'You must accept the terms and conditions';
  }
  return null;
};

export const validateFileUpload = (file: File | null): string | null => {
  if (!file) {
    return 'Please select a file';
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return 'File size must be less than 5MB';
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, GIF, and WebP images are allowed';
  }
  
  return null;
};

// Security-focused form submission handler
export const createSecureSubmitHandler = <T extends Record<string, any>>(
  validationRules: ValidationRules,
  onSubmit: (data: T) => Promise<void>,
  onError?: (errors: FormErrors) => void
) => {
  return async (data: T) => {
    const { validateForm, sanitizeField } = useSecureFormValidation(validationRules);
    
    // Sanitize all form data
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = sanitizeField(key, data[key]);
      return acc;
    }, {} as T);
    
    // Validate form
    const isValid = validateForm(sanitizedData);
    
    if (!isValid) {
      logSecurityEvent('Form Submission Blocked', {
        reason: 'Validation failed',
        data: sanitizedData
      });
      onError?.(errors);
      return;
    }
    
    try {
      await onSubmit(sanitizedData);
    } catch (error) {
      logSecurityEvent('Form Submission Error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data: sanitizedData
      });
      throw error;
    }
  };
};
