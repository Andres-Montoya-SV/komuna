'use client';

import Navbar from '@/components/Navbar/Navbar.component';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Returns & Refunds</h1>

          <div className="space-y-6">
            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4">Return Policy</h2>
                <p className="text-base-content/80 mb-4">
                  Most items can be returned within 30 days of delivery. Items must be in original
                  condition with tags and packaging. Some items may have different return policies
                  as specified by the seller.
                </p>
                <div className="alert alert-info">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Please check individual seller return policies before making a purchase.
                  </span>
                </div>
              </div>
            </div>

            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4">How to Return an Item</h2>
                <ol className="list-decimal list-inside space-y-3 text-base-content/80">
                  <li>Log into your account and go to &quot;My Orders&quot;</li>
                  <li>Select the item you want to return</li>
                  <li>Click &quot;Request Return&quot; and select a reason</li>
                  <li>Print the return shipping label provided</li>
                  <li>Package the item securely with the original packaging</li>
                  <li>Drop off at the designated shipping location</li>
                </ol>
              </div>
            </div>

            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4">Refund Process</h2>
                <p className="text-base-content/80 mb-4">
                  Once we receive your returned item and verify its condition, we&apos;ll process
                  your refund within 5-7 business days. The refund will be issued to the original
                  payment method.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold">Refund Timeline:</p>
                  <ul className="list-disc list-inside space-y-1 text-base-content/80 ml-4">
                    <li>Item received: 1-2 business days</li>
                    <li>Inspection: 2-3 business days</li>
                    <li>Refund processing: 5-7 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4">Non-Returnable Items</h2>
                <p className="text-base-content/80 mb-4">The following items cannot be returned:</p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>Personalized or custom-made items</li>
                  <li>Perishable goods (food, flowers)</li>
                  <li>Digital products</li>
                  <li>Items damaged by misuse</li>
                  <li>Intimate or sanitary goods</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
