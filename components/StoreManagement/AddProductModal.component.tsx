'use client';

import { useState, FormEvent } from 'react';
import { MarketplaceItem, Product, Service, Pet, Job, ItemType } from '@/types/marketplace.types';
import { sanitizeInput, isValidPrice } from '@/utils/security';

interface AddProductModalProps {
  storeId: string;
  onAdd: (item: MarketplaceItem) => void;
  onClose: () => void;
}

const categoriesByType: Record<ItemType, string[]> = {
  product: ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Accessories', 'Sports', 'Beauty', 'Toys'],
  service: ['Home Services', 'Education', 'Beauty & Wellness', 'Automotive', 'Legal', 'Financial', 'Technology'],
  pet: ['Dogs', 'Cats', 'Birds', 'Fish', 'Small Animals', 'Reptiles'],
  job: ['Technology', 'Design', 'Marketing', 'Sales', 'Healthcare', 'Education', 'Finance'],
};

export default function AddProductModal({
  storeId,
  onAdd,
  onClose,
}: AddProductModalProps) {
  const [itemType, setItemType] = useState<ItemType>('product');
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: categoriesByType.product[0],
    // Product specific
    stock: 0,
    // Service specific
    duration: '',
    availability: '',
    // Pet specific
    breed: '',
    age: '',
    gender: 'male' as 'male' | 'female',
    location: '',
    // Job specific
    employmentType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'freelance',
    location: '',
    requirements: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newRequirement, setNewRequirement] = useState('');

  const handleChange = (field: string, value: string | number) => {
    let sanitized: string | number = value;
    
    if (typeof value === 'string' && (field === 'name' || field === 'description')) {
      sanitized = sanitizeInput(value);
    }

    setFormData((prev: any) => ({ ...prev, [field]: sanitized }));
    
    // Clear error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTypeChange = (type: ItemType) => {
    setItemType(type);
    setFormData((prev: any) => ({
      ...prev,
      category: categoriesByType[type][0],
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        requirements: [...(prev.requirements || []), sanitizeInput(newRequirement)],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      requirements: prev.requirements.filter((_: string, i: number) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price || !isValidPrice(formData.price)) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!formData.image) {
      newErrors.image = 'Image URL is required';
    }

    if (itemType === 'product' && (!formData.stock || formData.stock < 0)) {
      newErrors.stock = 'Stock must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validate() || !formData.name || !formData.description || !formData.image || !formData.category) {
      return;
    }

    let newItem: MarketplaceItem;

    switch (itemType) {
      case 'product':
        newItem = {
          id: Date.now().toString(),
          type: 'product',
          name: formData.name,
          description: formData.description,
          price: formData.price || 0,
          image: formData.image,
          category: formData.category,
          stock: formData.stock || 0,
          storeId,
          createdAt: new Date().toISOString(),
        } as Product;
        break;
      case 'service':
        newItem = {
          id: Date.now().toString(),
          type: 'service',
          name: formData.name,
          description: formData.description,
          price: formData.price || 0,
          image: formData.image,
          category: formData.category,
          duration: formData.duration,
          availability: formData.availability,
          storeId,
          createdAt: new Date().toISOString(),
        } as Service;
        break;
      case 'pet':
        newItem = {
          id: Date.now().toString(),
          type: 'pet',
          name: formData.name,
          description: formData.description,
          price: formData.price || 0,
          image: formData.image,
          category: formData.category,
          breed: formData.breed,
          age: formData.age,
          gender: formData.gender,
          location: formData.location || 'San Salvador',
          storeId,
          createdAt: new Date().toISOString(),
        } as Pet;
        break;
      case 'job':
        newItem = {
          id: Date.now().toString(),
          type: 'job',
          name: formData.name,
          description: formData.description,
          price: formData.price || 0,
          image: formData.image,
          category: formData.category,
          employmentType: formData.employmentType,
          location: formData.location,
          requirements: formData.requirements || [],
          storeId,
          createdAt: new Date().toISOString(),
        } as Job;
        break;
    }
    
    onAdd(newItem);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg text-primary mb-4">Add New Item</h3>
        
        {/* Type Selector */}
        <div className="mb-4">
          <label className="label">
            <span className="label-text font-semibold">Item Type</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {(['product', 'service', 'pet', 'job'] as ItemType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`btn btn-sm ${itemType === type ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleTypeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

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
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              className={`textarea textarea-bordered w-full border-2 ${
                errors.description ? 'border-error' : 'border-primary/20 focus:border-primary'
              }`}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              required
            />
            {errors.description && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.description}</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Price ($) {itemType === 'job' && '(Monthly)'}
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`input input-bordered w-full border-2 ${
                  errors.price ? 'border-error' : 'border-primary/20 focus:border-primary'
                }`}
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                required
              />
              {errors.price && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.price}</span>
                </label>
              )}
            </div>

            {itemType === 'product' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Stock</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className={`input input-bordered w-full border-2 ${
                    errors.stock ? 'border-error' : 'border-primary/20 focus:border-primary'
                  }`}
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                  required
                />
                {errors.stock && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.stock}</span>
                  </label>
                )}
              </div>
            )}

            {itemType === 'service' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Duration</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2 hours"
                  className="input input-bordered w-full border-2 border-primary/20 focus:border-primary"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                />
              </div>
            )}

            {itemType === 'pet' && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Breed</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full border-2 border-primary/20 focus:border-primary"
                    value={formData.breed}
                    onChange={(e) => handleChange('breed', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Age</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 8 weeks"
                    className="input input-bordered w-full border-2 border-primary/20 focus:border-primary"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Gender</span>
                  </label>
                  <select
                    className="select select-bordered w-full border-2 border-primary/20 focus:border-primary"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </>
            )}

            {(itemType === 'pet' || itemType === 'job') && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Location</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full border-2 border-primary/20 focus:border-primary"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
            )}

            {itemType === 'job' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Employment Type</span>
                </label>
                <select
                  className="select select-bordered w-full border-2 border-primary/20 focus:border-primary"
                  value={formData.employmentType}
                  onChange={(e) => handleChange('employmentType', e.target.value)}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            )}
          </div>

          {itemType === 'service' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Availability</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Monday-Friday 9am-5pm"
                className="input input-bordered w-full border-2 border-primary/20 focus:border-primary"
                value={formData.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
              />
            </div>
          )}

          {itemType === 'job' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Requirements</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add requirement..."
                  className="input input-bordered flex-1 border-2 border-primary/20 focus:border-primary"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                />
                <button type="button" className="btn btn-primary" onClick={addRequirement}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements?.map((req: string, index: number) => (
                  <span key={index} className="badge badge-primary gap-2">
                    {req}
                    <button
                      type="button"
                      className="text-white hover:text-error"
                      onClick={() => removeRequirement(index)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Category</span>
            </label>
            <select
              className="select select-bordered w-full border-2 border-primary/20 focus:border-primary"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
            >
              {categoriesByType[itemType].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Image URL</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className={`input input-bordered w-full border-2 ${
                errors.image ? 'border-error' : 'border-primary/20 focus:border-primary'
              }`}
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              required
            />
            {errors.image && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.image}</span>
              </label>
            )}
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-white">
              Add {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}