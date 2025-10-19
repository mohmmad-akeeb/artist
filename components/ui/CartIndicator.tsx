'use client';

import { useCartStore } from '@/lib/cart-store';
import Link from 'next/link';

interface CartIndicatorProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the cart even when empty */
  showWhenEmpty?: boolean;
}

export default function CartIndicator({
  className = '',
  showWhenEmpty = false,
}: CartIndicatorProps) {
  const itemCount = useCartStore(state => state.getItemCount());

  // Don't render if cart is empty and showWhenEmpty is false
  if (itemCount === 0 && !showWhenEmpty) {
    return null;
  }

  return (
    <Link
      href="/contact"
      className={`
        fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 
        bg-primary-900 text-white 
        rounded-full shadow-lg hover:shadow-xl active:shadow-md
        transition-all duration-300 hover:scale-105 active:scale-95
        flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3
        touch-target group
        animate-slide-up
        ${className}
      `}
      aria-label={
        itemCount === 0
          ? 'View cart'
          : `Order prints for ${itemCount} selected artwork${itemCount === 1 ? '' : 's'}`
      }
    >
      {/* Cart Icon */}
      <div className="relative">
        <svg
          className="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
          />
        </svg>

        {/* Item Count Badge */}
        {itemCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-bounce">
            {itemCount > 99 ? '99+' : itemCount}
          </div>
        )}
      </div>

      {/* Text Label */}
      <span className="font-medium text-xs sm:text-sm transition-all duration-200 group-hover:text-primary-100">
        {itemCount === 0
          ? 'Cart'
          : `Order ${itemCount} Print${itemCount === 1 ? '' : 's'}`}
      </span>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 scale-110" />
    </Link>
  );
}
