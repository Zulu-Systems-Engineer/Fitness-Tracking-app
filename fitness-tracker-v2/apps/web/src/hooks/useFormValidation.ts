import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormErrors {
  [key: string]: string | null;
}

interface UseFormValidationReturn {
  errors: FormErrors;
  validateField: (name: string, value: any) => string | null;
  validateForm: (data: Record<string, any>) => boolean;
  clearError: (name: string) => void;
  clearAllErrors: () => void;
  setError: (name: string, message: string) => void;
}

export const useFormValidation = (rules: ValidationRules): UseFormValidationReturn => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${name} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return `${name} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return `${name} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${name} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

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
  };
};


