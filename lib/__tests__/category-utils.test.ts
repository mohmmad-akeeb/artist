/**
 * Category Utils Tests
 *
 * Comprehensive tests for category utility functions
 */

import {
  getAllCategories,
  getCategory,
  getCategoriesByCount,
  getActiveCategories,
  isValidCategoryId,
  getNextCategory,
  getPreviousCategory,
  getCategoryNavigation,
} from '../category-utils';
import { Artwork } from '../types';

// Mock artwork data for testing
const mockArtworks: Artwork[] = [
  {
    id: 'A1',
    category: 'A',
    title: 'Abstract Composition 1',
    description: 'A vibrant abstract piece',
    imageUrl: '/images/a1.jpg',
    thumbnailUrl: '/images/a1-thumb.jpg',
  },
  {
    id: 'A2',
    category: 'A',
    title: 'Abstract Composition 2',
    description: 'Another abstract piece',
    imageUrl: '/images/a2.jpg',
    thumbnailUrl: '/images/a2-thumb.jpg',
  },
  {
    id: 'B1',
    category: 'B',
    title: 'Landscape Study 1',
    description: 'A beautiful landscape',
    imageUrl: '/images/b1.jpg',
    thumbnailUrl: '/images/b1-thumb.jpg',
  },
  {
    id: 'C1',
    category: 'C',
    title: 'Portrait Study 1',
    description: 'A detailed portrait',
    imageUrl: '/images/c1.jpg',
    thumbnailUrl: '/images/c1-thumb.jpg',
  },
  {
    id: 'C2',
    category: 'C',
    title: 'Portrait Study 2',
    description: 'Another portrait',
    imageUrl: '/images/c2.jpg',
    thumbnailUrl: '/images/c2-thumb.jpg',
  },
  {
    id: 'C3',
    category: 'C',
    title: 'Portrait Study 3',
    description: 'Third portrait',
    imageUrl: '/images/c3.jpg',
    thumbnailUrl: '/images/c3-thumb.jpg',
  },
  // Note: No category D artworks for testing empty categories
];

