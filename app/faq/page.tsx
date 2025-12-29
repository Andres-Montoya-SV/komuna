'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar.component';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I create an account?',
    answer: 'Click on "Sign Up" in the top right corner, fill in your information, and choose whether you want to be a buyer or seller. You\'ll receive a confirmation email to verify your account.',
  },
  {
    question: 'How do I list an item for sale?',
    answer: 'After creating a seller account, go to "Manage Store" from your profile menu. Click "Add Product" and fill in the item details. Make sure to include clear photos and accurate descriptions.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards, debit cards, PayPal, and bank transfers. Payment is securely processed through our platform to protect both buyers and sellers.',
  },
  {
    question: 'How do I contact a seller?',
    answer: 'You can contact sellers directly through their store page or by using the contact button on individual product listings. All communications are logged for safety.',
  },
  {
    question: 'What is your return policy?',
    answer: 'Return policies vary by seller. Please check the individual seller\'s return policy before making a purchase. We recommend reviewing return policies for each item you\'re interested in.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also view your order status in your account dashboard under "My Orders".',
  },
  {
    question: 'Is it safe to buy pets on Komuna?',
    answer: 'Yes, we verify all pet sellers and provide safety guidelines. We recommend meeting in person before finalizing any pet purchase and ensuring all vaccinations and documentation are in order.',
  },
  {
    question: 'How do I apply for a job listing?',
    answer: 'Click on the job listing you\'re interested in, then click "Apply Now". You\'ll be able to upload your resume and cover letter. The employer will contact you if you\'re selected.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Frequently Asked Questions</h1>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card bg-white border-2 border-primary/10 shadow-lg"
              >
                <div className="card-body">
                  <button
                    className="flex items-center justify-between w-full text-left"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <h3 className="text-lg font-bold text-primary">{faq.question}</h3>
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openIndex === index && (
                    <p className="text-base-content/80 mt-4 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-primary/10 border-2 border-primary/20 mt-8">
            <div className="card-body text-center">
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-base-content/80 mb-4">
                Can't find what you're looking for? Contact our support team.
              </p>
              <a href="/contact" className="btn btn-primary">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

