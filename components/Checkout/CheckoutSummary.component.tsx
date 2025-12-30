'use client';

import { CartItem } from '@/types/marketplace.types';

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
}

export default function CheckoutSummary({
  items,
  total,
}: CheckoutSummaryProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const shipping = total > 100 ? 0 : 10;
  const finalTotal = total + shipping;

  return (
    <div className="card bg-white border-2 border-primary/10 shadow-lg sticky top-4">
      <div className="card-body">
        <h2 className="card-title text-primary text-xl pb-4 border-b-2 border-primary/10">Order Summary</h2>
        <div className="space-y-3 mt-4 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.item.id} className="flex justify-between items-start text-sm pb-2 border-b border-base-200 last:border-b-0">
              <div className="flex-1 min-w-0 pr-2">
                <span className="font-medium block truncate">{item.item.name}</span>
                <span className="text-base-content/60">Qty: {item.quantity}</span>
              </div>
              <span className="font-semibold text-primary whitespace-nowrap">
                {formatPrice(item.item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-2 mt-4 pt-4 border-t-2 border-primary/10">
          <div className="flex justify-between">
            <span className="text-base-content/70">Subtotal</span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/70">Shipping</span>
            <span className="font-semibold">
              {shipping === 0 ? (
                <span className="text-success font-bold">FREE</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>
          <div className="divider my-2"></div>
          <div className="flex justify-between items-center text-lg font-bold text-primary">
            <span>Total</span>
            <span className="text-2xl">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

