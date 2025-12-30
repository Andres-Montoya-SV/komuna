'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MarketplaceItem, Product, Service, Pet, Job } from '@/types/marketplace.types';
import Navbar from '@/components/Navbar/Navbar.component';
import FadeIn from '@/components/Animations/FadeIn.component';
import { sampleItems } from '@/app/data/sampleItems';
import Image from 'next/image';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // In a real app, fetch item by ID from API
    const fetchItem = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Find item from sample data
      const foundItem = sampleItems.find((i: MarketplaceItem) => i.id === params.id);

      if (foundItem) {
        setItem(foundItem);
      } else {
        // If not found, redirect to home
        router.push('/');
      }
      setIsLoading(false);
    };

    fetchItem();
  }, [params.id, router]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-accent fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-5 h-5 text-accent fill-current" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-fill-detail">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-fill-detail)"
              d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
            />
          </svg>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-5 h-5 text-base-300 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <p className="text-base-content/70 mb-4">
            The item you&apos;re looking for doesn&apos;t exist.
          </p>
          <button onClick={() => router.push('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isProduct = item.type === 'product';
  const isService = item.type === 'service';
  const isPet = item.type === 'pet';
  const isJob = item.type === 'job';
  const stock = isProduct ? (item as Product).stock : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm mb-4"
          >
            ← Back
          </motion.button>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <FadeIn delay={0.1}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="card bg-white border-2 border-primary/10 shadow-lg"
            >
              <figure className="aspect-square">
                <Image
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-t-lg"
                  width={600}
                  height={600}
                />
              </figure>
              {item.rating && (
                <div className="card-body pt-4">
                  <div className="flex items-center gap-4">
                    {renderStars(item.rating)}
                    <span className="text-lg font-semibold">{item.rating.toFixed(1)}</span>
                    {item.reviews && (
                      <span className="text-base-content/60">
                        ({item.reviews} {item.reviews === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </FadeIn>

          {/* Details Section */}
          <FadeIn delay={0.2}>
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`badge badge-lg ${
                    isProduct
                      ? 'badge-primary'
                      : isService
                        ? 'badge-success'
                        : isPet
                          ? 'badge-warning'
                          : 'badge-info'
                  }`}
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
                {item.category && (
                  <span className="badge badge-lg badge-outline">{item.category}</span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-primary mb-4">{item.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary">{formatPrice(item.price)}</span>
                {isJob && <span className="text-base-content/60">per month</span>}
                {isService && <span className="text-base-content/60">per service</span>}
              </div>

              {stock !== undefined && (
                <div className="mb-4">
                  {stock > 0 ? (
                    <span className="badge badge-success badge-lg">
                      In Stock ({stock} available)
                    </span>
                  ) : (
                    <span className="badge badge-error badge-lg">Out of Stock</span>
                  )}
                </div>
              )}

              {/* Type-specific details */}
              {isService && (
                <div className="card bg-base-100 border-2 border-primary/10 p-4">
                  <h3 className="font-semibold mb-2">Service Details</h3>
                  {(item as Service).duration && (
                    <p className="text-sm mb-1">⏱️ Duration: {(item as Service).duration}</p>
                  )}
                  {(item as Service).availability && (
                    <p className="text-sm">📅 Availability: {(item as Service).availability}</p>
                  )}
                </div>
              )}

              {isPet && (
                <div className="card bg-base-100 border-2 border-primary/10 p-4">
                  <h3 className="font-semibold mb-2">Pet Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(item as Pet).breed && <p>🐾 Breed: {(item as Pet).breed}</p>}
                    {(item as Pet).age && <p>📅 Age: {(item as Pet).age}</p>}
                    {(item as Pet).gender && <p>⚥ Gender: {(item as Pet).gender}</p>}
                    {(item as Pet).location && <p>📍 Location: {(item as Pet).location}</p>}
                  </div>
                </div>
              )}

              {isJob && (
                <div className="card bg-base-100 border-2 border-primary/10 p-4">
                  <h3 className="font-semibold mb-2">Job Details</h3>
                  <div className="space-y-2 text-sm mb-3">
                    {(item as Job).employmentType && <p>💼 Type: {(item as Job).employmentType}</p>}
                    {(item as Job).location && <p>📍 Location: {(item as Job).location}</p>}
                  </div>
                  {(item as Job).requirements && (item as Job).requirements!.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {(item as Job).requirements!.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="card bg-base-100 border-2 border-primary/10 p-6">
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-base-content/80 leading-relaxed">{item.description}</p>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                {isProduct && (
                  <div className="flex items-center gap-4">
                    <label className="font-semibold">Quantity:</label>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-sm btn-circle"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{quantity}</span>
                      <button
                        className="btn btn-sm btn-circle"
                        onClick={() => stock && setQuantity(Math.min(stock, quantity + 1))}
                        disabled={stock !== undefined && quantity >= stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    className="btn btn-primary btn-lg flex-1 text-white"
                    disabled={isProduct && stock === 0}
                  >
                    {isService
                      ? 'Book Service'
                      : isJob
                        ? 'Apply Now'
                        : isPet
                          ? 'Contact Seller'
                          : 'Add to Cart'}
                  </button>
                  <button className="btn btn-outline btn-lg border-primary text-primary hover:bg-primary hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
