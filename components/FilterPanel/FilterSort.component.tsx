'use client';

import { FilterOptions } from '@/types/marketplace.types';

interface FilterSortProps {
  sortBy?: FilterOptions['sortBy'];
  onSortChange: (sortBy?: FilterOptions['sortBy']) => void;
}

export default function FilterSort({
  sortBy,
  onSortChange,
}: FilterSortProps) {
  const sortOptions: { value: FilterOptions['sortBy']; label: string }[] = [
    { value: undefined, label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div>
      <h4 className="font-bold text-base mb-3 text-base-content">Sort By</h4>
      <select
        className="select select-bordered w-full border-2 border-primary/20 focus:border-primary focus:outline-none bg-white"
        value={sortBy || ''}
        onChange={(e) => onSortChange(e.target.value as FilterOptions['sortBy'] || undefined)}
      >
        {sortOptions.map((option) => (
          <option key={option.value || 'default'} value={option.value || ''}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

