'use client';

import { motion } from 'framer-motion';
import { MarketplaceItem, Product, Service, Pet, Job } from '@/types/marketplace.types';
import ProductCardImage from './ProductCardImage.component';
import ProductCardInfo from './ProductCardInfo.component';
import ProductCardPrice from './ProductCardPrice.component';
import ProductCardActions from './ProductCardActions.component';

interface ProductCardProps {
  product: MarketplaceItem;
  onAddToCart?: (item: MarketplaceItem) => void;
  onViewDetails?: (item: MarketplaceItem) => void;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails 
}: ProductCardProps) {
  const getTypeBadge = () => {
    const badges = {
      product: { label: 'Product', color: 'badge-primary' },
      service: { label: 'Service', color: 'badge-success' },
      pet: { label: 'Pet', color: 'badge-warning' },
      job: { label: 'Job', color: 'badge-info' },
    };
    return badges[product.type];
  };

  const badge = getTypeBadge();
  const stock = product.type === 'product' ? (product as Product).stock : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="card bg-white border-2 border-base-200 hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden group"
    >
      <div className="relative">
        <ProductCardImage 
          image={product.image} 
          name={product.name}
          onClick={() => onViewDetails?.(product)}
        />
        <div className="absolute top-2 left-2">
          <span className={`badge ${badge.color} text-white`}>
            {badge.label}
          </span>
        </div>
        {stock === 0 && (
          <div className="absolute top-2 right-2 bg-error text-error-content px-2 py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </div>
        )}
        {product.rating && product.rating >= 4.5 && (
          <div className="absolute bottom-2 left-2 bg-accent text-accent-content px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            Top Rated
          </div>
        )}
      </div>
      <div className="card-body p-4 gap-2">
        <ProductCardInfo 
          name={product.name}
          description={product.description}
          rating={product.rating}
          reviews={product.reviews}
          item={product}
        />
        <ProductCardPrice 
          price={product.price} 
          stock={stock}
          type={product.type}
          item={product}
        />
        <ProductCardActions 
          product={product}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
        />
      </div>
    </motion.div>
  );
}

