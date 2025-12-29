'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
  className?: string;
}

export default function GoogleAd({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}: GoogleAdProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Google AdSense script
    if (typeof window !== 'undefined' && !scriptLoaded) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT || 'ca-pub-XXXXXXXXXXXXXXXX';
      
      // Check if script already exists
      if (document.querySelector('script[src*="adsbygoogle"]')) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.warn('Failed to load Google AdSense script');
      };
      document.head.appendChild(script);
    }
  }, [scriptLoaded]);

  useEffect(() => {
    if (scriptLoaded && typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [scriptLoaded]);

  if (!isVisible) return null;

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT || 'ca-pub-XXXXXXXXXXXXXXXX';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`relative bg-white border-2 border-base-200 rounded-lg p-4 ${className}`}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 btn btn-ghost btn-xs btn-circle z-10"
          aria-label="Close ad"
          title="Close advertisement"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-xs text-base-content/50 mb-2 text-center">
          Advertisement
        </div>

        <ins
          className="adsbygoogle block text-center"
          style={{
            display: 'block',
            minHeight: adFormat === 'horizontal' ? '90px' : adFormat === 'vertical' ? '250px' : '200px',
          }}
          data-ad-client={clientId}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        />
      </motion.div>
    </AnimatePresence>
  );
}
