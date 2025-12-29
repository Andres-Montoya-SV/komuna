'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Store } from '@/types/auth.types';
import { MarketplaceItem } from '@/types/marketplace.types';
import StoreHeader from '@/components/Store/StoreHeader.component';
import StoreProducts from '@/components/Store/StoreProducts.component';

// Mock store data - in production, fetch from API
const mockStore: Store = {
  id: '1',
  ownerId: '1',
  name: 'Tech Store',
  description: 'Your one-stop shop for all tech gadgets and accessories.',
  rating: 4.8,
  totalProducts: 45,
  totalSales: 1234,
  createdAt: new Date().toISOString(),
  status: 'active',
  categories: ['Electronics', 'Gadgets'],
};

export default function StorePage() {
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch store and products by ID from API
    const fetchStoreData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setStore(mockStore);
      
      // Mock items for this store
      setProducts([
        {
          id: '1',
          type: 'product',
          name: 'Wireless Headphones',
          description: 'High-quality wireless headphones',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          category: 'Electronics',
          stock: 15,
          rating: 4.5,
          reviews: 234,
          storeId: params.id as string,
          storeName: mockStore.name,
        },
      ]);
      setIsLoading(false);
    };

    fetchStoreData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Store not found</h1>
          <p className="text-base-content/70">The store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <StoreHeader store={store} />
      <div className="container mx-auto px-4 py-8">
        <StoreProducts products={products} storeId={store.id} />
      </div>
    </div>
  );
}