describe('Category Utils', () => {
  describe('getAllCategories', () => {
    it('returns all four categories with correct counts', () => {
      const categories = getAllCategories(mockArtworks);

      expect(categories).toHaveLength(4);
      expect(categories.map(c => c.id)).toEqual(['A', 'B', 'C', 'D']);

      const categoryA = categories.find(c => c.id === 'A');
      const categoryB = categories.find(c => c.id === 'B');
      const categoryC = categories.find(c => c.id === 'C');
      const categoryD = categories.find(c => c.id === 'D');

      expect(categoryA?.artworkCount).toBe(2);
      expect(categoryB?.artworkCount).toBe(1);
      expect(categoryC?.artworkCount).toBe(3);
      expect(categoryD?.artworkCount).toBe(0);
    });

    it('includes category metadata', () => {
      const categories = getAllCategories(mockArtworks);
      const categoryA = categories.find(c => c.id === 'A');

      expect(categoryA).toMatchObject({
        id: 'A',
        name: expect.any(String),
        description: expect.any(String),
        coverImage: expect.any(String),
        artworkCount: 2,
      });
    });

    it('handles empty artwork array', () => {
      const categories = getAllCategories([]);

      expect(categories).toHaveLength(4);
      categories.forEach(category => {
        expect(category.artworkCount).toBe(0);
      });
    });
  });

  describe('getCategory', () => {
    it('returns specific category with correct count', () => {
      const categoryC = getCategory('C', mockArtworks);

      expect(categoryC.id).toBe('C');
      expect(categoryC.artworkCount).toBe(3);
      expect(categoryC.name).toBeDefined();
      expect(categoryC.description).toBeDefined();
    });

    it('returns category with zero count when no artworks', () => {
      const categoryD = getCategory('D', mockArtworks);

      expect(categoryD.id).toBe('D');
      expect(categoryD.artworkCount).toBe(0);
    });
  });

  describe('getCategoriesByCount', () => {
    it('sorts categories by artwork count in descending order', () => {
      const categories = getCategoriesByCount(mockArtworks);

      expect(categories.map(c => c.artworkCount)).toEqual([3, 2, 1, 0]);
      expect(categories.map(c => c.id)).toEqual(['C', 'A', 'B', 'D']);
    });

    it('maintains stable sort for equal counts', () => {
      const singleArtworkEach: Artwork[] = [
        {
          id: 'A1',
          category: 'A',
          title: 'Test A',
          description: 'Test',
          imageUrl: '/test.jpg',
          thumbnailUrl: '/test-thumb.jpg',
        },
        {
          id: 'B1',
          category: 'B',
          title: 'Test B',
          description: 'Test',
          imageUrl: '/test.jpg',
          thumbnailUrl: '/test-thumb.jpg',
        },
      ];

      const categories = getCategoriesByCount(singleArtworkEach);
      const countsOfOne = categories.filter(c => c.artworkCount === 1);

      expect(countsOfOne).toHaveLength(2);
      expect(countsOfOne.map(c => c.artworkCount)).toEqual([1, 1]);
    });
  });

  describe('getActiveCategories', () => {
    it('returns only categories with artworks', () => {
      const activeCategories = getActiveCategories(mockArtworks);

      expect(activeCategories).toHaveLength(3);
      expect(activeCategories.map(c => c.id)).toEqual(['A', 'B', 'C']);
      activeCategories.forEach(category => {
        expect(category.artworkCount).toBeGreaterThan(0);
      });
    });

    it('returns empty array when no artworks', () => {
      const activeCategories = getActiveCategories([]);

      expect(activeCategories).toHaveLength(0);
    });

    it('returns all categories when all have artworks', () => {
      const allCategoriesArtworks: Artwork[] = [
        ...mockArtworks,
        {
          id: 'D1',
          category: 'D',
          title: 'Mixed Media 1',
          description: 'A mixed media piece',
          imageUrl: '/images/d1.jpg',
          thumbnailUrl: '/images/d1-thumb.jpg',
        },
      ];

      const activeCategories = getActiveCategories(allCategoriesArtworks);

      expect(activeCategories).toHaveLength(4);
      expect(activeCategories.map(c => c.id)).toEqual(['A', 'B', 'C', 'D']);
    });
  });

  describe('isValidCategoryId', () => {
    it('returns true for valid category IDs', () => {
      expect(isValidCategoryId('A')).toBe(true);
      expect(isValidCategoryId('B')).toBe(true);
      expect(isValidCategoryId('C')).toBe(true);
      expect(isValidCategoryId('D')).toBe(true);
    });

    it('returns false for invalid category IDs', () => {
      expect(isValidCategoryId('E')).toBe(false);
      expect(isValidCategoryId('a')).toBe(false);
      expect(isValidCategoryId('1')).toBe(false);
      expect(isValidCategoryId('')).toBe(false);
      expect(isValidCategoryId('AB')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(isValidCategoryId(' A ')).toBe(false);
      expect(isValidCategoryId('A ')).toBe(false);
      expect(isValidCategoryId(' A')).toBe(false);
    });
  });

  describe('getNextCategory', () => {
    it('returns next category in sequence', () => {
      expect(getNextCategory('A')).toBe('B');
      expect(getNextCategory('B')).toBe('C');
      expect(getNextCategory('C')).toBe('D');
    });

    it('wraps around from D to A', () => {
      expect(getNextCategory('D')).toBe('A');
    });
  });

  describe('getPreviousCategory', () => {
    it('returns previous category in sequence', () => {
      expect(getPreviousCategory('B')).toBe('A');
      expect(getPreviousCategory('C')).toBe('B');
      expect(getPreviousCategory('D')).toBe('C');
    });

    it('wraps around from A to D', () => {
      expect(getPreviousCategory('A')).toBe('D');
    });
  });

  describe('getCategoryNavigation', () => {
    it('returns navigation data for all categories', () => {
      const navigation = getCategoryNavigation(mockArtworks);

      expect(navigation).toHaveLength(4);

      const categoryA = navigation.find(nav => nav.id === 'A');
      expect(categoryA).toMatchObject({
        id: 'A',
        name: expect.any(String),
        count: 2,
        href: '/work/a',
      });

      const categoryD = navigation.find(nav => nav.id === 'D');
      expect(categoryD).toMatchObject({
        id: 'D',
        name: expect.any(String),
        count: 0,
        href: '/work/d',
      });
    });

    it('generates correct href paths', () => {
      const navigation = getCategoryNavigation(mockArtworks);

      expect(navigation.map(nav => nav.href)).toEqual([
        '/work/a',
        '/work/b',
        '/work/c',
        '/work/d',
      ]);
    });

    it('includes correct counts', () => {
      const navigation = getCategoryNavigation(mockArtworks);

      expect(navigation.map(nav => nav.count)).toEqual([2, 1, 3, 0]);
    });

    it('handles empty artworks array', () => {
      const navigation = getCategoryNavigation([]);

      expect(navigation).toHaveLength(4);
      navigation.forEach(nav => {
        expect(nav.count).toBe(0);
        expect(nav.href).toMatch(/^\/work\/[a-d]$/);
      });
    });
  });
});
