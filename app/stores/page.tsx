'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar/Navbar.component';
import FadeIn from '@/components/Animations/FadeIn.component';
import StaggerContainer from '@/components/Animations/StaggerContainer.component';
import StaggerItem from '@/components/Animations/StaggerItem.component';
import GoogleAd from '@/components/Ads/GoogleAd.component';
import { Store } from '@/types/auth.types';
import Image from 'next/image';

// Mock stores data - in production, fetch from Firebase
const mockStores: Store[] = [
  {
    id: '1',
    ownerId: '1',
    name: 'Tech Hub',
    description: 'Your one-stop shop for all tech gadgets and electronics.',
    rating: 4.8,
    totalProducts: 45,
    totalSales: 1234,
    createdAt: new Date().toISOString(),
    status: 'active',
    categories: ['Electronics', 'Gadgets'],
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
  },
  {
    id: '2',
    ownerId: '2',
    name: 'Fashion Forward',
    description: 'Trendy clothing and accessories for every occasion.',
    rating: 4.6,
    totalProducts: 78,
    totalSales: 892,
    createdAt: new Date().toISOString(),
    status: 'active',
    categories: ['Clothing', 'Accessories'],
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
  },
  {
    id: '3',
    ownerId: '3',
    name: 'Home & Living',
    description: 'Everything you need to make your house a home.',
    rating: 4.9,
    totalProducts: 120,
    totalSales: 2156,
    createdAt: new Date().toISOString(),
    status: 'active',
    categories: ['Home & Kitchen', 'Decor'],
    logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
  },
  {
    id: '4',
    ownerId: '4',
    name: 'Pet Paradise',
    description: 'Premium pet supplies and accessories.',
    rating: 4.7,
    totalProducts: 56,
    totalSales: 678,
    createdAt: new Date().toISOString(),
    status: 'active',
    categories: ['Pets', 'Pet Supplies'],
    logo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
  },
  {
    id: '5',
    ownerId: '5',
    name: 'Sports Zone',
    description: 'Quality sports equipment and fitness gear.',
    rating: 4.5,
    totalProducts: 92,
    totalSales: 1345,
    createdAt: new Date().toISOString(),
    status: 'active',
    categories: ['Sports', 'Fitness'],
    logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  },
  {
    id: '6',
    ownerId: '6',
    name: 'Bookworm Emporium',
    description: 'Books for every reader, fiction to non-fiction.',
    rating: 4.8,
    totalProducts: 234,
    totalSales: 3456,
    createdAt: new Date().toISOString(),
    status: 'active',
    categories: ['Books', 'Education'],
    logo: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
  },
];

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(mockStores.flatMap(store => store.categories || []))];

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           store.categories?.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number, storeId: string) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={i} className="w-4 h-4 text-accent fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-accent fill-current" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${storeId}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${storeId})`} d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )}
        <span className="text-sm font-semibold ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Browse Stores</h1>
            <p className="text-base-content/70">
              Discover amazing stores on Komuna marketplace
            </p>
          </div>
        </FadeIn>

        {/* Search and Filters */}
        <FadeIn delay={0.1}>
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search stores..."
                  className="input input-bordered w-full border-2 border-primary/20 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="select select-bordered border-2 border-primary/20 focus:border-primary"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FadeIn>

        {/* Google Ad */}
        <FadeIn delay={0.2}>
          <div className="mb-8">
            <GoogleAd
              adSlot="1234567890"
              adFormat="horizontal"
              className="max-w-4xl mx-auto"
            />
          </div>
        </FadeIn>

        {/* Stores Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredStores.map((store, index) => (
            <StaggerItem key={store.id}>
              <motion.div
                whileHover={{ y: -4 }}
                className="card bg-white border-2 border-base-200 hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => window.location.href = `/store/${store.id}`}
              >
                <figure className="h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                  <Image
                    src={store.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400'}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body p-4">
                  <h2 className="card-title text-lg text-primary">{store.name}</h2>
                  <p className="text-sm text-base-content/70 line-clamp-2">
                    {store.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      {store.rating !== undefined && renderStars(store.rating, store.id)}
                      <p className="text-xs text-base-content/60 mt-1">
                        {store.totalSales} sales
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{store.totalProducts}</p>
                      <p className="text-xs text-base-content/60">products</p>
                    </div>
                  </div>
                  {store.categories && store.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {store.categories.slice(0, 2).map((category) => (
                        <span key={category} className="badge badge-outline badge-sm">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {filteredStores.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-base-content/70">No stores found</p>
            <p className="text-sm text-base-content/50 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

