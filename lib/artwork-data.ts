/**
 * Artwork Data Management System
 *
 * This module provides utilities for managing and organizing 1500+ artwork images
 * across four categories (A, B, C, D) with unique identifiers and Cloudflare R2 integration.
 */

import { Artwork, Category, CategoryId, ImageSize } from './types';
import {
  generateArtworkImageUrl,
  generateCategoryCoverUrl,
  generateResponsiveImageUrls,
} from './cloudflare-r2';

/**
 * Category configuration with metadata
 */
export const CATEGORY_CONFIG: Record<
  CategoryId,
  Omit<Category, 'artworkCount'>
> = {
  A: {
    id: 'A',
    name: 'Category A',
    description: 'Abstract compositions and experimental works',
    coverImage: generateCategoryCoverUrl('A', 'medium'),
  },
  B: {
    id: 'B',
    name: 'Category B',
    description: 'Landscape and nature-inspired paintings',
    coverImage: generateCategoryCoverUrl('B', 'medium'),
  },
  C: {
    id: 'C',
    name: 'Category C',
    description: 'Portrait and figure studies',
    coverImage: generateCategoryCoverUrl('C', 'medium'),
  },
  D: {
    id: 'D',
    name: 'Category D',
    description: 'Mixed media and contemporary works',
    coverImage: generateCategoryCoverUrl('D', 'medium'),
  },
} as const;

/**
 * Generate Cloudflare R2 image URL for artwork (deprecated - use cloudflare-r2.ts)
 * @deprecated Use generateArtworkImageUrl from cloudflare-r2.ts instead
 */
export function generateImageUrl(
  category: CategoryId,
  identifier: string | number,
  size: ImageSize = 'full'
): string {
  return generateArtworkImageUrl(category, identifier, size);
}

/**
 * Generate artwork ID in the format A1, A2, B1, etc.
 *
 * @param category - The artwork category
 * @param number - The sequential number within the category
 * @returns Formatted artwork ID
 */
export function generateArtworkId(
  category: CategoryId,
  number: number
): string {
  return `${category}${number}`;
}

/**
 * Parse artwork ID to extract category and number
 *
 * @param artworkId - The artwork ID to parse (e.g., "A1", "B23")
 * @returns Object containing category and number, or null if invalid
 */
export function parseArtworkId(
  artworkId: string
): { category: CategoryId; number: number } | null {
  const match = artworkId.match(/^([ABCD])(\d+)$/);

  if (!match) {
    return null;
  }

  const [, category, numberStr] = match;
  const number = parseInt(numberStr, 10);

  if (isNaN(number) || number < 1) {
    return null;
  }

  return {
    category: category as CategoryId,
    number,
  };
}

/**
 * Create artwork object with generated URLs and metadata
 *
 * @param category - The artwork category
 * @param number - The sequential number within the category
 * @param metadata - Additional artwork metadata
 * @returns Complete Artwork object
 */
export function createArtwork(
  category: CategoryId,
  number: number,
  metadata: Partial<
    Pick<Artwork, 'title' | 'description' | 'dimensions' | 'year' | 'medium'>
  > = {}
): Artwork {
  const id = generateArtworkId(category, number);
  const urls = generateResponsiveImageUrls(category, number);

  return {
    id,
    category,
    title: metadata.title || `Artwork ${id}`,
    description:
      metadata.description || `A beautiful piece from category ${category}`,
    imageUrl: urls.full,
    thumbnailUrl: urls.thumbnail,
    dimensions: metadata.dimensions,
    year: metadata.year,
    medium: metadata.medium,
  };
}

/**
 * Generate a range of artwork objects for a category
 *
 * @param category - The artwork category
 * @param count - Number of artworks to generate
 * @param startNumber - Starting number (default: 1)
 * @returns Array of Artwork objects
 */
export function generateCategoryArtworks(
  category: CategoryId,
  count: number,
  startNumber: number = 1
): Artwork[] {
  const artworks: Artwork[] = [];

  for (let i = 0; i < count; i++) {
    const number = startNumber + i;
    artworks.push(createArtwork(category, number));
  }

  return artworks;
}

/**
 * Filter artworks by category
 *
 * @param artworks - Array of artworks to filter
 * @param category - Category to filter by
 * @returns Filtered array of artworks
 */
export function filterArtworksByCategory(
  artworks: Artwork[],
  category: CategoryId
): Artwork[] {
  return artworks.filter(artwork => artwork.category === category);
}

/**
 * Filter artworks by multiple categories
 *
 * @param artworks - Array of artworks to filter
 * @param categories - Array of categories to include
 * @returns Filtered array of artworks
 */
export function filterArtworksByCategories(
  artworks: Artwork[],
  categories: CategoryId[]
): Artwork[] {
  return artworks.filter(artwork => categories.includes(artwork.category));
}

/**
 * Sort artworks by ID (natural ordering: A1, A2, A10, A11, B1, B2, etc.)
 *
 * @param artworks - Array of artworks to sort
 * @returns Sorted array of artworks
 */
export function sortArtworksById(artworks: Artwork[]): Artwork[] {
  return [...artworks].sort((a, b) => {
    const parsedA = parseArtworkId(a.id);
    const parsedB = parseArtworkId(b.id);

    if (!parsedA || !parsedB) {
      return a.id.localeCompare(b.id);
    }

    // First sort by category
    if (parsedA.category !== parsedB.category) {
      return parsedA.category.localeCompare(parsedB.category);
    }

    // Then sort by number within category
    return parsedA.number - parsedB.number;
  });
}

