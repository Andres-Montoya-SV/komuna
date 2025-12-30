'use client';

import { useState } from 'react';
import { OrderData } from './Checkout.component';
import { sanitizeInput, isValidEmail, isValidName, isValidZipCode } from '@/utils/security';

interface CheckoutFormProps {
  orderData: Partial<OrderData>;
  onDataChange: (data: Partial<OrderData>) => void;
}

export default function CheckoutForm({ orderData, onDataChange }: CheckoutFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof OrderData, string>>>({});

  const validateField = (field: keyof OrderData, value: string) => {
    let error = '';

    switch (field) {
      case 'email':
        if (value && !isValidEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'name':
        if (value && !isValidName(value)) {
          error = 'Please enter a valid name (letters and spaces only)';
        }
        break;
      case 'zipCode':
        if (value && !isValidZipCode(value)) {
          error = 'Please enter a valid zip code';
        }
        break;
      case 'address':
        if (value && value.trim().length < 5) {
          error = 'Address must be at least 5 characters';
        }
        break;
      case 'city':
        if (value && value.trim().length < 2) {
          error = 'City must be at least 2 characters';
        }
        break;
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleChange = (field: keyof OrderData, value: string) => {
    const sanitized = sanitizeInput(value);
    const newData = { ...orderData, [field]: sanitized };
    onDataChange(newData);

    // Validate on change
    validateField(field, sanitized);
  };

  return (
    <div className="card bg-white border-2 border-primary/10 shadow-lg">
      <div className="card-body space-y-5">
        <h2 className="card-title text-primary text-2xl pb-4 border-b-2 border-primary/10">
          Shipping Information
        </h2>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Full Name</span>
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className={`input input-bordered border-2 ${
              errors.name ? 'border-error' : 'border-primary/20 focus:border-primary'
            }`}
            value={orderData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
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
            placeholder="john@example.com"
            className={`input input-bordered border-2 ${
              errors.email ? 'border-error' : 'border-primary/20 focus:border-primary'
            }`}
            value={orderData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
          {errors.email && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.email}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Address</span>
          </label>
          <input
            type="text"
            placeholder="123 Main St"
            className={`input input-bordered border-2 ${
              errors.address ? 'border-error' : 'border-primary/20 focus:border-primary'
            }`}
            value={orderData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            required
          />
          {errors.address && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.address}</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">City</span>
            </label>
            <input
              type="text"
              placeholder="New York"
              className={`input input-bordered border-2 ${
                errors.city ? 'border-error' : 'border-primary/20 focus:border-primary'
              }`}
              value={orderData.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              required
            />
            {errors.city && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.city}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Zip Code</span>
            </label>
            <input
              type="text"
              placeholder="10001"
              className={`input input-bordered border-2 ${
                errors.zipCode ? 'border-error' : 'border-primary/20 focus:border-primary'
              }`}
              value={orderData.zipCode || ''}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              required
            />
            {errors.zipCode && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.zipCode}</span>
              </label>
            )}
          </div>
        </div>

        <div className="form-control mt-6">
          <label className="label">
            <span className="label-text font-semibold">Payment Method</span>
          </label>
          <select
            className={`select select-bordered border-2 ${
              errors.paymentMethod ? 'border-error' : 'border-primary/20 focus:border-primary'
            }`}
            value={orderData.paymentMethod || ''}
            onChange={(e) => handleChange('paymentMethod', e.target.value)}
            required
          >
            <option value="">Select payment method</option>
            <option value="credit-card">💳 Credit Card</option>
            <option value="paypal">💰 PayPal</option>
            <option value="bank-transfer">🏦 Bank Transfer</option>
          </select>
          {errors.paymentMethod && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.paymentMethod}</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
