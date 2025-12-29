'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  type?: 'product' | 'service' | 'pet' | 'job';
}

const navItems: NavItem[] = [
  { label: 'All', href: '/' },
  { label: 'Products', href: '/?type=product', type: 'product' },
  { label: 'Services', href: '/?type=service', type: 'service' },
  { label: 'Pets', href: '/?type=pet', type: 'pet' },
  { label: 'Jobs', href: '/?type=job', type: 'job' },
];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get user from localStorage on client side
  if (typeof window !== 'undefined' && !user) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }

  return (
    <nav className="bg-white border-b-2 border-primary/20 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-primary">Komuna</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium text-base-content"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/stores"
              className="px-4 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium text-base-content"
            >
              Stores
            </Link>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border-2 border-primary/10 mt-2">
                  <li><Link href="/profile">Profile</Link></li>
                  {user.role === 'seller' && (
                    <>
                      <li><Link href="/store/manage">Manage Store</Link></li>
                      <li><Link href={`/store/${user.id}`}>View Store</Link></li>
                    </>
                  )}
                  <li className="divider"></li>
                  <li>
                    <a 
                      href="#" 
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          // Only import Firebase auth on client side
                          if (typeof window !== 'undefined') {
                            const { firebaseAuth } = await import('@/lib/firebase/auth');
                            await firebaseAuth.logout();
                          }
                        } catch (error) {
                          console.error('Logout error:', error);
                        }
                        localStorage.removeItem('user');
                        window.location.href = '/';
                      }}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link 
                  href={`/login${typeof window !== 'undefined' && window.location.pathname !== '/' ? `?redirect=${encodeURIComponent(window.location.pathname)}` : ''}`} 
                  className="btn btn-ghost btn-sm hidden sm:inline-flex"
                >
                  Login
                </Link>
                <Link 
                  href={`/register${typeof window !== 'undefined' && window.location.pathname !== '/' ? `?redirect=${encodeURIComponent(window.location.pathname)}` : ''}`} 
                  className="btn btn-primary btn-sm text-white"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-primary/20 py-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/stores"
                className="px-4 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Stores
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

