'use client';

import { MarketplaceItem, FilterOptions } from '@/types/marketplace.types';
import ProductCard from '../ProductCard/ProductCard.component';
import ProductListFilters from './ProductListFilters.component';
import ProductListGrid from './ProductListGrid.component';

interface ProductListProps {
  items: MarketplaceItem[];
  filters?: FilterOptions;
  onFilterChange?: (filters: FilterOptions) => void;
  onAddToCart?: (item: MarketplaceItem) => void;
  onViewDetails?: (item: MarketplaceItem) => void;
}

export default function ProductList({
  items,
  filters,
  onFilterChange,
  onAddToCart,
  onViewDetails,
}: ProductListProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-1/4">
        <ProductListFilters 
          filters={filters}
          onFilterChange={onFilterChange}
          items={items}
        />
      </aside>
      <main className="lg:w-3/4">
        <ProductListGrid 
          items={items}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
        />
      </main>
    </div>
  );
}

