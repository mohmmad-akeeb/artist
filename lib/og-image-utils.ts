/**
 * Open Graph Image Utilities
 *
 * This module provides utilities for generating dynamic Open Graph images
 * for better social media sharing of artwork and pages.
 */

import { Artwork, CategoryId } from './types';

/**
 * Generate Open Graph image URL for artwork
 * This would typically generate a dynamic image with artwork preview
 */
export function generateArtworkOGImage(artwork: Artwork): string {
  // For now, return the artwork image URL
  // In a full implementation, this could generate a custom OG image
  // with artwork + branding using a service like Vercel OG or similar
  return artwork.imageUrl;
}

/**
 * Generate Open Graph image URL for category
 */
export function generateCategoryOGImage(categoryId: CategoryId): string {
  // Return category cover image for now
  // Could be enhanced to generate dynamic images with category info
  return `/images/category-${categoryId.toLowerCase()}-og.jpg`;
}

/**
 * Generate Open Graph image URL for general pages
 */
export function generatePageOGImage(pageName: string): string {
  // Return a default branded image for general pages
  return `/images/${pageName}-og.jpg`;
}

/**
 * Open Graph image dimensions
 */
export const OG_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 630,
} as const;

/**
 * Twitter card image dimensions
 */
export const TWITTER_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 600,
} as const;

/**
 * Generate image metadata for Open Graph
 */
export function generateImageMetadata(imageUrl: string, alt: string) {
  return {
    url: imageUrl,
    width: OG_IMAGE_DIMENSIONS.width,
    height: OG_IMAGE_DIMENSIONS.height,
    alt,
    type: 'image/jpeg',
  };
}

/**
 * Generate Twitter image metadata
 */
export function generateTwitterImageMetadata(imageUrl: string) {
  return {
    url: imageUrl,
    width: TWITTER_IMAGE_DIMENSIONS.width,
    height: TWITTER_IMAGE_DIMENSIONS.height,
  };
}
