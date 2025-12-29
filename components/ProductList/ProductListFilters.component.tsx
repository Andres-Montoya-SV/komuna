'use client';

import { useState } from 'react';
import { FilterOptions, MarketplaceItem, ItemType } from '@/types/marketplace.types';
import FilterCategory from '../FilterPanel/FilterCategory.component';
import FilterPriceRange from '../FilterPanel/FilterPriceRange.component';
import FilterSort from '../FilterPanel/FilterSort.component';

interface ProductListFiltersProps {
  filters?: FilterOptions;
  onFilterChange?: (filters: FilterOptions) => void;
  items: MarketplaceItem[];
}

export default function ProductListFilters({
  filters,
  onFilterChange,
  items,
}: ProductListFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters || {});

  const categories = Array.from(new Set(items.map(p => p.category)));
  const maxPrice = Math.max(...items.map(p => p.price), 0);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updated = { ...localFilters, ...newFilters };
    setLocalFilters(updated);
    onFilterChange?.(updated);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {};
    setLocalFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  return (
    <div className="bg-white border-2 border-primary/10 p-5 rounded-lg shadow-sm sticky top-4">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-primary/10">
        <h3 className="text-xl font-bold text-primary">Filters</h3>
        <button 
          className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"
          onClick={handleReset}
        >
          Clear All
        </button>
      </div>
      <div className="space-y-6">
        <FilterCategory
          categories={categories}
          selectedCategory={localFilters.category}
          onCategoryChange={(category) => handleFilterChange({ category })}
        />
        <div className="divider my-6"></div>
        <FilterPriceRange
          maxPrice={maxPrice}
          minPrice={localFilters.minPrice}
          maxPriceValue={localFilters.maxPrice}
          onPriceChange={(min, max) => handleFilterChange({ minPrice: min, maxPrice: max })}
        />
        <div className="divider my-6"></div>
        <FilterSort
          sortBy={localFilters.sortBy}
          onSortChange={(sortBy) => handleFilterChange({ sortBy })}
        />
      </div>
    </div>
  );
}

