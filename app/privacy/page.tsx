'use client';

import Navbar from '@/components/Navbar/Navbar.component';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>

          <div className="card bg-white border-2 border-primary/10 shadow-lg">
            <div className="card-body space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-3">1. Information We Collect</h2>
                <p className="text-base-content/80 leading-relaxed mb-3">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>Name, email address, and phone number when you create an account</li>
                  <li>Payment information when you make a purchase</li>
                  <li>Content you post on the platform</li>
                  <li>Communications with other users and with us</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">2. How We Use Your Information</h2>
                <p className="text-base-content/80 leading-relaxed mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends and usage</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">3. Information Sharing</h2>
                <p className="text-base-content/80 leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. We may
                  share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4 mt-3">
                  <li>With your consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With service providers who assist us in operating our platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">4. Data Security</h2>
                <p className="text-base-content/80 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your
                  personal information. However, no method of transmission over the Internet is 100%
                  secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">5. Your Rights</h2>
                <p className="text-base-content/80 leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-base-content/80 ml-4">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify inaccurate personal data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing your personal data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">6. Cookies</h2>
                <p className="text-base-content/80 leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our platform
                  and hold certain information. You can instruct your browser to refuse all cookies
                  or to indicate when a cookie is being sent.
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
