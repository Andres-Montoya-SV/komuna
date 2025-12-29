'use client';

import Navbar from '@/components/Navbar/Navbar.component';
import Link from 'next/link';

export default function HelpPage() {
  const helpCategories = [
    {
      title: 'Getting Started',
      items: [
        { question: 'How do I create an account?', link: '/faq' },
        { question: 'How do I browse items?', link: '/faq' },
        { question: 'How do I search for items?', link: '/faq' },
      ],
    },
    {
      title: 'Buying',
      items: [
        { question: 'How do I make a purchase?', link: '/faq' },
        { question: 'What payment methods are accepted?', link: '/faq' },
        { question: 'How do I track my order?', link: '/faq' },
      ],
    },
    {
      title: 'Selling',
      items: [
        { question: 'How do I list an item?', link: '/faq' },
        { question: 'What are the seller fees?', link: '/faq' },
        { question: 'How do I manage my store?', link: '/faq' },
      ],
    },
    {
      title: 'Account & Security',
      items: [
        { question: 'How do I change my password?', link: '/faq' },
        { question: 'How do I update my profile?', link: '/faq' },
        { question: 'How do I delete my account?', link: '/faq' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-4">Help Center</h1>
          <p className="text-base-content/70 mb-8">
            Find answers to common questions and learn how to get the most out of Komuna.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {helpCategories.map((category, index) => (
              <div key={index} className="card bg-white border-2 border-primary/10 shadow-lg">
                <div className="card-body">
                  <h2 className="text-xl font-bold mb-4">{category.title}</h2>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <Link href={item.link} className="text-primary hover:underline">
                          {item.question}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-primary/10 border-2 border-primary/20">
            <div className="card-body text-center">
              <h3 className="text-xl font-bold mb-2">Still need help?</h3>
              <p className="text-base-content/80 mb-4">
                Our support team is here to help you 24/7.
              </p>
              <Link href="/contact" className="btn btn-primary">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

