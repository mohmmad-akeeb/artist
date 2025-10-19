/* eslint-disable no-unused-vars */
/**
 * Image Utilities Module
 *
 * This module provides utilities for image handling, optimization,
 * error handling, and loading states for the artist portfolio.
 */

import { ImageSize, CategoryId, ImageLoadState } from './types';
import {
  generateArtworkImageUrl,
  getFallbackImageUrl,
  loadImageWithRetry,
} from './cloudflare-r2';

/**
 * Image loading hook state
 */
export interface UseImageLoadingState extends ImageLoadState {
  /** Retry loading the image */
  retry: () => void;
  /** Reset loading state */
  reset: () => void;
}

/**
 * Image error types
 */
// eslint-disable-next-line no-unused-vars
export enum ImageErrorType {
  NETWORK_ERROR = 'network_error',
  NOT_FOUND = 'not_found',
  INVALID_URL = 'invalid_url',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * Image error details
 */
export interface ImageError {
  type: ImageErrorType;
  message: string;
  url: string;
  timestamp: number;
}

/**
 * Image loading options
 */
export interface ImageLoadingOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Timeout for image loading in milliseconds */
  timeout?: number;
  /** Whether to use fallback image on error */
  useFallback?: boolean;
  /** Custom fallback URL */
  fallbackUrl?: string;
}

/**
 * Default image loading options
 */
export const DEFAULT_IMAGE_OPTIONS: Required<ImageLoadingOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
  useFallback: true,
  fallbackUrl: '',
};

/**
 * Create image error object
 */
export function createImageError(
  type: ImageErrorType,
  message: string,
  url: string
): ImageError {
  return {
    type,
    message,
    url,
    timestamp: Date.now(),
  };
}

/**
 * Determine error type from error message or status
 */
export function getImageErrorType(error: any): ImageErrorType {
  if (!error) return ImageErrorType.UNKNOWN;

  const message = error.message?.toLowerCase() || '';

  if (message.includes('network') || message.includes('fetch')) {
    return ImageErrorType.NETWORK_ERROR;
  }

  if (message.includes('404') || message.includes('not found')) {
    return ImageErrorType.NOT_FOUND;
  }

  if (message.includes('timeout')) {
    return ImageErrorType.TIMEOUT;
  }

  if (message.includes('invalid') || message.includes('malformed')) {
    return ImageErrorType.INVALID_URL;
  }

  return ImageErrorType.UNKNOWN;
}

/**
 * Load image with comprehensive error handling
 */
export async function loadImageSafely(
  url: string,
  options: ImageLoadingOptions = {}
): Promise<{
  success: boolean;
  url: string;
  error?: ImageError;
}> {
  const opts = { ...DEFAULT_IMAGE_OPTIONS, ...options };

  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid image URL provided');
    }

    // Load image with retry logic and timeout
    const loadedUrl = await Promise.race([
      loadImageWithRetry(url, opts.maxRetries, opts.retryDelay),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Image loading timeout')),
          opts.timeout
        )
      ),
    ]);

    return {
      success: true,
      url: loadedUrl,
    };
  } catch (error) {
    const errorType = getImageErrorType(error);
    const imageError = createImageError(
      errorType,
      error instanceof Error ? error.message : 'Unknown error',
      url
    );

    // Try fallback if enabled
    if (opts.useFallback) {
      const fallbackUrl = opts.fallbackUrl || getFallbackImageUrl('artwork');

      try {
        await loadImageWithRetry(fallbackUrl, 1, 0);
        return {
          success: true,
          url: fallbackUrl,
          error: imageError,
        };
      } catch (fallbackError) {
        // Fallback also failed
        return {
          success: false,
          url: fallbackUrl,
          error: imageError,
        };
      }
    }

    return {
      success: false,
      url,
      error: imageError,
    };
  }
}

/**
 * Generate image dimensions for a given size
 */
