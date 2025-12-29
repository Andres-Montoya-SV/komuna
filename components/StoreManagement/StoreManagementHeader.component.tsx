'use client';

import { Store } from '@/types/auth.types';

interface StoreManagementHeaderProps {
  store: Store | null;
  onAddProduct?: () => void;
}

export default function StoreManagementHeader({
  store,
  onAddProduct,
}: StoreManagementHeaderProps) {
  return (
    <div className="card bg-white border-2 border-primary/10 shadow-lg">
      <div className="card-body">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {store?.name || 'Store Management'}
            </h1>
            <p className="text-base-content/70">
              Manage your store settings and products
            </p>
          </div>
          
          {onAddProduct && (
            <button
              className="btn btn-primary text-white"
              onClick={onAddProduct}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

