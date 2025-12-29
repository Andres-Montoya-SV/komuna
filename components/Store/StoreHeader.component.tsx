'use client';

import { Store } from '@/types/auth.types';

interface StoreHeaderProps {
  store: Store;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        {store.banner && (
          <div className="h-48 mb-6 rounded-lg overflow-hidden">
            <img 
              src={store.banner} 
              alt={`${store.name} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center text-3xl font-bold border-4 border-white">
              {store.logo ? (
                <img src={store.logo} alt={store.name} />
              ) : (
                store.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
            <p className="text-white/90 mb-4 text-lg">{store.description}</p>
            
            <div className="flex flex-wrap gap-4 items-center">
              {store.rating && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 fill-current text-accent" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="font-semibold">{store.rating.toFixed(1)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>{store.totalProducts} Products</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{store.totalSales} Sales</span>
              </div>
              
              <div className="text-white/70 text-sm">
                Since {formatDate(store.createdAt)}
              </div>
            </div>

            {store.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {store.categories.map((category) => (
                  <span key={category} className="badge badge-outline badge-lg bg-white/10 text-white border-white/30">
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

