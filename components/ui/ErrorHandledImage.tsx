'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { createImageErrorHandler } from '@/lib/error-handling';

interface ErrorHandledImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackSrc?: string;
  showErrorState?: boolean;
  onError?: () => void;
  onLoad?: () => void;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export default function ErrorHandledImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  fallbackSrc,
  showErrorState = true,
  onError,
  onLoad,
  priority = false,
  sizes,
  quality = 75,
}: ErrorHandledImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(true);
      setIsLoading(false);
      onError?.();

      // Use the error handler utility
      const errorHandler = createImageErrorHandler(fallbackSrc);
      errorHandler(event);
    },
    [fallbackSrc, onError]
  );

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Show error state if image failed and no fallback
  if (hasError && !fallbackSrc && showErrorState) {
    return (
      <div
        data-testid="error-state"
        className={`bg-primary-100 flex items-center justify-center ${className}`}
        style={
          width && height
            ? { width, height }
            : fill
              ? { width: '100%', height: '100%' }
              : undefined
        }
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 text-primary-400 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-primary-600">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 animate-pulse flex items-center justify-center ${className}`}
        >
          <svg
            className="w-6 h-6 text-primary-400"
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

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
        quality={quality}
      />
    </div>
  );
}

// Specialized component for artwork images with Cloudflare R2 fallbacks
interface ArtworkImageWithFallbackProps
  extends Omit<ErrorHandledImageProps, 'src' | 'fallbackSrc'> {
  artworkId: string;
  size?: 'thumbnail' | 'medium' | 'full';
}

export function ArtworkImageWithFallback({
  artworkId,
  size = 'medium',
  alt,
  ...props
}: ArtworkImageWithFallbackProps) {
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
  const category = artworkId.charAt(0);

  // Primary source
  const primarySrc = `${baseUrl}/${category}/${artworkId}-${size}.jpg`;

  // Fallback sources in order of preference
  const fallbackSources = [
    `${baseUrl}/${category}/${artworkId}-medium.jpg`,
    `${baseUrl}/${category}/${artworkId}-thumbnail.jpg`,
    `/images/artwork-placeholder.svg`,
  ];

  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasTriedPrimary, setHasTriedPrimary] = useState(false);

  const handleError = useCallback(() => {
    if (!hasTriedPrimary) {
      setHasTriedPrimary(true);
      setCurrentSrcIndex(0);
    } else if (currentSrcIndex < fallbackSources.length - 1) {
      setCurrentSrcIndex(prev => prev + 1);
    }
  }, [hasTriedPrimary, currentSrcIndex, fallbackSources.length]);

  const currentSrc = hasTriedPrimary
    ? fallbackSources[currentSrcIndex]
    : primarySrc;

  return (
    <ErrorHandledImage
      src={currentSrc}
      alt={alt}
      onError={handleError}
      showErrorState={currentSrcIndex === fallbackSources.length - 1}
      {...props}
    />
  );
}
