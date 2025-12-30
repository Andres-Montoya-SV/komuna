/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ProductList from '@/components/ProductList/ProductList.component';
import SearchBar from '@/components/SearchBar/SearchBar.component';
import Navbar from '@/components/Navbar/Navbar.component';
import Pagination from '@/components/Pagination/Pagination.component';
import ItemsPerPageSelector from '@/components/ProductList/ItemsPerPageSelector.component';
import FadeIn from '@/components/Animations/FadeIn.component';
import BrandsSection from '@/components/Brands/BrandsSection.component';
import SponsoredSection from '@/components/Sponsored/SponsoredSection.component';
import GoogleAd from '@/components/Ads/GoogleAd.component';
import { MarketplaceItem, FilterOptions, CartItem, ItemType } from '@/types/marketplace.types';
import { sampleItems } from '@/app/data/sampleItems';
import Link from 'next/link';

function HomeContent() {
  const searchParams = useSearchParams();
  const [items] = useState<MarketplaceItem[]>(sampleItems);
  const [filters, setFilters] = useState<FilterOptions>({
    type: (searchParams.get('type') as ItemType) || undefined,
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Store items in localStorage for item detail page
  useEffect(() => {
    localStorage.setItem('marketplaceItems', JSON.stringify(sampleItems));
  }, []);

  useEffect(() => {
    // Sync URL param with filters
    const typeParam = searchParams.get('type') as ItemType;
    if (typeParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters((prev) => ({ ...prev, type: typeParam }));
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter((item) => item.type === filters.type);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Apply price filters
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
      }
    }

    return filtered;
  }, [items, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);  

  const handleAddToCart = (item: MarketplaceItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.item.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { item, quantity: 1 }];
    });
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
    setCurrentPage(1);
  };

  const handleViewDetails = (item: MarketplaceItem) => {
    window.location.href = `/item/${item.id}`;
  };

  const getTypeLabel = (type?: ItemType) => {
    switch (type) {
      case 'product': return 'Products';
      case 'service': return 'Services';
      case 'pet': return 'Pets';
      case 'job': return 'Jobs';
      default: return 'All Items';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />

      {/* Header with Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b-2 border-primary/10 shadow-sm"
      >
        <div className="container mx-auto px-4 py-6">
          <FadeIn delay={0.1}>
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-primary mb-2">
                {getTypeLabel(filters.type)}
              </h1>
              <p className="text-base-content/70">
                Discover and {filters.type === 'job' ? 'find' : 'buy'} {filters.type === 'service' ? 'services' : filters.type === 'pet' ? 'pets' : filters.type === 'job' ? 'jobs' : 'products'} in Komuna
              </p>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="flex justify-center">
              <SearchBar 
                onSearch={handleSearch} 
                products={items as any}
                showLiveResults={true}
              />
            </div>
          </FadeIn>

          {cart.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mt-4 text-center"
            >
              <span className="badge badge-primary badge-lg">
                Cart: {cart.reduce((sum, item) => sum + item.quantity, 0)} item{cart.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <FadeIn delay={0.3}>
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-base-content/60 mt-1">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
              </p>
            </div>
            <ItemsPerPageSelector
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          </div>
        </FadeIn>

        <ProductList
          items={paginatedItems}
          filters={filters}
          onFilterChange={setFilters}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
        />

        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}
      </main>

      {/* Brands Section */}
      <BrandsSection />

      {/* Sponsored Section */}
      <SponsoredSection
        items={items}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
      />

      {/* Google Ad */}
      <FadeIn delay={0.3}>
        <div className="container mx-auto px-4 py-8">
          <GoogleAd
            adSlot="1234567890"
            adFormat="horizontal"
            className="max-w-4xl mx-auto"
          />
        </div>
      </FadeIn>

      {/* Footer */}
      <footer className="bg-primary text-white mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Komuna</h3>
              <p className="text-white/80 text-sm mb-4">
                Your trusted marketplace for products, services, pets, and jobs in El Salvador.
              </p>
              <div className="flex gap-3">
                <a href="#" className="btn btn-circle btn-sm bg-white/10 border-white/20 hover:bg-white/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="btn btn-circle btn-sm bg-white/10 border-white/20 hover:bg-white/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="btn btn-circle btn-sm bg-white/10 border-white/20 hover:bg-white/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Marketplace</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/?type=product" className="text-white/80 hover:text-white transition-colors">Products</Link></li>
                <li><Link href="/?type=service" className="text-white/80 hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/?type=pet" className="text-white/80 hover:text-white transition-colors">Pets</Link></li>
                <li><Link href="/?type=job" className="text-white/80 hover:text-white transition-colors">Jobs</Link></li>
                <li><Link href="/store/manage" className="text-white/80 hover:text-white transition-colors">Sell on Komuna</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-white/80 hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-white/80 hover:text-white transition-colors">Contact</a></li>
                <li><a href="/faq" className="text-white/80 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/terms" className="text-white/80 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/help" className="text-white/80 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/shipping" className="text-white/80 hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="/returns" className="text-white/80 hover:text-white transition-colors">Returns & Refunds</a></li>
                <li><a href="/safety" className="text-white/80 hover:text-white transition-colors">Safety Tips</a></li>
                <li><a href="mailto:support@komuna.com" className="text-white/80 hover:text-white transition-colors">support@komuna.com</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-sm text-white/80">
              © {new Date().getFullYear()} Komuna Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