/**
 * Sort artworks by year (newest first, with fallback to ID sorting)
 *
 * @param artworks - Array of artworks to sort
 * @returns Sorted array of artworks
 */
export function sortArtworksByYear(artworks: Artwork[]): Artwork[] {
  return [...artworks].sort((a, b) => {
    // If both have years, sort by year (newest first)
    if (a.year && b.year) {
      return b.year - a.year;
    }

    // If only one has a year, prioritize it
    if (a.year && !b.year) return -1;
    if (!a.year && b.year) return 1;

    // If neither has a year, fall back to ID sorting
    return sortArtworksById([a, b])[0] === a ? -1 : 1;
  });
}

/**
 * Sort artworks by title alphabetically
 *
 * @param artworks - Array of artworks to sort
 * @returns Sorted array of artworks
 */
export function sortArtworksByTitle(artworks: Artwork[]): Artwork[] {
  return [...artworks].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Group artworks by category
 *
 * @param artworks - Array of artworks to group
 * @returns Object with categories as keys and artwork arrays as values
 */
export function groupArtworksByCategory(
  artworks: Artwork[]
): Record<CategoryId, Artwork[]> {
  const grouped: Record<CategoryId, Artwork[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
  };

  artworks.forEach(artwork => {
    grouped[artwork.category].push(artwork);
  });

  return grouped;
}

/**
 * Get category statistics from artwork array
 *
 * @param artworks - Array of artworks to analyze
 * @returns Object with category counts and percentages
 */
export function getCategoryStats(
  artworks: Artwork[]
): Record<CategoryId, { count: number; percentage: number }> {
  const total = artworks.length;
  const grouped = groupArtworksByCategory(artworks);

  const stats: Record<CategoryId, { count: number; percentage: number }> =
    {} as any;

  (['A', 'B', 'C', 'D'] as CategoryId[]).forEach(category => {
    const count = grouped[category].length;
    stats[category] = {
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  return stats;
}

/**
 * Search artworks by title or description
 *
 * @param artworks - Array of artworks to search
 * @param query - Search query string
 * @returns Filtered array of matching artworks
 */
export function searchArtworks(artworks: Artwork[], query: string): Artwork[] {
  if (!query.trim()) {
    return artworks;
  }

  const searchTerm = query.toLowerCase().trim();

  return artworks.filter(
    artwork =>
      artwork.title.toLowerCase().includes(searchTerm) ||
      artwork.description.toLowerCase().includes(searchTerm) ||
      artwork.id.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get artworks within a specific ID range for a category
 *
 * @param artworks - Array of artworks to filter
 * @param category - Category to filter by
 * @param startNumber - Starting number (inclusive)
 * @param endNumber - Ending number (inclusive)
 * @returns Filtered array of artworks within the range
 */
export function getArtworkRange(
  artworks: Artwork[],
  category: CategoryId,
  startNumber: number,
  endNumber: number
): Artwork[] {
  return artworks.filter(artwork => {
    if (artwork.category !== category) return false;

    const parsed = parseArtworkId(artwork.id);
    if (!parsed) return false;

    return parsed.number >= startNumber && parsed.number <= endNumber;
  });
}

/**
 * Get random artworks from a category
 *
 * @param artworks - Array of artworks to sample from
 * @param category - Category to sample from (optional, samples from all if not provided)
 * @param count - Number of random artworks to return
 * @returns Array of random artworks
 */
export function getRandomArtworks(
  artworks: Artwork[],
  count: number,
  category?: CategoryId
): Artwork[] {
  let sourceArtworks = artworks;

  if (category) {
    sourceArtworks = filterArtworksByCategory(artworks, category);
  }

  if (sourceArtworks.length <= count) {
    return [...sourceArtworks];
  }

  const shuffled = [...sourceArtworks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Validate artwork data structure
 *
 * @param artwork - Artwork object to validate
 * @returns Object with validation result and any errors
 */
export function validateArtwork(artwork: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!artwork || typeof artwork !== 'object') {
    errors.push('Artwork must be an object');
    return { isValid: false, errors };
  }

  // Validate required fields
  if (!artwork.id || typeof artwork.id !== 'string') {
    errors.push('Artwork must have a valid ID');
  } else if (!parseArtworkId(artwork.id)) {
    errors.push('Artwork ID must follow format: A1, B2, C3, etc.');
  }

  if (!artwork.category || !['A', 'B', 'C', 'D'].includes(artwork.category)) {
    errors.push('Artwork must have a valid category (A, B, C, or D)');
  }

  if (!artwork.title || typeof artwork.title !== 'string') {
    errors.push('Artwork must have a valid title');
  }

  if (!artwork.description || typeof artwork.description !== 'string') {
    errors.push('Artwork must have a valid description');
  }

  if (!artwork.imageUrl || typeof artwork.imageUrl !== 'string') {
    errors.push('Artwork must have a valid image URL');
  }

  if (!artwork.thumbnailUrl || typeof artwork.thumbnailUrl !== 'string') {
    errors.push('Artwork must have a valid thumbnail URL');
  }

  // Validate optional fields if present
  if (
    artwork.year !== undefined &&
    (typeof artwork.year !== 'number' ||
      artwork.year < 1000 ||
      artwork.year > new Date().getFullYear())
  ) {
    errors.push('Artwork year must be a valid year');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
