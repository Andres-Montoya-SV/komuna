'use client';

import { CartItem } from '@/types/marketplace.types';
import CartItemComponent from './CartItem.component';
import CartSummary from './CartSummary.component';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
  onCheckout?: () => void;
}

export default function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-base-content/60">Your cart is empty</p>
      </div>
    );
  }

  const total = items.reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-4">
          {items.map((item) => (
            <CartItemComponent
              key={item.item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
            />
          ))}
        </div>
        <div className="lg:w-1/3">
          <CartSummary total={total} itemCount={items.length} onCheckout={onCheckout} />
        </div>
      </div>
    </div>
  );
}
