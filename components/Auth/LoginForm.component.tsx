'use client';

import { useState, FormEvent } from 'react';
import { LoginCredentials } from '@/types/auth.types';
import { sanitizeInput, isValidEmail } from '@/utils/security';

interface LoginFormProps {
  onLogin?: (credentials: LoginCredentials) => void;
  onSwitchToRegister?: () => void;
  isLoading?: boolean;
}

export default function LoginForm({
  onLogin,
  onSwitchToRegister,
  isLoading = false,
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginCredentials, string>>>({});

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    const sanitized = field === 'email' ? sanitizeInput(value.toLowerCase()) : value;
    setFormData((prev) => ({ ...prev, [field]: sanitized }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LoginCredentials, string>> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validate()) {
      onLogin?.(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Email</span>
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          className={`input input-bordered w-full border-2 ${
            errors.email ? 'border-error' : 'border-primary/20 focus:border-primary'
          }`}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={isLoading}
        />
        {errors.email && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.email}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Password</span>
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          className={`input input-bordered w-full border-2 ${
            errors.password ? 'border-error' : 'border-primary/20 focus:border-primary'
          }`}
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          disabled={isLoading}
        />
        {errors.password && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.password}</span>
          </label>
        )}
        <label className="label">
          <a href="#" className="label-text-alt link link-primary">
            Forgot password?
          </a>
        </label>
      </div>

      <div className="form-control mt-6">
        <button
          type="submit"
          className={`btn btn-primary w-full text-white ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      {onSwitchToRegister && (
        <div className="text-center mt-4">
          <span className="text-sm text-base-content/70">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="link link-primary font-semibold"
            >
              Sign up
            </button>
          </span>
        </div>
      )}
    </form>
  );
}
