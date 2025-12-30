'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import LoginForm from '@/components/Auth/LoginForm.component';
import FadeIn from '@/components/Animations/FadeIn.component';
import { LoginCredentials } from '@/types/auth.types';
import { firebaseAuth } from '@/lib/firebase/auth';

function LoginContent() {
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

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await firebaseAuth.login(credentials);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
        router.refresh();
      } else {
        setError('Invalid email or password');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred during login. Please try again.');
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
              <p className="text-base-content/70 mt-2">Login to your Komuna account</p>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => router.push('/register')}
              isLoading={isLoading}
            />
          </div>
        </div>
        </FadeIn>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

