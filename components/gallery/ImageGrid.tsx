'use client';

import React, { useState, useCallback } from 'react';
import { Artwork } from '@/lib/types';
import { useCartActions, useIsInCart } from '@/lib/cart-store';
import { useModalActions } from '@/lib/modal-store';
import { useLazyLoading } from '@/lib/hooks/useLazyLoading';
import { ArtworkImageWithFallback } from '@/components/ui/ErrorHandledImage';

interface ImageGridProps {
  artworks: Artwork[];
}

interface ImageCardProps {
  artwork: Artwork;
  onImageClick: (_artwork: Artwork) => void;
  onCartToggle: (_artwork: Artwork) => void;
}

function ImageCard({ artwork, onImageClick, onCartToggle }: ImageCardProps) {
  const [, setImageLoaded] = useState(false);
  const [, setImageError] = useState(false);
  const isInCart = useIsInCart(artwork.id);

  // Enhanced lazy loading with intersection observer
  const {
    ref: cardRef,
    inView,
    hasBeenSeen,
  } = useLazyLoading({
    rootMargin: '100px', // Load images 100px before they come into view
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleImageClick = useCallback(() => {
    onImageClick(artwork);
  }, [artwork, onImageClick]);

  const handleCartToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering image click
      onCartToggle(artwork);
    },
    [artwork, onCartToggle]
  );

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={`group relative overflow-hidden rounded-lg bg-primary-50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        isInCart ? 'ring-2 ring-primary-600 ring-offset-2' : ''
      }`}
      onClick={handleImageClick}
      role="button"
      aria-label={`View details for ${artwork.title}`}
      data-testid="artwork-card"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleImageClick();
        }
      }}
    >
      {/* Aspect ratio container */}
      <div className="aspect-square relative">
        {inView || hasBeenSeen ? (
          <ArtworkImageWithFallback
            artworkId={artwork.id}
            size="thumbnail"
            alt={`${artwork.title} - ${artwork.id}`}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-110`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            quality={80}
          />
        ) : (
          // Loading skeleton before intersection
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 animate-pulse flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Artwork ID Badge */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-white/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium text-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {artwork.id}
        </div>

        {/* Cart Selection Button */}
        <button
          onClick={handleCartToggle}
          className={`absolute top-1 sm:top-2 right-1 sm:right-2 touch-target p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isInCart
              ? 'bg-primary-600 text-white opacity-100'
              : 'bg-white/90 text-primary-800 opacity-0 group-hover:opacity-100 active:bg-white'
          }`}
          aria-label={
            isInCart
              ? `Remove ${artwork.id} from cart`
              : `Add ${artwork.id} to cart`
          }
        >
          {isInCart ? (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
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

        {/* View Details Button - Hidden on mobile for better UX */}
        <div className="hidden sm:block absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 text-primary-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>

        {/* Selected Indicator Overlay */}
        {isInCart && (
          <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
            <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Selected
            </div>
          </div>
        )}
      </div>

      {/* Artwork Info */}
      <div className="p-2 sm:p-3">
        <h3 className="font-medium text-primary-900 text-xs sm:text-sm mb-1 line-clamp-1">
          {artwork.title}
        </h3>
        <p className="text-xs text-primary-600 line-clamp-2 hidden sm:block">
          {artwork.description}
        </p>
        {artwork.year && (
          <p className="text-xs text-primary-500 mt-1 hidden sm:block">
            {artwork.year}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ImageGrid({ artworks }: ImageGridProps) {
  const { toggleItem } = useCartActions();
  const { openModal } = useModalActions();

  const handleImageClick = useCallback(
    (artwork: Artwork) => {
      openModal(artwork);
    },
    [openModal]
  );

  const handleCartToggle = useCallback(
    (artwork: Artwork) => {
      toggleItem(artwork);
    },
    [toggleItem]
  );

  if (artworks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-primary-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-primary-900 mb-2">
          No artworks found
        </h3>
        <p className="text-primary-600">
          This category doesn&apos;t contain any artworks yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Grid Container */}
      <div
        role="grid"
        aria-label="Artwork gallery"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-6"
      >
        {artworks.map(artwork => (
          <ImageCard
            key={artwork.id}
            artwork={artwork}
            onImageClick={handleImageClick}
            onCartToggle={handleCartToggle}
          />
        ))}
      </div>

      {/* Grid Stats */}
      <div className="mt-12 text-center">
        <p className="text-sm text-primary-600">
          Showing {artworks.length}{' '}
          {artworks.length === 1 ? 'artwork' : 'artworks'}
        </p>
      </div>
    </div>
  );
}
