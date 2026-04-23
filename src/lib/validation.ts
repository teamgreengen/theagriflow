import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  numeric?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = useCallback((values: Record<string, any>): boolean => {
    const newErrors: ValidationErrors = {};

    Object.keys(rules).forEach((field) => {
      const value = values[field];
      const rule = rules[field];

      if (rule.required && !value && value !== 0) {
        newErrors[field] = `${field} is required`;
        return;
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        newErrors[field] = `${field} must be at least ${rule.minLength} characters`;
        return;
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        newErrors[field] = `${field} must be at most ${rule.maxLength} characters`;
        return;
      }

      if (rule.email && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          newErrors[field] = 'Invalid email address';
          return;
        }
      }

      if (rule.numeric && value && isNaN(Number(value))) {
        newErrors[field] = 'Must be a number';
        return;
      }

      if (rule.min !== undefined && value < rule.min) {
        newErrors[field] = `Minimum value is ${rule.min}`;
        return;
      }

      if (rule.max !== undefined && value > rule.max) {
        newErrors[field] = `Maximum value is ${rule.max}`;
        return;
      }

      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          newErrors[field] = customError;
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rules]);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, clearError, clearErrors, setErrors };
}

export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

export function validatePhone(phone: string): boolean {
  const phonePattern = /^[+]?[\d\s-()]{10,}$/;
  return phonePattern.test(phone);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { valid: errors.length === 0, errors };
}