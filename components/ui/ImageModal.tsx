'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { Artwork } from '@/lib/types';
import { useCartActions, useIsInCart } from '@/lib/cart-store';

interface ImageModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** The artwork to display in the modal */
  artwork: Artwork | null;
  /** Callback function to close the modal */
  onClose: () => void;
}

export default function ImageModal({
  isOpen,
  artwork,
  onClose,
}: ImageModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isInCart = useIsInCart(artwork?.id || '');
  const { toggleItem } = useCartActions();

  // Reset image loading state when artwork changes
  useEffect(() => {
    if (artwork) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [artwork]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click to close modal
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle cart toggle
  const handleCartToggle = useCallback(() => {
    if (artwork) {
      toggleItem(artwork);
    }
  }, [artwork, toggleItem]);

  // Don't render if not open or no artwork
  if (!isOpen || !artwork) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-out ${
        isOpen
          ? 'opacity-100 backdrop-blur-md bg-black/80'
          : 'opacity-0 pointer-events-none backdrop-blur-none bg-black/0'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Modal Container */}
      <div
        className={`relative w-full h-full max-w-7xl max-h-screen mx-4 my-4 bg-white rounded-lg shadow-2xl overflow-hidden transform transition-all duration-500 ease-out ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0 rotate-0'
            : 'scale-90 opacity-0 translate-y-8 rotate-1'
        } flex flex-col lg:flex-row`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 touch-target p-2 bg-white/90 hover:bg-white active:bg-gray-100 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 transition-transform duration-200 group-hover:rotate-90"
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

          {/* Hover ring effect */}
          <div className="absolute inset-0 rounded-full bg-gray-200 opacity-0 group-hover:opacity-20 transition-opacity duration-200 scale-150" />
        </button>

        {/* Image Section */}
        <div className="flex-1 relative bg-gray-100 flex items-center justify-center min-h-[50vh] lg:min-h-full">
          {!imageError ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <Image
                src={artwork.imageUrl}
                alt={`${artwork.title} - ${artwork.id}`}
                fill
                className={`object-contain transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />

              {/* Loading State */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
                </div>
              )}
            </div>
          ) : (
            // Error State
            <div className="flex flex-col items-center justify-center text-gray-500 p-8">
              <svg
                className="w-16 h-16 mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2">Image unavailable</h3>
              <p className="text-sm text-center">
                Sorry, this image could not be loaded.
              </p>
            </div>
          )}

          {/* Image Overlay Info (Mobile) */}
          <div className="absolute bottom-4 left-4 lg:hidden">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
              <span className="text-sm font-medium text-primary-800">
                {artwork.id}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full lg:w-96 xl:w-[28rem] bg-white flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1
                  id="modal-title"
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  {artwork.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-medium">{artwork.id}</span>
                  {artwork.year && (
                    <>
                      <span>•</span>
                      <span>{artwork.year}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Cart Button */}
              <button
                onClick={handleCartToggle}
                className={`touch-target p-2 sm:p-3 rounded-full transition-all duration-200 ${
                  isInCart
                    ? 'bg-primary-800 text-white hover:bg-primary-900 active:bg-primary-700'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200 active:bg-primary-300'
                }`}
                aria-label={
                  isInCart
                    ? `Remove ${artwork.id} from cart`
                    : `Add ${artwork.id} to cart`
                }
              >
                {isInCart ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Status Indicator */}
            {isInCart && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-900">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Selected for print inquiry
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  Description
                </h3>
                <p
                  id="modal-description"
                  className="text-gray-700 leading-relaxed"
                >
                  {artwork.description}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Details
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Category</dt>
                    <dd className="text-gray-900">
                      Category {artwork.category}
                    </dd>
                  </div>

                  {artwork.year && (
                    <div>
                      <dt className="font-medium text-gray-500">Year</dt>
                      <dd className="text-gray-900">{artwork.year}</dd>
                    </div>
                  )}

                  {artwork.medium && (
                    <div>
                      <dt className="font-medium text-gray-500">Medium</dt>
                      <dd className="text-gray-900">{artwork.medium}</dd>
                    </div>
                  )}

                  {artwork.dimensions && (
                    <div>
                      <dt className="font-medium text-gray-500">Dimensions</dt>
                      <dd className="text-gray-900">{artwork.dimensions}</dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Print Inquiry CTA */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Interested in a print?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {isInCart
                    ? 'This artwork is selected for your print inquiry.'
                    : 'Add this artwork to your selection and contact us for pricing.'}
                </p>
                <button
                  onClick={handleCartToggle}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isInCart
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-primary-800 text-white hover:bg-primary-900'
                  }`}
                >
                  {isInCart ? 'Remove from Selection' : 'Add to Selection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
