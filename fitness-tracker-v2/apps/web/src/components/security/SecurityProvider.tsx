/**
 * Security middleware and components for the fitness tracker application
 */

import React, { useEffect, useState } from 'react';
import { 
  sanitizeInput, 
  validateEmail, 
  validatePassword, 
  validateName,
  checkRateLimit,
  logSecurityEvent,
  isSecureEnvironment
} from '../../lib/security';

// Security Context
interface SecurityContextType {
  isSecure: boolean;
  rateLimitInfo: { [key: string]: { remaining: number; resetTime: number } };
  reportSecurityEvent: (event: string, details: any) => void;
}

const SecurityContext = React.createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = React.useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// Security Provider Component
export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ [key: string]: { remaining: number; resetTime: number } }>({});

  useEffect(() => {
    // Check if running in secure environment
    setIsSecure(isSecureEnvironment());
    
    // Log security check
    logSecurityEvent('Environment Check', {
      isSecure: isSecureEnvironment(),
      protocol: window.location.protocol,
      hostname: window.location.hostname
    });
  }, []);

  const reportSecurityEvent = (event: string, details: any) => {
    logSecurityEvent(event, details);
  };

  const checkRateLimitForUser = (action: string, userId?: string) => {
    const key = userId ? `${action}-${userId}` : `${action}-${window.location.hostname}`;
    const result = checkRateLimit(key);
    
    setRateLimitInfo(prev => ({
      ...prev,
      [action]: {
        remaining: result.remaining,
        resetTime: result.resetTime
      }
    }));
    
    return result;
  };

  return (
    <SecurityContext.Provider value={{
      isSecure,
      rateLimitInfo,
      reportSecurityEvent
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

// Secure Input Component
interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sanitize?: boolean;
  validate?: (value: string) => boolean;
  onValidationError?: (error: string) => void;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  sanitize = true,
  validate,
  onValidationError,
  onChange,
  value,
  ...props
}) => {
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Sanitize input if enabled
    if (sanitize) {
      newValue = sanitizeInput(newValue);
    }
    
    // Validate input if validator provided
    if (validate && newValue) {
      const isValid = validate(newValue);
      if (!isValid) {
        const errorMsg = 'Invalid input format';
        setError(errorMsg);
        onValidationError?.(errorMsg);
        return;
      }
    }
    
    setError('');
    
    // Call original onChange with sanitized value
    onChange?.({
      ...e,
      target: {
        ...e.target,
        value: newValue
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div>
      <input
        {...props}
        value={value}
        onChange={handleChange}
        className={`${props.className} ${error ? 'border-red-500' : ''}`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

// Secure Textarea Component
interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  sanitize?: boolean;
  maxLength?: number;
}

export const SecureTextarea: React.FC<SecureTextareaProps> = ({
  sanitize = true,
  maxLength = 1000,
  onChange,
  value,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    
    // Sanitize input if enabled
    if (sanitize) {
      newValue = sanitizeInput(newValue);
    }
    
    // Enforce max length
    if (newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    // Call original onChange with sanitized value
    onChange?.({
      ...e,
      target: {
        ...e.target,
        value: newValue
      }
    } as React.ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <textarea
      {...props}
      value={value}
      onChange={handleChange}
      maxLength={maxLength}
    />
  );
};

// Rate Limiting Hook
export const useRateLimit = (action: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const { reportSecurityEvent } = useSecurity();
  const [isBlocked, setIsBlocked] = useState(false);
  const [remaining, setRemaining] = useState(maxAttempts);

  const checkLimit = (userId?: string) => {
    const key = userId ? `${action}-${userId}` : `${action}-${window.location.hostname}`;
    const result = checkRateLimit(key, maxAttempts, windowMs);
    
    setIsBlocked(!result.allowed);
    setRemaining(result.remaining);
    
    if (!result.allowed) {
      reportSecurityEvent('Rate Limit Exceeded', {
        action,
        key,
        maxAttempts,
        windowMs
      });
    }
    
    return result.allowed;
  };

  return {
    isBlocked,
    remaining,
    checkLimit
  };
};

// Security Warning Component
export const SecurityWarning: React.FC<{ message: string; type?: 'warning' | 'error' }> = ({ 
  message, 
  type = 'warning' 
}) => {
  const { reportSecurityEvent } = useSecurity();

  useEffect(() => {
    reportSecurityEvent('Security Warning Displayed', {
      message,
      type
    });
  }, [message, type, reportSecurityEvent]);

  return (
    <div className={`p-4 rounded-lg border-l-4 ${
      type === 'error' 
        ? 'bg-red-50 border-red-400 text-red-700' 
        : 'bg-yellow-50 border-yellow-400 text-yellow-700'
    }`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {type === 'error' ? (
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// Secure Form Hook
export const useSecureForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: { [K in keyof T]: (value: T[K]) => boolean }
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const { reportSecurityEvent } = useSecurity();

  const setValue = (field: keyof T, value: T[keyof T]) => {
    // Sanitize string values
    if (typeof value === 'string') {
      value = sanitizeInput(value) as T[keyof T];
    }
    
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof T) => {
    const validator = validationRules[field];
    if (!validator) return true;
    
    const isValid = validator(values[field]);
    if (!isValid) {
      const errorMsg = `Invalid ${String(field)}`;
      setErrors(prev => ({ ...prev, [field]: errorMsg }));
      reportSecurityEvent('Form Validation Failed', {
        field: String(field),
        value: values[field]
      });
      return false;
    }
    
    setErrors(prev => ({ ...prev, [field]: undefined }));
    return true;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(validationRules).forEach(field => {
      const fieldKey = field as keyof T;
      const validator = validationRules[fieldKey];
      if (validator && !validator(values[fieldKey])) {
        newErrors[fieldKey] = `Invalid ${String(fieldKey)}`;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    
    if (!isValid) {
      reportSecurityEvent('Form Validation Failed', {
        errors: newErrors,
        values
      });
    }
    
    return isValid;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    setValue,
    validateField,
    validateForm,
    resetForm
  };
};
