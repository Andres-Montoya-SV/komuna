'use client';

import Navbar from '@/components/Navbar/Navbar.component';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Terms of Service</h1>
          
          <div className="card bg-white border-2 border-primary/10 shadow-lg">
            <div className="card-body space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
                <p className="text-base-content/80 leading-relaxed">
                  By accessing and using Komuna, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">2. Use License</h2>
                <p className="text-base-content/80 leading-relaxed mb-3">
                  Permission is granted to temporarily access the materials on Komuna's website 
                  for personal, non-commercial transitory viewing only. This is the grant of a 
                  license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">3. User Accounts</h2>
                <p className="text-base-content/80 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account and 
                  password. You agree to accept responsibility for all activities that occur 
                  under your account or password.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">4. Prohibited Uses</h2>
                <p className="text-base-content/80 leading-relaxed mb-3">
                  You may not use Komuna:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>In any way that violates any applicable national or international law or regulation</li>
                  <li>To transmit, or procure the sending of, any advertising or promotional material</li>
                  <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
                  <li>In any way that infringes upon the rights of others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">5. Limitation of Liability</h2>
                <p className="text-base-content/80 leading-relaxed">
                  In no event shall Komuna or its suppliers be liable for any damages (including, 
                  without limitation, damages for loss of data or profit, or due to business 
                  interruption) arising out of the use or inability to use the materials on 
                  Komuna's website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">6. Revisions</h2>
                <p className="text-base-content/80 leading-relaxed">
                  Komuna may revise these terms of service at any time without notice. By using 
                  this website you are agreeing to be bound by the then current version of these 
                  terms of service.
                </p>
              </section>

              <div className="divider"></div>

              <p className="text-sm text-base-content/60">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

