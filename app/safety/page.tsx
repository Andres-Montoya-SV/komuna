'use client';

import Navbar from '@/components/Navbar/Navbar.component';

export default function SafetyPage() {
  const safetyTips = [
    {
      title: 'For Buyers',
      tips: [
        'Always verify seller ratings and reviews before making a purchase',
        'Use secure payment methods through our platform',
        'Meet in public places when purchasing items in person',
        'Inspect items thoroughly before completing a purchase',
        'Report suspicious listings or sellers immediately',
        'Keep all communication within the platform',
      ],
    },
    {
      title: 'For Sellers',
      tips: [
        'Provide accurate descriptions and photos of your items',
        'Respond promptly to buyer inquiries',
        'Package items securely for shipping',
        'Keep records of all transactions',
        'Report suspicious buyers or transactions',
        'Follow platform guidelines and policies',
      ],
    },
    {
      title: 'General Safety',
      tips: [
        'Never share personal information like passwords or banking details',
        'Be cautious of deals that seem too good to be true',
        'Verify the identity of buyers/sellers when meeting in person',
        'Use the platform\'s messaging system for all communications',
        'Trust your instincts - if something feels wrong, it probably is',
        'Report any fraudulent activity to our support team',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-4">Safety Tips</h1>
          <p className="text-base-content/70 mb-8">
            Your safety is our priority. Follow these guidelines to have a safe and secure experience on Komuna.
          </p>

          <div className="space-y-6">
            {safetyTips.map((section, index) => (
              <div key={index} className="card bg-white border-2 border-primary/10 shadow-lg">
                <div className="card-body">
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                  <ul className="space-y-3">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-base-content/80">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="card bg-error/10 border-2 border-error/20">
              <div className="card-body">
                <h2 className="text-2xl font-bold mb-4 text-error">Report Issues</h2>
                <p className="text-base-content/80 mb-4">
                  If you encounter any safety issues, fraudulent activity, or suspicious behavior, 
                  please report it to us immediately. We take all reports seriously and will investigate promptly.
                </p>
                <a href="/contact" className="btn btn-error">
                  Report an Issue
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

