'use client';

interface CartSummaryProps {
  total: number;
  itemCount: number;
  onCheckout?: () => void;
}

export default function CartSummary({
  total,
  itemCount,
  onCheckout,
}: CartSummaryProps) {
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
        <div className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-base-content/70">Items ({itemCount})</span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base-content/70">Shipping</span>
            <span className="font-semibold">
              {shipping === 0 ? (
                <span className="text-success font-bold">FREE</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>
          {total < 100 && (
            <div className="alert alert-info py-2 bg-primary/10 border-primary/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">
                Add ${(100 - total).toFixed(2)} more for free shipping!
              </span>
            </div>
          )}
          <div className="divider my-2"></div>
          <div className="flex justify-between items-center text-lg font-bold text-primary">
            <span>Total</span>
            <span className="text-2xl">{formatPrice(finalTotal)}</span>
          </div>
        </div>
        <div className="card-actions mt-6">
          <button 
            className="btn btn-primary w-full text-white hover:bg-primary-dark h-12 text-lg font-semibold"
            onClick={onCheckout}
          >
            Proceed to Checkout
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

