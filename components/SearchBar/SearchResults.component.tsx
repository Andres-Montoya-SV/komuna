'use client';

import { MarketplaceItem } from '@/types/marketplace.types';
import { escapeHtml } from '@/utils/security';

interface SearchResultsProps {
  results: MarketplaceItem[];
  query: string;
  onResultClick: (item: MarketplaceItem) => void;
}

export default function SearchResults({ 
  results, 
  query, 
  onResultClick 
}: SearchResultsProps) {
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return escapeHtml(text);
    
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(searchTerm);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    return escapedText.replace(regex, '<mark class="bg-accent/30 text-base-content font-semibold">$1</mark>');
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-primary/20 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        <div className="text-xs text-base-content/60 px-3 py-2 font-semibold">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </div>
        {results.map((item) => (
          <button
            key={item.id}
            onClick={() => onResultClick(item)}
            className="w-full text-left p-3 hover:bg-primary/5 rounded-lg transition-colors border-b border-base-300 last:border-b-0 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="flex items-start gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded border border-base-300 flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 
                    className="font-semibold text-base text-base-content truncate"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatch(item.name, query) 
                    }}
                  />
                  <span className={`badge badge-sm ${
                    item.type === 'product' ? 'badge-primary' :
                    item.type === 'service' ? 'badge-success' :
                    item.type === 'pet' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-sm text-base-content/70 line-clamp-1 mt-1">
                  {item.category}
                </p>
                <p className="text-primary font-bold text-sm mt-1">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              {item.rating && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-accent fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="text-xs font-semibold">{item.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
