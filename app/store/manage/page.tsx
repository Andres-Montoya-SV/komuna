'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, StoreFormData } from '@/types/auth.types';
import { MarketplaceItem } from '@/types/marketplace.types';
import StoreManagementHeader from '@/components/StoreManagement/StoreManagementHeader.component';
import StoreManagementForm from '@/components/StoreManagement/StoreManagementForm.component';
import StoreProductList from '@/components/StoreManagement/StoreProductList.component';
import AddProductModal from '@/components/StoreManagement/AddProductModal.component';

export default function StoreManagePage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is a seller
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push(`/login?redirect=${encodeURIComponent('/store/manage')}`);
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'seller') {
      router.push('/');
      return;
    }

    // Fetch store data
    const fetchStoreData = async () => {
      setIsLoading(true);
      // In a real app, fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock store data
      const mockStore: Store = {
        id: user.id,
        ownerId: user.id,
        name: 'My Store',
        description: 'Store description',
        rating: 4.5,
        totalProducts: 0,
        totalSales: 0,
        createdAt: new Date().toISOString(),
        status: 'active',
        categories: [],
      };
      
      setStore(mockStore);
      setIsLoading(false);
    };

    fetchStoreData();
  }, [router]);

  const handleStoreUpdate = async (data: StoreFormData) => {
    // In a real app, update store via API
    if (store) {
      setStore({
        ...store,
        ...data,
      });
    }
  };

  const handleAddProduct = (item: MarketplaceItem) => {
    setProducts([...products, item]);
    setShowAddProduct(false);
  };

  const handleDeleteProduct = (itemId: string) => {
    setProducts(products.filter(p => p.id !== itemId));
  };

  const handleUpdateProduct = (updatedItem: MarketplaceItem) => {
    setProducts(products.map(p => p.id === updatedItem.id ? updatedItem : p));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <div className="container mx-auto px-4 py-8">
        <StoreManagementHeader 
          store={store}
          onAddProduct={() => setShowAddProduct(true)}
        />
        
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-1">
            <StoreManagementForm
              store={store}
              onUpdate={handleStoreUpdate}
            />
          </div>
          
          <div className="lg:col-span-2">
            <StoreProductList
              products={products}
              onDelete={handleDeleteProduct}
              onUpdate={handleUpdateProduct}
            />
          </div>
        </div>
      </div>

      {showAddProduct && (
        <AddProductModal
          storeId={store?.id || ''}
          onAdd={handleAddProduct}
          onClose={() => setShowAddProduct(false)}
        />
      )}
    </div>
  );
}
