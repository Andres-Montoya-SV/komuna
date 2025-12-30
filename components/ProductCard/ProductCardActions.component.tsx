'use client';

import { useState } from 'react';
import { MarketplaceItem, Product } from '@/types/marketplace.types';

interface ProductCardActionsProps {
  product: MarketplaceItem;
  onAddToCart?: (item: MarketplaceItem) => void;
  onViewDetails?: (item: MarketplaceItem) => void;
}

export default function ProductCardActions({
  product,
  onAddToCart,
  onViewDetails,
}: ProductCardActionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const isOutOfStock = product.type === 'product' && (product as Product).stock === 0;

  const getActionLabel = () => {
    switch (product.type) {
      case 'service':
        return 'Book Service';
      case 'job':
        return 'Apply Now';
      case 'pet':
        return 'Contact Seller';
      default:
        return 'Add to Cart';
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    onAddToCart?.(product);

    // Reset button state after animation
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <div className="flex gap-2 mt-2">
      <button
        className="btn btn-outline btn-sm flex-1 border-primary text-primary hover:bg-primary hover:text-white"
        onClick={() => onViewDetails?.(product)}
      >
        Details
      </button>
      <button
        className={`btn btn-primary btn-sm flex-1 text-white ${
          isAdding ? 'btn-success' : ''
        } ${isOutOfStock ? 'btn-disabled opacity-50' : ''}`}
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding}
      >
        {isAdding ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            Added!
          </>
        ) : (
          <>
            {product.type === 'product' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
            {isOutOfStock ? 'Out of Stock' : getActionLabel()}
          </>
        )}
      </button>
    </div>
  );
}
