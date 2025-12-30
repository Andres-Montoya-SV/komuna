'use client';

import { motion } from 'framer-motion';
import { MarketplaceItem } from '@/types/marketplace.types';
import ProductCard from '../ProductCard/ProductCard.component';
import StaggerContainer from '../Animations/StaggerContainer.component';
import StaggerItem from '../Animations/StaggerItem.component';

interface SponsoredSectionProps {
  items: MarketplaceItem[];
  onAddToCart?: (item: MarketplaceItem) => void;
  onViewDetails?: (item: MarketplaceItem) => void;
}

export default function SponsoredSection({
  items,
  onAddToCart,
  onViewDetails,
}: SponsoredSectionProps) {
  // Get top-rated items as sponsored
  const sponsoredItems = items
    .filter((item) => item.rating && item.rating >= 4.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  if (sponsoredItems.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-base-200 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h2 className="text-3xl font-bold text-primary">Sponsored</h2>
          </div>
          <p className="text-base-content/70">Featured top-rated items</p>
        </motion.div>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {sponsoredItems.map((item) => (
            <StaggerItem key={item.id}>
              <div className="relative">
                <div className="absolute -top-2 -right-2 z-10 bg-accent text-accent-content px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Sponsored
                </div>
                <ProductCard
                  product={item}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewDetails}
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
