import { MarketplaceItem, ItemType } from '@/types/marketplace.types';

interface ProductCardPriceProps {
  price: number;
  stock?: number;
  type: ItemType;
  item: MarketplaceItem;
}

export default function ProductCardPrice({ price, stock, type, item }: ProductCardPriceProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPriceLabel = () => {
    switch (type) {
      case 'service':
        return 'per service';
      case 'job':
        return 'per month';
      case 'pet':
        return '';
      default:
        return '';
    }
  };

  const getStockInfo = () => {
    if (type === 'product' && stock !== undefined) {
      return stock > 0 ? (
        <>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs font-medium text-success">
            {stock < 10 ? `Only ${stock} left` : 'In Stock'}
          </span>
        </>
      ) : (
        <span className="text-xs font-medium text-error">Out of Stock</span>
      );
    }
    
    if (type === 'service' || type === 'job') {
      return (
        <span className="text-xs font-medium text-primary">
          Available
        </span>
      );
    }

    if (type === 'pet') {
      const pet = item as any;
      return pet.location ? (
        <span className="text-xs font-medium text-primary">
          📍 {pet.location}
        </span>
      ) : null;
    }

    return null;
  };

  return (
    <div className="flex items-center justify-between pt-2 border-t border-base-200">
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-primary">
          {formatPrice(price)}
        </span>
        {getPriceLabel() && (
          <span className="text-xs text-base-content/50">
            {getPriceLabel()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {getStockInfo()}
      </div>
    </div>
  );
}

