'use client';

import { useState, FormEvent } from 'react';
import { CartItem } from '@/types/marketplace.types';
import CheckoutForm from './CheckoutForm.component';
import CheckoutSummary from './CheckoutSummary.component';

interface CheckoutProps {
  items: CartItem[];
  onComplete?: (orderData: OrderData) => void;
  onCancel?: () => void;
}

export interface OrderData {
  email: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  paymentMethod: string;
}

export default function Checkout({ items, onComplete, onCancel }: CheckoutProps) {
  const [orderData, setOrderData] = useState<Partial<OrderData>>({});

  const total = items.reduce((sum, item) => sum + item.item.price * item.quantity, 0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      orderData.email &&
      orderData.name &&
      orderData.address &&
      orderData.city &&
      orderData.zipCode &&
      orderData.paymentMethod
    ) {
      onComplete?.(orderData as OrderData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <CheckoutForm orderData={orderData} onDataChange={setOrderData} />
          </div>
          <div className="lg:w-1/3">
            <CheckoutSummary items={items} total={total} />
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn btn-ghost flex-1" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                Place Order
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