export function getImageDimensionsForSize(size: ImageSize): {
  width: number;
  height: number;
} {
  const sizeConfig = {
    thumbnail: { width: 300, height: 300 },
    medium: { width: 800, height: 800 },
    full: { width: 2000, height: 2000 },
  };

  return sizeConfig[size];
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataURL(width: number, height: number): string {
  // Create a simple blur placeholder using SVG
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Check if image is loaded and cached
 */
export function isImageCached(url: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const img = new Image();
    img.src = url;
    return img.complete && img.naturalWidth > 0;
  } catch {
    return false;
  }
}

/**
 * Preload critical images for better performance
 */
export async function preloadCriticalImages(
  artworks: Array<{ category: CategoryId; id: string }>
): Promise<{
  loaded: number;
  failed: number;
  errors: ImageError[];
}> {
  const errors: ImageError[] = [];
  let loaded = 0;
  let failed = 0;

  const loadPromises = artworks.map(async artwork => {
    const identifier = artwork.id.replace(artwork.category, '');
    const url = generateArtworkImageUrl(
      artwork.category,
      identifier,
      'thumbnail'
    );

    try {
      await loadImageSafely(url, { maxRetries: 1, useFallback: false });
      loaded++;
    } catch (error) {
      failed++;
      errors.push(
        createImageError(
          getImageErrorType(error),
          error instanceof Error ? error.message : 'Preload failed',
          url
        )
      );
    }
  });

  await Promise.allSettled(loadPromises);

  return { loaded, failed, errors };
}

/**
 * Image loading performance metrics
 */
export interface ImageLoadingMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  errors: ImageError[];
}

/**
 * Track image loading performance
 */
export class ImageLoadingTracker {
  private metrics: ImageLoadingMetrics = {
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    errors: [],
  };

  private loadTimes: number[] = [];

  /**
   * Track image loading start
   */
  trackLoadStart(): number {
    this.metrics.totalImages++;
    return performance.now();
  }

  /**
   * Track successful image load
   */
  trackLoadSuccess(startTime: number): void {
    const loadTime = performance.now() - startTime;
    this.loadTimes.push(loadTime);
    this.metrics.loadedImages++;
    this.updateAverageLoadTime();
  }

  /**
   * Track failed image load
   */
  trackLoadError(startTime: number, error: ImageError): void {
    const loadTime = performance.now() - startTime;
    this.loadTimes.push(loadTime);
    this.metrics.failedImages++;
    this.metrics.errors.push(error);
    this.updateAverageLoadTime();
  }

  /**
   * Update average load time
   */
  private updateAverageLoadTime(): void {
    if (this.loadTimes.length > 0) {
      const total = this.loadTimes.reduce((sum, time) => sum + time, 0);
      this.metrics.averageLoadTime = total / this.loadTimes.length;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): ImageLoadingMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      averageLoadTime: 0,
      errors: [],
    };
    this.loadTimes = [];
  }
}

/**
 * Global image loading tracker instance
 */
export const imageLoadingTracker = new ImageLoadingTracker();

/**
 * Utility to get image dimensions from URL
 */
export function getImageDimensions(url: string): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image dimensions for: ${url}`));
    };

    img.src = url;
  });
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check if browser supports AVIF format
 */
export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch {
    return false;
  }
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
}

/**
 * Generate responsive image sizes for different breakpoints
 */
export function generateResponsiveSizes(
  breakpoints: { [key: string]: string } = {
    mobile: '(max-width: 640px)',
    tablet: '(max-width: 1024px)',
    desktop: '(min-width: 1025px)',
  }
): string {
  return [
    `${breakpoints.mobile} 100vw`,
    `${breakpoints.tablet} 50vw`,
    `${breakpoints.desktop} 33vw`,
  ].join(', ');
}

/**
 * Calculate optimal image dimensions for container
 */
export function calculateOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio: number = 1
): { width: number; height: number } {
  const dpr = Math.min(devicePixelRatio, 2); // Cap at 2x for performance

  return {
    width: Math.round(containerWidth * dpr),
    height: Math.round(containerHeight * dpr),
  };
}

/**
 * Generate srcSet for different pixel densities
 */
export function generateDensitySrcSet(
  baseUrl: string,
  densities: number[] = [1, 1.5, 2]
): string {
  return densities
    .map(density => {
      const url = baseUrl.includes('?')
        ? `${baseUrl}&dpr=${density}`
        : `${baseUrl}?dpr=${density}`;
      return `${url} ${density}x`;
    })
    .join(', ');
}

/**
 * Optimize image loading based on connection speed
 */
export function getOptimalImageQuality(): number {
  if (typeof navigator === 'undefined') return 85;

  const connection = (navigator as any).connection;
  if (!connection) return 85;

  const effectiveType = connection.effectiveType;

  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 60;
    case '3g':
      return 75;
    case '4g':
    default:
      return 85;
  }
}

/**
 * Determine if image should be lazy loaded based on position
 */
export function shouldLazyLoad(
  elementTop: number,
  viewportHeight: number,
  threshold: number = 1.5
): boolean {
  return elementTop > viewportHeight * threshold;
}

/**
 * Create intersection observer for image lazy loading
 */
export function createImageLazyLoadObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px 0px',
    threshold: 0.01,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}
