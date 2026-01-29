/**
 * Next.js Optimized Image Component
 *
 * Enhanced image component that leverages Next.js Image optimization
 * with Cloudflare R2 integration, progressive loading, and blur placeholders.
 */

'use client';

import React, { useState, useCallback, forwardRef } from 'react';
import Image from 'next/image';
import { CategoryId, ImageSize } from '@/lib/types';
import {
  generateArtworkImageUrl,
  generateImageSrcSet,
  generateImageSizes,
  getFallbackImageUrl,
} from '@/lib/cloudflare-r2';
import {
  generateBlurDataURL,
  getImageDimensionsForSize,
} from '@/lib/image-utils';

/**
 * Props for NextOptimizedImage component
 */
export interface NextOptimizedImageProps {
  /** Artwork category */
  category: CategoryId;
  /** Artwork identifier (number or string) */
  identifier: string | number;
  /** Image size variant */
  size?: ImageSize;
  /** Alt text for the image */
  alt?: string;
  /** CSS classes for the image */
  className?: string;
  /** CSS classes for the container */
  containerClassName?: string;
  /** Whether to prioritize loading */
  priority?: boolean;
  /** Whether to fill the container */
  fill?: boolean;
  /** Image width (for static images) */
  width?: number;
  /** Image height (for static images) */
  height?: number;
  /** Image sizes for responsive images */
  sizes?: string;
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Whether to show error state */
  showError?: boolean;
  /** Custom blur placeholder */
  blurDataURL?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Whether to use responsive images with srcSet */
  responsive?: boolean;
  /** Image quality (1-100) */
  quality?: number;
}

/**
 * Loading placeholder component
 */
const LoadingPlaceholder: React.FC<{
  width?: number;
  height?: number;
  className?: string;
}> = ({ width, height, className = '' }) => (
  <div
    className={`bg-gradient-to-br from-primary-100 to-primary-200 animate-pulse flex items-center justify-center ${className}`}
    style={{
      width: width ? `${width}px` : '100%',
      height: height ? `${height}px` : '100%',
      aspectRatio: width && height ? `${width} / ${height}` : '1',
    }}
  >
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
);

/**
 * Error placeholder component
 */
const ErrorPlaceholder: React.FC<{
  width?: number;
  height?: number;
  className?: string;
  onRetry?: () => void;
}> = ({ width, height, className = '', onRetry }) => (
  <div
    className={`bg-gradient-to-br from-red-50 to-red-100 border-2 border-dashed border-red-200 flex flex-col items-center justify-center ${className}`}
    style={{
      width: width ? `${width}px` : '100%',
      height: height ? `${height}px` : '100%',
      aspectRatio: width && height ? `${width} / ${height}` : '1',
    }}
  >
    <svg
      className="w-8 h-8 text-red-400 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
    <p className="text-xs text-red-600 mb-2">Failed to load</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs text-red-600 hover:text-red-800 underline"
      >
        Retry
      </button>
    )}
  </div>
);

/**
 * Next.js Optimized Image component with R2 integration
 */
export const NextOptimizedImage = forwardRef<
  HTMLImageElement,
  NextOptimizedImageProps
