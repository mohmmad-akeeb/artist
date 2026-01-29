/**
 * Cloudflare R2 Integration Module
 *
 * This module provides utilities for integrating with Cloudflare R2 storage,
 * including image URL generation, optimization, and error handling.
 */

import { ImageSize, CategoryId } from './types';

/**
 * R2 Configuration interface
 */
export interface R2Config {
  baseUrl: string;
  bucketName: string;
  customDomain?: string;
  enableOptimization: boolean;
}

/**
 * Image optimization parameters
 */
export interface ImageOptimizationParams {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
}

/**
 * Image size configurations for different use cases
 */
export const IMAGE_SIZE_CONFIG: Record<ImageSize, ImageOptimizationParams> = {
  thumbnail: {
    width: 300,
    height: 300,
    quality: 80,
    format: 'webp',
    fit: 'cover',
  },
  medium: {
    width: 800,
    height: 800,
    quality: 85,
    format: 'webp',
    fit: 'scale-down',
  },
  full: {
    width: 2000,
    height: 2000,
    quality: 90,
    format: 'webp',
    fit: 'scale-down',
  },
} as const;

/**
 * Get R2 configuration from environment variables
 */
export function getR2Config(): R2Config {
  const baseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL;
  const bucketName =
    process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'artist-portfolio-images';
  const customDomain = process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN;

  if (!baseUrl) {
    console.warn('NEXT_PUBLIC_R2_BASE_URL not configured, using fallback URL');
  }

  return {
    baseUrl: baseUrl || 'https://your-bucket.r2.cloudflarestorage.com',
    bucketName,
    customDomain,
    enableOptimization: !!process.env.NEXT_PUBLIC_R2_ENABLE_OPTIMIZATION,
  };
}

/**
 * Generate optimized image URL with Cloudflare Image Resizing
 */
export function generateOptimizedImageUrl(
  imagePath: string,
  params: ImageOptimizationParams = {}
): string {
  const config = getR2Config();
  const baseUrl = config.customDomain || config.baseUrl;

  // If optimization is disabled, return direct URL
  if (!config.enableOptimization) {
    return `${baseUrl}/${config.bucketName}/${imagePath}`;
  }

  // Build optimization parameters
  const optimizationParams = new URLSearchParams();

  if (params.width) optimizationParams.set('width', params.width.toString());
  if (params.height) optimizationParams.set('height', params.height.toString());
  if (params.quality)
    optimizationParams.set('quality', params.quality.toString());
  if (params.format) optimizationParams.set('format', params.format);
  if (params.fit) optimizationParams.set('fit', params.fit);

  // Use Cloudflare Image Resizing service
  const optimizationQuery = optimizationParams.toString();
  const imageUrl = `${baseUrl}/${config.bucketName}/${imagePath}`;

  if (optimizationQuery) {
    return `${baseUrl}/cdn-cgi/image/${optimizationQuery}/${config.bucketName}/${imagePath}`;
  }

  return imageUrl;
}

/**
 * Generate artwork image URL for specific size
 */
export function generateArtworkImageUrl(
  category: CategoryId,
  identifier: string | number,
  size: ImageSize = 'full'
): string {
  const imagePath = `${category}/${identifier}.jpg`;
  const optimizationParams = IMAGE_SIZE_CONFIG[size];

  return generateOptimizedImageUrl(imagePath, optimizationParams);
}

/**
 * Generate category cover image URL
 */
export function generateCategoryCoverUrl(
  category: CategoryId,
  size: ImageSize = 'medium'
): string {
  return generateArtworkImageUrl(category, 'cover', size);
}

/**
 * Generate multiple image URLs for responsive images
 */
export function generateResponsiveImageUrls(
  category: CategoryId,
  identifier: string | number
): {
  thumbnail: string;
  medium: string;
  full: string;
} {
  return {
    thumbnail: generateArtworkImageUrl(category, identifier, 'thumbnail'),
    medium: generateArtworkImageUrl(category, identifier, 'medium'),
    full: generateArtworkImageUrl(category, identifier, 'full'),
  };
}

/**
 * Generate srcSet for responsive images
 */
export function generateImageSrcSet(
  category: CategoryId,
  identifier: string | number
): string {
  const urls = generateResponsiveImageUrls(category, identifier);

  return [
    `${urls.thumbnail} 300w`,
    `${urls.medium} 800w`,
    `${urls.full} 2000w`,
  ].join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateImageSizes(): string {
  return ['(max-width: 768px) 100vw', '(max-width: 1024px) 50vw', '33vw'].join(
    ', '
  );
}

/**
 * Fallback image URLs for error handling
 */
export const FALLBACK_IMAGES = {
  artwork: '/images/artwork-placeholder.svg',
  category: '/images/category-placeholder.svg',
  artist: '/images/artist-photo.jpeg',
} as const;

/**
 * Generate fallback image URL based on type
 */
export function getFallbackImageUrl(
  type: keyof typeof FALLBACK_IMAGES
): string {
  return FALLBACK_IMAGES[type];
}

/**
 * Check if an image URL is from R2
 */
export function isR2ImageUrl(url: string): boolean {
  const config = getR2Config();
  return (
    url.includes(config.baseUrl) ||
    (!!config.customDomain && url.includes(config.customDomain))
  );
}

/**
 * Preload critical images
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    img.src = url;
  });
}

/**
 * Preload multiple images with error handling
 */
export async function preloadImages(urls: string[]): Promise<{
  loaded: string[];
  failed: string[];
}> {
  const results = await Promise.allSettled(
    urls.map(url => preloadImage(url).then(() => url))
  );

  const loaded: string[] = [];
  const failed: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      loaded.push(result.value);
    } else {
      failed.push(urls[index]);
    }
  });

  return { loaded, failed };
}

/**
 * Image loading utility with retry logic
 */
export async function loadImageWithRetry(
  url: string,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<string> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await preloadImage(url);
      return url;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  throw lastError!;
}

/**
 * Validate R2 configuration
 */
export function validateR2Config(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const config = getR2Config();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required configuration
  if (!config.baseUrl || config.baseUrl.includes('your-bucket')) {
    errors.push('R2 base URL is not properly configured');
  }

  if (!config.bucketName) {
    errors.push('R2 bucket name is required');
  }

  // Check optional but recommended configuration
  if (!config.customDomain) {
    warnings.push('Custom domain not configured - using direct R2 URLs');
  }

  if (!config.enableOptimization) {
    warnings.push('Image optimization is disabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get R2 configuration status for debugging
 */
export function getR2ConfigStatus(): {
  config: R2Config;
  validation: ReturnType<typeof validateR2Config>;
} {
  const config = getR2Config();
  const validation = validateR2Config();

  return {
    config,
    validation,
  };
}
