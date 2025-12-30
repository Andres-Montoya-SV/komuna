'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MarketplaceItem, Product } from '@/types/marketplace.types';
import { sanitizeSearchQuery } from '@/utils/security';
import SearchResults from './SearchResults.component';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  products?: MarketplaceItem[];
  showLiveResults?: boolean;
  maxResults?: number;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search products, services, pets, jobs...',
  initialValue = '',
  products = [],
  showLiveResults = true,
  maxResults = 8,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!showLiveResults || !products || !products.length || !searchQuery.trim()) {
        setFilteredResults([]);
        return;
      }

      const sanitized = sanitizeSearchQuery(searchQuery);
      const lowerQuery = sanitized.toLowerCase();

      const results = products
        .filter((item): item is Product => {
          const nameMatch = item.name.toLowerCase().includes(lowerQuery);
          const descMatch = item.description.toLowerCase().includes(lowerQuery);
          const categoryMatch = item.category.toLowerCase().includes(lowerQuery);
          return (nameMatch || descMatch || categoryMatch) && item.type === 'product';
        })
        .slice(0, maxResults);

      setFilteredResults(results);
    },
    [products, showLiveResults, maxResults]
  );

  // Debounce search input
  useEffect(() => {
    if (!showLiveResults || !query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, performSearch, showLiveResults]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeSearchQuery(e.target.value);
    setQuery(value);
    setShowResults(true);

    // Trigger immediate search for short queries (less debounce needed)
    if (value.trim()) {
      performSearch(value);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sanitized = sanitizeSearchQuery(query);
    onSearch?.(sanitized);
    setShowResults(false);
    inputRef.current?.blur();
  };

  const handleResultClick = (item: MarketplaceItem) => {
    if (item.type === 'product') {
      onSearch?.(sanitizeSearchQuery(item.name));
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.trim() && filteredResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding results to allow click events
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="form-control">
          <div className={`input-group ${isFocused ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              className="input input-bordered w-full bg-white border-2 border-primary/20 focus:border-primary focus:outline-none text-base h-12"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoComplete="off"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="btn btn-primary text-white hover:bg-primary-dark h-12 min-w-[60px]"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </form>

      {showLiveResults && showResults && filteredResults.length > 0 && (
        <SearchResults results={filteredResults} query={query} onResultClick={handleResultClick} />
      )}
    </div>
  );
}
