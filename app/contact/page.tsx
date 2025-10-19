'use client';

import { useEffect, useState } from 'react';
import ContactForm from '@/components/forms/ContactForm';
import CartManager from '@/components/ui/CartManager';
import { useCartStore, useCartStats } from '@/lib/cart-store';
import { FormErrorBoundary } from '@/components/error/ErrorBoundary';

export default function Contact() {
  const { getFormattedList, clearCart } = useCartStore();
  const stats = useCartStats();
  const [initialMessage, setInitialMessage] = useState('');

  // Pre-populate message with cart items when component mounts or cart changes
  useEffect(() => {
    if (!stats.isEmpty) {
      const cartMessage = getFormattedList();
      setInitialMessage(cartMessage);
    } else {
      setInitialMessage('');
    }
  }, [stats.isEmpty, getFormattedList]);

  const handleFormSuccess = () => {
    // Clear cart after successful submission
    if (!stats.isEmpty) {
      clearCart();
    }
  };

  const handleCartCleared = () => {
    setInitialMessage('');
  };

  return (
    <div className="container-custom py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-primary-900 mb-4">
          Contact
        </h1>
        <p className="text-base sm:text-lg text-primary-600 max-w-2xl mx-auto px-4">
          Get in touch for commissions, print inquiries, or general questions
          about my work.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 max-w-6xl mx-auto">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <FormErrorBoundary>
            <ContactForm
              initialMessage={initialMessage}
              onSubmitSuccess={handleFormSuccess}
            />
          </FormErrorBoundary>
        </div>

        {/* Cart and Contact Info */}
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          {/* Cart Manager */}
          <div>
            <h2 className="text-lg sm:text-xl font-medium text-primary-900 mb-4">
              Selected Prints
            </h2>
            <CartManager
              showFormattedList={false}
              onCartCleared={handleCartCleared}
            />
          </div>

          {/* Contact Information */}
          <div className="bg-primary-50 p-4 sm:p-6 rounded-lg">
            <h3 className="text-base sm:text-lg font-medium text-primary-900 mb-4">
              Other Ways to Connect
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-primary-700">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-3 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                artist@example.com
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-3 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.68.333 3.982.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.837.131 5.65.072 6.867.013 8.086 0 8.553 0 12.017c0 3.470.013 3.932.072 5.15.059 1.218.261 2.031.558 2.728.306.789.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.697.297 1.510.499 2.728.558C7.929 23.987 8.396 24 12.017 24c3.624 0 4.09-.013 5.31-.072 1.217-.06 2.03-.262 2.727-.558.789-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.697.499-1.509.558-2.728.06-1.217.072-1.685.072-5.309 0-3.47-.012-3.932-.072-5.15-.059-1.218-.262-2.031-.558-2.728-.306-.789-.718-1.459-1.384-2.126C19.76.952 19.091.541 18.302.235c-.697-.297-1.509-.499-2.728-.558C14.365.013 13.898 0 12.017 0zm.265 1.44c3.499 0 3.91.013 5.29.072 1.276.059 1.967.274 2.427.456.61.237 1.045.52 1.502.976.456.456.739.892.976 1.502.182.46.397 1.15.456 2.427.059 1.38.072 1.791.072 5.29 0 3.5-.013 3.91-.072 5.29-.059 1.276-.274 1.967-.456 2.427a4.12 4.12 0 01-.976 1.502 4.12 4.12 0 01-1.502.976c-.46.182-1.15.397-2.427.456-1.38.059-1.791.072-5.29.072-3.5 0-3.91-.013-5.29-.072-1.276-.059-1.967-.274-2.427-.456a4.12 4.12 0 01-1.502-.976 4.12 4.12 0 01-.976-1.502c-.182-.46-.397-1.15-.456-2.427-.059-1.38-.072-1.791-.072-5.29 0-3.499.013-3.91.072-5.29.059-1.276.274-1.967.456-2.427.237-.61.52-1.045.976-1.502.456-.456.892-.739 1.502-.976.46-.182 1.15-.397 2.427-.456 1.38-.059 1.791-.072 5.29-.072z" />
                </svg>
                @artist_portfolio
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary-200">
              <p className="text-xs text-primary-600">
                Response time: Usually within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
