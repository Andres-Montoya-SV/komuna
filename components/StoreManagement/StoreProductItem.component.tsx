'use client';

import { useState } from 'react';
import { MarketplaceItem, Product } from '@/types/marketplace.types';

interface StoreProductItemProps {
  product: MarketplaceItem;
  onDelete?: (productId: string) => void;
  onUpdate?: (product: MarketplaceItem) => void;
}

export default function StoreProductItem({ product, onDelete, onUpdate }: StoreProductItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<MarketplaceItem>(product);

  const handleSave = () => {
    onUpdate?.(editedProduct);
    setIsEditing(false);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isEditing) {
    return (
      <div className="border-2 border-primary/20 rounded-lg p-4 bg-base-200">
        <div className="space-y-3">
          <input
            type="text"
            className="input input-bordered w-full"
            value={editedProduct.name}
            onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
          />
          <textarea
            className="textarea textarea-bordered w-full"
            value={editedProduct.description}
            onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="input input-bordered"
              placeholder="Price"
              value={editedProduct.price}
              onChange={(e) =>
                setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) || 0 })
              }
            />
            {editedProduct.type === 'product' && (
              <input
                type="number"
                className="input input-bordered"
                placeholder="Stock"
                value={(editedProduct as Product).stock}
                onChange={(e) =>
                  setEditedProduct({
                    ...editedProduct,
                    stock: parseInt(e.target.value) || 0,
                  } as Product)
                }
              />
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-base-200 rounded-lg p-4 hover:border-primary/30 transition-colors">
      <div className="flex gap-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-lg border border-base-300"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-sm text-base-content/70 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="font-bold text-primary">{formatPrice(product.price)}</span>
            <span
              className={`badge ${
                product.type === 'product'
                  ? 'badge-primary'
                  : product.type === 'service'
                    ? 'badge-success'
                    : product.type === 'pet'
                      ? 'badge-warning'
                      : 'badge-info'
              }`}
            >
              {product.type}
            </span>
            {product.type === 'product' && (
              <span className="text-sm text-base-content/60">
                Stock: {(product as Product).stock}
              </span>
            )}
            {product.rating && (
              <span className="text-sm text-base-content/60">
                ⭐ {product.rating.toFixed(1)} ({product.reviews || 0})
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button className="btn btn-sm btn-primary" onClick={() => setIsEditing(true)}>
            Edit
          </button>
          {onDelete && (
            <button
              className="btn btn-sm btn-error btn-outline"
              onClick={() => onDelete(product.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
