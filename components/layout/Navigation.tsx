'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about/' },
  { name: 'Work', href: '/work/' },
  { name: 'Press', href: '/press/' },
  { name: 'Contact', href: '/contact/' },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent body scroll when menu is open
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Cleanup body scroll on unmount and route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      document.body.style.overflow = 'unset';
    };

    // Close menu on route change
    handleRouteChange();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [pathname]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary-200">
      <div className="container-custom relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="text-xl font-light text-primary-900 hover:text-primary-700 transition-colors duration-200"
            onClick={closeMenu}
          >
            Artist Portfolio
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  isActive(item.href)
                    ? 'text-primary-900'
                    : 'text-primary-600 hover:text-primary-900'
                }`}
              >
                <span className="relative z-10 transition-transform duration-200 group-hover:scale-105">
                  {item.name}
                </span>

                {/* Active indicator */}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-900 rounded-full animate-slide-up" />
                )}

                {/* Hover indicator */}
                <span
                  className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ${
                    isActive(item.href)
                      ? 'opacity-0'
                      : 'opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100'
                  }`}
                />

                {/* Hover background */}
                <span className="absolute inset-0 -mx-2 -my-1 bg-primary-50 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100" />
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden relative z-50 touch-target p-3 rounded-xl transition-all duration-200 group ${
              isMenuOpen
                ? 'bg-white/95 shadow-lg border border-primary-200 backdrop-blur-sm'
                : 'hover:bg-primary-50 active:bg-primary-100'
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center relative z-10">
              <span
                className={`block w-6 h-0.5 bg-primary-900 transition-all duration-300 ease-out ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1.5'
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-primary-900 transition-all duration-300 ease-out ${
                  isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-primary-900 transition-all duration-300 ease-out ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1.5'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation Menu - Fullscreen Overlay */}
        <div
          className={`md:hidden fixed inset-0 z-30 transition-all duration-500 ease-out ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${
              isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMenu}
          />

          {/* Menu Panel */}
          <div
            className={`absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-primary-200 shadow-2xl transition-all duration-500 ease-out z-10 ${
              isMenuOpen
                ? 'translate-y-0 opacity-100'
                : '-translate-y-full opacity-0'
            }`}
          >
            <div className="container-custom">
              <div className="py-8 space-y-2">
                {navigationItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className={`group block px-6 py-4 text-lg font-medium rounded-2xl transition-all duration-300 touch-target transform relative overflow-hidden ${
                      isActive(item.href)
                        ? 'text-primary-900 bg-gradient-to-r from-primary-50 to-primary-100 shadow-sm'
                        : 'text-primary-600 hover:text-primary-900 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 active:scale-95'
                    } ${
                      isMenuOpen
                        ? 'translate-x-0 opacity-100'
                        : 'translate-x-8 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isMenuOpen
                        ? `${index * 100 + 200}ms`
                        : '0ms',
                    }}
                  >
                    {/* Background animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                    <div className="relative flex items-center justify-between">
                      <span className="flex items-center space-x-3">
                        {/* Icon for each menu item */}
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isActive(item.href)
                              ? 'bg-primary-600 scale-100'
                              : 'bg-primary-300 scale-75 group-hover:bg-primary-500 group-hover:scale-100'
                          }`}
                        />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {item.name}
                        </span>
                      </span>

                      {/* Active indicator */}
                      {isActive(item.href) && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-primary-500 font-medium">
                            Current
                          </span>
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse" />
                        </div>
                      )}

                      {/* Arrow for non-active items */}
                      {!isActive(item.href) && (
                        <svg
                          className="w-5 h-5 text-primary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Additional mobile menu content */}
              <div
                className={`border-t border-primary-200 py-6 transition-all duration-500 ${
                  isMenuOpen
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: isMenuOpen ? '800ms' : '0ms' }}
              >
                <div className="px-6 text-center">
                  <p className="text-sm text-primary-500 mb-4">
                    Contemporary Artist Portfolio
                  </p>
                  <div className="flex justify-center space-x-6">
                    <a
                      href="mailto:artist@example.com"
                      className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                      aria-label="Email"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </a>
                    <a
                      href="https://instagram.com/artist"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                      aria-label="Instagram"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.68.333 3.982.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.837.131 5.65.072 6.867.013 8.086 0 8.553 0 12.017c0 3.470.013 3.932.072 5.15.059 1.218.261 2.031.558 2.728.306.789.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.697.297 1.510.499 2.728.558C7.929 23.987 8.396 24 12.017 24c3.624 0 4.09-.013 5.31-.072 1.217-.06 2.03-.262 2.727-.558.789-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.697.499-1.509.558-2.728.06-1.217.072-1.685.072-5.309 0-3.47-.012-3.932-.072-5.15-.059-1.218-.262-2.031-.558-2.728-.306-.789-.718-1.459-1.384-2.126C19.76.952 19.091.541 18.302.235c-.697-.297-1.509-.499-2.728-.558C14.365.013 13.898 0 12.017 0zm.265 1.44c3.499 0 3.91.013 5.29.072 1.276.059 1.967.274 2.427.456.61.237 1.045.52 1.502.976.456.456.739.892.976 1.502.182.46.397 1.15.456 2.427.059 1.38.072 1.791.072 5.29 0 3.5-.013 3.91-.072 5.29-.059 1.276-.274 1.967-.456 2.427a4.12 4.12 0 01-.976 1.502 4.12 4.12 0 01-1.502.976c-.46.182-1.15.397-2.427.456-1.38.059-1.791.072-5.29.072-3.5 0-3.91-.013-5.29-.072-1.276-.059-1.967-.274-2.427-.456a4.12 4.12 0 01-1.502-.976 4.12 4.12 0 01-.976-1.502c-.182-.46-.397-1.15-.456-2.427-.059-1.38-.072-1.791-.072-5.29 0-3.499.013-3.91.072-5.29.059-1.276.274-1.967.456-2.427.237-.61.52-1.045.976-1.502.456-.456.892-.739 1.502-.976.46-.182 1.15-.397 2.427-.456 1.38-.059 1.791-.072 5.29-.072z" />
                        <path d="M12.017 5.838a6.18 6.18 0 100 12.36 6.18 6.18 0 000-12.36zM12.017 16a4 4 0 110-8 4 4 0 010 8z" />
                        <circle cx="18.406" cy="5.594" r="1.44" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
