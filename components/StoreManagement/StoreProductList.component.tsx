'use client';

import { MarketplaceItem } from '@/types/marketplace.types';
import StoreProductItem from './StoreProductItem.component';

interface StoreProductListProps {
  products: MarketplaceItem[];
  onDelete?: (productId: string) => void;
  onUpdate?: (product: MarketplaceItem) => void;
}

export default function StoreProductList({
  products,
  onDelete,
  onUpdate,
}: StoreProductListProps) {
  if (products.length === 0) {
    return (
      <div className="card bg-white border-2 border-primary/10 shadow-lg">
        <div className="card-body text-center py-12">
          <svg className="w-16 h-16 mx-auto text-base-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-semibold text-base-content/70 mb-2">No products yet</p>
          <p className="text-sm text-base-content/50">Add your first product to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white border-2 border-primary/10 shadow-lg">
      <div className="card-body">
        <h2 className="card-title text-primary mb-4">
          Your Products ({products.length})
        </h2>
        
        <div className="space-y-4">
          {products.map((product) => (
            <StoreProductItem
              key={product.id}
              product={product}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
