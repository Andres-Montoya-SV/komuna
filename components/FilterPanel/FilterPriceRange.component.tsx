'use client';

interface FilterPriceRangeProps {
  maxPrice: number;
  minPrice?: number;
  maxPriceValue?: number;
  onPriceChange: (min?: number, max?: number) => void;
}

export default function FilterPriceRange({
  maxPrice,
  minPrice,
  maxPriceValue,
  onPriceChange,
}: FilterPriceRangeProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <h4 className="font-bold text-base mb-3 text-base-content">Price Range</h4>
      <div className="space-y-4">
        <div className="form-control">
          <label className="label justify-between">
            <span className="label-text font-medium">Minimum</span>
            <span className="label-text-alt font-bold text-primary">
              {minPrice ? formatPrice(minPrice) : '$0'}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max={maxPrice}
            step="10"
            value={minPrice || 0}
            onChange={(e) => onPriceChange(Number(e.target.value), maxPriceValue)}
            className="range range-primary range-sm"
          />
        </div>
        <div className="form-control">
          <label className="label justify-between">
            <span className="label-text font-medium">Maximum</span>
            <span className="label-text-alt font-bold text-primary">
              {maxPriceValue ? formatPrice(maxPriceValue) : formatPrice(maxPrice)}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max={maxPrice}
            step="10"
            value={maxPriceValue || maxPrice}
            onChange={(e) => onPriceChange(minPrice, Number(e.target.value))}
            className="range range-primary range-sm"
          />
        </div>
        <div className="flex gap-2 text-xs text-base-content/60">
          <span>${0}</span>
          <span className="flex-1"></span>
          <span>{formatPrice(maxPrice)}</span>
        </div>
      </div>
    </div>
  );
}

