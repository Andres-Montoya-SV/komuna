'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import RegisterForm from '@/components/Auth/RegisterForm.component';
import FadeIn from '@/components/Animations/FadeIn.component';
import { RegisterData } from '@/types/auth.types';
import { firebaseAuth } from '@/lib/firebase/auth';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
      }
    }
  }, [router, searchParams]);

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await firebaseAuth.register(data);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        
        const redirectTo = searchParams.get('redirect') || '/';
        // If seller and no redirect, go to store setup
        if (user.role === 'seller' && !searchParams.get('redirect')) {
          router.push('/store/manage');
        } else {
          router.push(redirectTo);
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const redirectTo = searchParams.get('redirect') || '/';
    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-base-200 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <FadeIn>
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="btn btn-ghost btn-sm mb-4"
            aria-label="Go back"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          <div className="card bg-white border-2 border-primary/10 shadow-xl">
          <div className="card-body">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-primary">Create Account</h1>
              <p className="text-base-content/70 mt-2">Join Komuna marketplace today</p>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={() => router.push('/login')}
              isLoading={isLoading}
            />
          </div>
        </div>
        </FadeIn>
      </div>
    </div>
  );
}

