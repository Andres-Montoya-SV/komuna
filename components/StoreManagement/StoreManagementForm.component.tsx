'use client';

import { useState, FormEvent } from 'react';
import { Store, StoreFormData } from '@/types/auth.types';
import { sanitizeInput } from '@/utils/security';

interface StoreManagementFormProps {
  store: Store | null;
  onUpdate?: (data: StoreFormData) => void;
}

const availableCategories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Accessories',
  'Sports',
  'Beauty',
  'Toys',
];

export default function StoreManagementForm({ store, onUpdate }: StoreManagementFormProps) {
  const [formData, setFormData] = useState<StoreFormData>({
    name: store?.name || '',
    description: store?.description || '',
    categories: store?.categories || [],
    logo: store?.logo || '',
    banner: store?.banner || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof StoreFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    // Sanitize inputs
    const sanitizedData: StoreFormData = {
      name: sanitizeInput(formData.name),
      description: sanitizeInput(formData.description),
      categories: formData.categories,
      logo: formData.logo ? sanitizeInput(formData.logo) : undefined,
      banner: formData.banner ? sanitizeInput(formData.banner) : undefined,
    };

    try {
      onUpdate?.(sanitizedData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card bg-white border-2 border-primary/10 shadow-lg sticky top-4">
      <div className="card-body">
        <h2 className="card-title text-primary mb-4">Store Settings</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Store Name</span>
            </label>
            <input
              type="text"
              placeholder="My Store"
              className="input input-bordered border-2 border-primary/20 focus:border-primary"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              placeholder="Describe your store..."
              className="textarea textarea-bordered border-2 border-primary/20 focus:border-primary h-24"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Logo URL</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              className="input input-bordered border-2 border-primary/20 focus:border-primary"
              value={formData.logo || ''}
              onChange={(e) => handleChange('logo', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Banner URL</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/banner.png"
              className="input input-bordered border-2 border-primary/20 focus:border-primary"
              value={formData.banner || ''}
              onChange={(e) => handleChange('banner', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Categories</span>
            </label>
            <div className="space-y-2">
              {availableCategories.map((category) => (
                <label key={category} className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  <span className="label-text">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary w-full text-white ${isSaving ? 'loading' : ''}`}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
