'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface BlurImageProps {
  /** Image source URL */
  src: string;
  /** Alternative text for the image */
  alt: string;
  /** Image width (for static images) */
  width?: number;
  /** Image height (for static images) */
  height?: number;
  /** Whether to fill the container */
  fill?: boolean;
  /** CSS classes for the image */
  className?: string;
  /** CSS classes for the container */
  containerClassName?: string;
  /** Image sizes for responsive images */
  sizes?: string;
  /** Whether to prioritize loading */
  priority?: boolean;
  /** Blur placeholder data URL or color */
  placeholder?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Whether to show loading animation */
  showLoader?: boolean;
}

// Generate a simple blur placeholder
const generateBlurPlaceholder = (color = '#f1f3f4') => {
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>`
  )}`;
};

export default function BlurImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  containerClassName = '',
  sizes,
  priority = false,
  placeholder,
  onLoad,
  onError,
  showLoader = true,
}: BlurImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageError(true);
    onError?.();
  }, [onError]);

  const blurDataURL = placeholder || generateBlurPlaceholder();

  if (imageError) {
    return (
      <div
        className={`bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ${containerClassName}`}
      >
        <div className="text-primary-400 text-center">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurDataURL}
        className={`transition-all duration-500 ease-out ${
          imageLoaded
            ? 'opacity-100 scale-100 blur-0'
            : 'opacity-0 scale-105 blur-sm'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Loading overlay */}
      {!imageLoaded && showLoader && (
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
    </div>
  );
}