>(
  (
    {
      category,
      identifier,
      size = 'medium',
      alt,
      className = '',
      containerClassName = '',
      priority = false,
      fill = false,
      width,
      height,
      sizes,
      showLoading = true,
      showError = true,
      blurDataURL,
      onLoad,
      onError,
      responsive = true,
      quality = 85,
      ...props
    },
    ref
  ) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    // Generate image URL using R2 utilities
    const imageUrl = generateArtworkImageUrl(category, identifier, size);
    const fallbackUrl = getFallbackImageUrl('artwork');

    // Get dimensions based on size if not provided
    const dimensions = getImageDimensionsForSize(size);
    const finalWidth = width || dimensions.width;
    const finalHeight = height || dimensions.height;

    // Generate blur placeholder if not provided
    const finalBlurDataURL =
      blurDataURL || generateBlurDataURL(finalWidth, finalHeight);

    // Generate responsive image attributes
    const responsiveProps = responsive
      ? {
          srcSet: generateImageSrcSet(category, identifier),
          sizes: sizes || generateImageSizes(),
        }
      : {};

    const handleLoad = useCallback(() => {
      setImageLoaded(true);
      setIsRetrying(false);

      onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
      setImageError(true);
      setIsRetrying(false);

      onError?.();
    }, [onError]);

    const handleRetry = useCallback(() => {
      setImageError(false);
      setImageLoaded(false);
      setIsRetrying(true);
    }, []);

    // Show loading state
    if (!imageLoaded && !imageError && showLoading) {
      return (
        <div className={containerClassName}>
          <LoadingPlaceholder
            width={!fill ? finalWidth : undefined}
            height={!fill ? finalHeight : undefined}
            className={className}
          />
        </div>
      );
    }

    // Show error state
    if (imageError && showError && !isRetrying) {
      return (
        <div className={containerClassName}>
          <ErrorPlaceholder
            width={!fill ? finalWidth : undefined}
            height={!fill ? finalHeight : undefined}
            className={className}
            onRetry={handleRetry}
          />
        </div>
      );
    }

    return (
      <div className={`relative overflow-hidden ${containerClassName}`}>
        <Image
          ref={ref}
          src={imageError && !isRetrying ? fallbackUrl : imageUrl}
          alt={alt || `Artwork ${category}${identifier}`}
          width={!fill ? finalWidth : undefined}
          height={!fill ? finalHeight : undefined}
          fill={fill}
          priority={priority}
          quality={quality}
          placeholder="blur"
          blurDataURL={finalBlurDataURL}
          className={`transition-all duration-500 ease-out ${
            imageLoaded
              ? 'opacity-100 scale-100 blur-0'
              : 'opacity-0 scale-105 blur-sm'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          {...responsiveProps}
          {...props}
        />

        {/* Loading overlay */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-50/80 backdrop-blur-sm">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}

        {/* Shimmer effect while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}

        {/* Error indicator */}
        {imageError && (
          <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
            Fallback
          </div>
        )}
      </div>
    );
  }
);

NextOptimizedImage.displayName = 'NextOptimizedImage';

/**
 * Props for ArtworkImage component
 */
export interface ArtworkImageProps
  extends Omit<NextOptimizedImageProps, 'category' | 'identifier'> {
  /** Artwork ID in format A1, B2, etc. */
  artworkId: string;
}

/**
 * Artwork-specific image component
 */
export const ArtworkImage: React.FC<ArtworkImageProps> = ({
  artworkId,
  alt,
  ...props
}) => {
  // Parse artwork ID to extract category and identifier
  const match = artworkId.match(/^([ABCD])(\d+)$/);

  if (!match) {
    console.warn(`Invalid artwork ID format: ${artworkId}`);
    return (
      <ErrorPlaceholder
        width={
          props.size === 'thumbnail'
            ? 300
            : props.size === 'medium'
              ? 800
              : 2000
        }
        height={
          props.size === 'thumbnail'
            ? 300
            : props.size === 'medium'
              ? 800
              : 2000
        }
        className={props.className}
      />
    );
  }

  const [, category, identifier] = match;

  return (
    <NextOptimizedImage
      {...props}
      category={category as CategoryId}
      identifier={identifier}
      alt={alt || `Artwork ${artworkId}`}
    />
  );
};

/**
 * Props for CategoryCoverImage component
 */
export interface CategoryCoverImageProps
  extends Omit<NextOptimizedImageProps, 'category' | 'identifier'> {
  /** Category ID */
  category: CategoryId;
}

/**
 * Category cover image component
 */
export const CategoryCoverImage: React.FC<CategoryCoverImageProps> = ({
  category,
  alt,
  ...props
}) => {
  return (
    <NextOptimizedImage
      {...props}
      category={category}
      identifier="cover"
      alt={alt || `Category ${category} cover`}
    />
  );
};

export default NextOptimizedImage;
