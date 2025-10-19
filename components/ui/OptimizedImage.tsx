/**
 * Optimized Image Component
 *
 * A React component that handles image loading with Cloudflare R2 integration,
 * error handling, fallbacks, and performance optimizations.
 * Compatible with Next.js static exports.
 */

/* eslint-disable no-unused-vars */
'use client';

import React, { forwardRef } from 'react';
import { CategoryId, ImageSize } from '@/lib/types';
import {
  generateArtworkImageUrl,
  generateImageSrcSet,
  generateImageSizes,
} from '@/lib/cloudflare-r2';
import { useImageLoading } from '@/lib/hooks/useImageLoading';
import { getFallbackImageUrl } from '@/lib/cloudflare-r2';

/**
 * Props for OptimizedImage component
 */
export interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Artwork category */
  category: CategoryId;
  /** Artwork identifier (number or string) */
  identifier: string | number;
  /** Image size variant */
  size?: ImageSize;
  /** Alt text for the image */
  alt?: string;
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Whether to show error state */
  showError?: boolean;
  /** Custom fallback image URL */
  fallbackUrl?: string;
  /** Callback when image loads */
  onImageLoad?: () => void;
  /** Callback when image fails to load */
  onImageError?: (_error: string) => void;
  /** Whether to use responsive images with srcSet */
  responsive?: boolean;
}

/**
 * Loading placeholder component
 */
const LoadingPlaceholder: React.FC<{
  width: number;
  height: number;
  className?: string;
}> = ({ width, height, className = '' }) => (
  <div
    className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
    style={{
      width: width > 500 ? '100%' : width,
      height: height > 500 ? 'auto' : height,
      aspectRatio: `${width} / ${height}`,
      maxWidth: '100%',
    }}
  >
    <svg
      className="w-8 h-8 text-gray-400"
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
  width: number;
  height: number;
  className?: string;
  onRetry?: () => void;
}> = ({ width, height, className = '', onRetry }) => (
  <div
    className={`bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center ${className}`}
    style={{
      width: width > 500 ? '100%' : width,
      height: height > 500 ? 'auto' : height,
      aspectRatio: `${width} / ${height}`,
      maxWidth: '100%',
    }}
  >
    <svg
      className="w-8 h-8 text-gray-400 mb-2"
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
    <p className="text-xs text-gray-500 mb-2">Failed to load</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs text-blue-600 hover:text-blue-800 underline"
      >
        Retry
      </button>
    )}
  </div>
);

/**
 * Optimized Image component with R2 integration and error handling
 * Compatible with Next.js static exports
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      category,
      identifier,
      size = 'medium',
      alt,
      showLoading = true,
      showError = true,
      fallbackUrl,
      onImageLoad,
      onImageError,
      responsive = true,
      className = '',
      style,
      ...imageProps
    },
    ref
  ) => {
    // Generate image URL using R2 utilities
    const primaryUrl = generateArtworkImageUrl(category, identifier, size);

    // Use image loading hook for error handling
    const { loading, loaded, error, currentUrl, isUsingFallback, retry } =
      useImageLoading(primaryUrl, {
        fallbackUrl: fallbackUrl || getFallbackImageUrl('artwork'),
        onLoad: () => onImageLoad?.(),
        onError: err => onImageError?.(err.message),
      });

    // Get dimensions based on size
    const getDimensions = (imageSize: ImageSize) => {
      const sizeMap = {
        thumbnail: { width: 300, height: 300 },
        medium: { width: 800, height: 800 },
        full: { width: 2000, height: 2000 },
      };
      return sizeMap[imageSize];
    };

    const dimensions = getDimensions(size);

    // Show loading state
    if (loading && showLoading) {
      return (
        <LoadingPlaceholder
          width={dimensions.width}
          height={dimensions.height}
          className={className}
        />
      );
    }

    // Show error state
    if (error && !loaded && showError) {
      return (
        <ErrorPlaceholder
          width={dimensions.width}
          height={dimensions.height}
          className={className}
          onRetry={retry}
        />
      );
    }

    // Generate responsive image attributes
    const imageAttributes: React.ImgHTMLAttributes<HTMLImageElement> = {
      ...imageProps,
      src: currentUrl,
      alt: alt || `Artwork ${category}${identifier}`,
      className: `${className} ${isUsingFallback ? 'opacity-75' : ''}`,
      style: {
        maxWidth: '100%',
        height: 'auto',
        ...style,
      },
    };

    // Add responsive attributes if enabled
    if (responsive && !isUsingFallback) {
      imageAttributes.srcSet = generateImageSrcSet(category, identifier);
      imageAttributes.sizes = generateImageSizes();
    }

    // Render the actual image
    return (
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img ref={ref} {...imageAttributes} />

        {/* Show indicator if using fallback */}
        {isUsingFallback && (
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
            Fallback
          </div>
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Props for ArtworkImage component
 */
export interface ArtworkImageProps
  extends Omit<OptimizedImageProps, 'category' | 'identifier'> {
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
    <OptimizedImage
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
  extends Omit<OptimizedImageProps, 'category' | 'identifier'> {
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
    <OptimizedImage
      {...props}
      category={category}
      identifier="cover"
      alt={alt || `Category ${category} cover`}
    />
  );
};

export default OptimizedImage;
