'use client';

import { MarketplaceItem } from '@/types/marketplace.types';
import ProductCard from '../ProductCard/ProductCard.component';

interface StoreProductsProps {
  products: MarketplaceItem[];
  storeId: string;
  onAddToCart?: (item: MarketplaceItem) => void;
  onViewDetails?: (item: MarketplaceItem) => void;
}

export default function StoreProducts({
  products,
  onAddToCart,
  onViewDetails,
}: StoreProductsProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-base-300">
        <svg className="w-16 h-16 mx-auto text-base-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-lg font-semibold text-base-content/70 mb-2">No products available</p>
        <p className="text-sm text-base-content/50">This store hasn't added any products yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-base-content">
          Products ({products.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
