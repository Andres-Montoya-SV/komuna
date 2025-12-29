'use client';

import { useState, FormEvent } from 'react';
import Navbar from '@/components/Navbar/Navbar.component';
import { sanitizeInput, isValidEmail } from '@/utils/security';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    const sanitized = field === 'email' ? value : sanitizeInput(value);
    setFormData((prev) => ({ ...prev, [field]: sanitized }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <svg className="w-16 h-16 text-success mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                <p className="text-base-content/80 mb-4">
                  Thank you for contacting us. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="btn btn-primary"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-6">Contact Us</h1>
          
          <div className="card bg-white border-2 border-primary/10 shadow-lg mb-6">
            <div className="card-body">
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a href="mailto:support@komuna.com" className="text-primary hover:underline">
                    support@komuna.com
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <a href="tel:+50312345678" className="text-primary hover:underline">
                    +503 1234-5678
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-base-content/80">
                    San Salvador, El Salvador
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white border-2 border-primary/10 shadow-lg">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-4">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Name</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full border-2 ${
                      errors.name ? 'border-error' : 'border-primary/20 focus:border-primary'
                    }`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
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
                    className={`input input-bordered w-full border-2 ${
                      errors.email ? 'border-error' : 'border-primary/20 focus:border-primary'
                    }`}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.email}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Subject</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full border-2 ${
                      errors.subject ? 'border-error' : 'border-primary/20 focus:border-primary'
                    }`}
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                  />
                  {errors.subject && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.subject}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Message</span>
                  </label>
                  <textarea
                    className={`textarea textarea-bordered w-full border-2 h-32 ${
                      errors.message ? 'border-error' : 'border-primary/20 focus:border-primary'
                    }`}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                  />
                  {errors.message && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control mt-6">
                  <button
                    type="submit"
                    className={`btn btn-primary w-full text-white ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

