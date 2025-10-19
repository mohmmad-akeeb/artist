/**
 * Category Management Utilities
 *
 * This module provides utilities for managing artwork categories,
 * including category metadata and artwork count calculations.
 */

import { Category, CategoryId, Artwork } from './types';
import { CATEGORY_CONFIG, getCategoryStats } from './artwork-data';

/**
 * Get all available categories with their metadata
 *
 * @param artworks - Array of artworks to calculate counts from
 * @returns Array of Category objects with artwork counts
 */
export function getAllCategories(artworks: Artwork[]): Category[] {
  const stats = getCategoryStats(artworks);

  return (['A', 'B', 'C', 'D'] as CategoryId[]).map(categoryId => ({
    ...CATEGORY_CONFIG[categoryId],
    artworkCount: stats[categoryId].count,
  }));
}

/**
 * Get a specific category with artwork count
 *
 * @param categoryId - The category ID to retrieve
 * @param artworks - Array of artworks to calculate count from
 * @returns Category object with artwork count
 */
export function getCategory(
  categoryId: CategoryId,
  artworks: Artwork[]
): Category {
  const stats = getCategoryStats(artworks);

  return {
    ...CATEGORY_CONFIG[categoryId],
    artworkCount: stats[categoryId].count,
  };
}

/**
 * Get categories sorted by artwork count (descending)
 *
 * @param artworks - Array of artworks to calculate counts from
 * @returns Array of Category objects sorted by count
 */
export function getCategoriesByCount(artworks: Artwork[]): Category[] {
  const categories = getAllCategories(artworks);
  return categories.sort((a, b) => b.artworkCount - a.artworkCount);
}

/**
 * Get categories with non-zero artwork counts
 *
 * @param artworks - Array of artworks to filter by
 * @returns Array of Category objects that have artworks
 */
export function getActiveCategories(artworks: Artwork[]): Category[] {
  const categories = getAllCategories(artworks);
  return categories.filter(category => category.artworkCount > 0);
}

/**
 * Validate category ID
 *
 * @param categoryId - The category ID to validate
 * @returns True if the category ID is valid
 */
export function isValidCategoryId(
  categoryId: string
): categoryId is CategoryId {
  return ['A', 'B', 'C', 'D'].includes(categoryId);
}

/**
 * Get the next category in alphabetical order
 *
 * @param currentCategory - The current category
 * @returns The next category, or 'A' if at the end
 */
export function getNextCategory(currentCategory: CategoryId): CategoryId {
  const categories: CategoryId[] = ['A', 'B', 'C', 'D'];
  const currentIndex = categories.indexOf(currentCategory);
  return categories[(currentIndex + 1) % categories.length];
}

/**
 * Get the previous category in alphabetical order
 *
 * @param currentCategory - The current category
 * @returns The previous category, or 'D' if at the beginning
 */
export function getPreviousCategory(currentCategory: CategoryId): CategoryId {
  const categories: CategoryId[] = ['A', 'B', 'C', 'D'];
  const currentIndex = categories.indexOf(currentCategory);
  return categories[(currentIndex - 1 + categories.length) % categories.length];
}

/**
 * Get category display information for navigation
 *
 * @param artworks - Array of artworks for count calculation
 * @returns Array of objects with category info for navigation
 */
export function getCategoryNavigation(artworks: Artwork[]): Array<{
  id: CategoryId;
  name: string;
  count: number;
  href: string;
}> {
  const categories = getAllCategories(artworks);

  return categories.map(category => ({
    id: category.id,
    name: category.name,
    count: category.artworkCount,
    href: `/work/${category.id.toLowerCase()}`,
  }));
}
