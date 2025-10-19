'use client';

import { useCartStore, useCartStats } from '@/lib/cart-store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CartManagerProps {
  /** Whether to show the formatted list for contact form */
  showFormattedList?: boolean;
  /** Callback when cart is cleared */
  onCartCleared?: () => void;
}

export default function CartManager({
  showFormattedList = false,
  onCartCleared,
}: CartManagerProps) {
  const { items, removeItem, clearCart, getFormattedList } = useCartStore();
  const stats = useCartStats();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const router = useRouter();

  const handleClearCart = () => {
    clearCart();
    setShowConfirmClear(false);
    onCartCleared?.();
  };

  const handleOrderPrints = () => {
    // Navigate to contact page - the contact page will automatically pre-fill with cart items
    router.push('/contact');
  };

  if (stats.isEmpty) {
    return (
      <div className="text-center py-8">
        <div className="text-primary-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-primary-900 mb-2">
          No prints selected
        </h3>
        <p className="text-primary-600">
          Browse the gallery and select artworks you&apos;re interested in for
          prints.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-primary-900">
          Selected Prints ({stats.totalItems})
        </h3>
        <button
          onClick={() => setShowConfirmClear(true)}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Category Summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(stats.categoryCounts).map(([category, count]) => (
          <span
            key={category}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
          >
            Category {category}: {count}
          </span>
        ))}
      </div>

      {/* Cart Items */}
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.artworkId}
            className="flex items-center justify-between p-3 bg-primary-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-medium text-primary-900">
                  {item.artworkId}
                </span>
                <span className="text-sm text-primary-700">{item.title}</span>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.artworkId)}
              className="text-red-600 hover:text-red-700 transition-colors p-1"
              aria-label={`Remove ${item.artworkId} from cart`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Order Prints Button */}
      <button
        onClick={handleOrderPrints}
        className="w-full bg-primary-900 text-white px-6 py-3 rounded-lg hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors font-medium"
      >
        Order Prints ({stats.totalItems})
      </button>

      {/* Formatted List for Contact Form */}
      {showFormattedList && (
        <div className="p-4 bg-primary-50 rounded-lg">
          <h4 className="text-sm font-medium text-primary-900 mb-2">
            Message Preview:
          </h4>
          <p className="text-sm text-primary-700 italic">
            {getFormattedList()}
          </p>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h4 className="text-lg font-medium text-primary-900 mb-2">
              Clear Cart?
            </h4>
            <p className="text-primary-600 mb-4">
              This will remove all {stats.totalItems} selected artworks from
              your cart.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearCart}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 bg-primary-100 text-primary-900 px-4 py-2 rounded-lg hover:bg-primary-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
