'use client';

import { useState, FormEvent } from 'react';
import { RegisterData } from '@/types/auth.types';
import { sanitizeInput, isValidEmail } from '@/utils/security';
import { validatePassword } from '@/utils/auth';

interface RegisterFormProps {
  onRegister?: (data: RegisterData) => void;
  onSwitchToLogin?: () => void;
  isLoading?: boolean;
}

export default function RegisterForm({
  onRegister,
  onSwitchToLogin,
  isLoading = false,
}: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});
  const [passwordStrength, setPasswordStrength] = useState<string[]>([]);

  const handleChange = (field: keyof RegisterData, value: string) => {
    let sanitized = value;

    if (field === 'email') {
      sanitized = sanitizeInput(value.toLowerCase());
    } else if (field === 'name' || field === 'phone') {
      sanitized = sanitizeInput(value);
    }

    setFormData((prev) => ({ ...prev, [field]: sanitized }));

    // Validate password strength
    if (field === 'password') {
      const validation = validatePassword(sanitized);
      setPasswordStrength(validation.errors);
    }

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
    const newErrors: Partial<Record<keyof RegisterData, string>> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validate()) {
      onRegister?.(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Full Name</span>
        </label>
        <input
          type="text"
          placeholder="John Doe"
          className={`input input-bordered w-full border-2 ${
            errors.name ? 'border-error' : 'border-primary/20 focus:border-primary'
          }`}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={isLoading}
        />
        {errors.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name}</span>
          </label>
        )}
      </div>

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
          <span className="label-text font-semibold">Phone (Optional)</span>
        </label>
        <input
          type="tel"
          placeholder="+1234567890"
          className="input input-bordered w-full border-2 border-primary/20 focus:border-primary"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Account Type</span>
        </label>
        <div className="flex gap-4">
          <label className="label cursor-pointer flex-1">
            <input
              type="radio"
              name="role"
              className="radio radio-primary"
              value="buyer"
              checked={formData.role === 'buyer'}
              onChange={(e) => handleChange('role', e.target.value as 'buyer' | 'seller')}
              disabled={isLoading}
            />
            <span className="label-text ml-2">Buyer</span>
          </label>
          <label className="label cursor-pointer flex-1">
            <input
              type="radio"
              name="role"
              className="radio radio-primary"
              value="seller"
              checked={formData.role === 'seller'}
              onChange={(e) => handleChange('role', e.target.value as 'buyer' | 'seller')}
              disabled={isLoading}
            />
            <span className="label-text ml-2">Seller</span>
          </label>
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Password</span>
        </label>
        <input
          type="password"
          placeholder="Create a strong password"
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
        {passwordStrength.length > 0 && formData.password && !errors.password && (
          <div className="mt-2 space-y-1">
            {passwordStrength.map((error, index) => (
              <div key={index} className="text-xs text-warning flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Confirm Password</span>
        </label>
        <input
          type="password"
          placeholder="Confirm your password"
          className={`input input-bordered w-full border-2 ${
            errors.confirmPassword ? 'border-error' : 'border-primary/20 focus:border-primary'
          }`}
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.confirmPassword}</span>
          </label>
        )}
      </div>

      <div className="form-control mt-6">
        <button
          type="submit"
          className={`btn btn-primary w-full text-white ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </div>

      {onSwitchToLogin && (
        <div className="text-center mt-4">
          <span className="text-sm text-base-content/70">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="link link-primary font-semibold"
            >
              Login
            </button>
          </span>
        </div>
      )}
    </form>
  );
}
