'use client';

import { CartItem as CartItemType } from '@/types/marketplace.types';
import Image from 'next/image';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
}

export default function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const subtotal = item.item.price * item.quantity;

  return (
    <div className="card bg-white border-2 border-base-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <figure className="flex-shrink-0">
            <Image
              width={128}
              height={128}
              src={item.item.image}
              alt={item.item.name}
              className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border-2 border-base-200"
              loading="lazy"
            />
          </figure>
          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-lg text-base-content mb-1 line-clamp-2">
              {item.item.name}
            </h3>
            <p className="text-base-content/60 text-sm line-clamp-2 mb-2">
              {item.item.description}
            </p>
            <p className="text-primary font-bold text-base">{formatPrice(item.item.price)} each</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <button
                className="btn btn-sm btn-circle btn-outline border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => onUpdateQuantity?.(item.item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-10 text-center font-semibold text-base">{item.quantity}</span>
              <button
                className="btn btn-sm btn-circle btn-outline border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => onUpdateQuantity?.(item.item.id, item.quantity + 1)}
                /* @ts-expect-error stock exists on product type */
                disabled={item.quantity >= item.item.stock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <p className="font-bold text-lg text-primary">{formatPrice(subtotal)}</p>
              <button
                className="btn btn-sm btn-error btn-ghost text-error hover:bg-error/10"
                onClick={() => onRemove?.(item.item.id)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
