'use client';

import Navbar from '@/components/Navbar/Navbar.component';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Shipping Information</h1>
          
          <div className="space-y-6">
            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4">Shipping Options</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Standard Shipping</h3>
                    <p className="text-base-content/80">
                      Delivery within 5-7 business days. Free for orders over $100. $10 for orders under $100.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Express Shipping</h3>
                    <p className="text-base-content/80">
                      Delivery within 2-3 business days. $25 flat rate.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Overnight Shipping</h3>
                    <p className="text-base-content/80">
                      Next business day delivery. $50 flat rate. Available in major cities only.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4">Shipping Areas</h2>
                <p className="text-base-content/80 mb-4">
                  We currently ship to all areas in El Salvador. International shipping may be available 
                  for certain items - please contact the seller for details.
                </p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80">
                  <li>San Salvador and metropolitan area</li>
                  <li>Santa Ana</li>
                  <li>San Miguel</li>
                  <li>All major cities and towns</li>
                </ul>
              </div>
            </div>

            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4">Tracking Your Order</h2>
                <p className="text-base-content/80 mb-4">
                  Once your order ships, you'll receive a tracking number via email. You can use this 
                  number to track your package in real-time through our shipping partners.
                </p>
                <p className="text-base-content/80">
                  You can also view your order status and tracking information in your account dashboard 
                  under "My Orders".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

