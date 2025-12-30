'use client';

import Navbar from '@/components/Navbar/Navbar.component';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-6">About Komuna</h1>

          <div className="card bg-white border-2 border-primary/10 shadow-lg mb-6">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-base-content/80 leading-relaxed mb-4">
                Komuna is El Salvador&apos;s premier marketplace connecting communities through
                products, services, pets, and job opportunities. We aim to create a trusted platform
                where people can buy, sell, and discover everything they need.
              </p>
              <p className="text-base-content/80 leading-relaxed">
                Our platform brings together buyers and sellers in a secure, user-friendly
                environment that promotes local commerce and community growth.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-3">What We Offer</h3>
                <ul className="space-y-2 text-base-content/80">
                  <li>✓ Products from local and international sellers</li>
                  <li>✓ Professional services directory</li>
                  <li>✓ Pet adoption and sales</li>
                  <li>✓ Job opportunities and career growth</li>
                  <li>✓ Secure transactions and verified sellers</li>
                </ul>
              </div>
            </div>

            <div className="card bg-white border-2 border-primary/10 shadow-lg">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-3">Why Choose Komuna</h3>
                <ul className="space-y-2 text-base-content/80">
                  <li>✓ Easy to use interface</li>
                  <li>✓ Comprehensive search and filters</li>
                  <li>✓ Safe and secure platform</li>
                  <li>✓ Support for local businesses</li>
                  <li>✓ 24/7 customer support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
