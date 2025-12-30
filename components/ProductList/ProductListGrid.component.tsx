'use client';

import { MarketplaceItem } from '@/types/marketplace.types';
import ProductCard from '../ProductCard/ProductCard.component';
import StaggerContainer from '../Animations/StaggerContainer.component';
import StaggerItem from '../Animations/StaggerItem.component';

interface ProductListGridProps {
  items: MarketplaceItem[];
  onAddToCart?: (item: MarketplaceItem) => void;
  onViewDetails?: (item: MarketplaceItem) => void;
}

export default function ProductListGrid({
  items,
  onAddToCart,
  onViewDetails,
}: ProductListGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-base-300">
        <svg
          className="w-16 h-16 mx-auto text-base-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-lg font-semibold text-base-content/70 mb-2">No items found</p>
        <p className="text-sm text-base-content/50">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {items.map((item) => (
        <StaggerItem key={item.id}>
          <ProductCard product={item} onAddToCart={onAddToCart} onViewDetails={onViewDetails} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
