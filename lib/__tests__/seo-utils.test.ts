/**
 * SEO Utils Tests
 *
 * Comprehensive tests for SEO utility functions
 */

import {
  SITE_CONFIG,
  generateHomeMetadata,
  generateAboutMetadata,
  generateWorkMetadata,
  generateCategoryMetadata,
  generateArtworkMetadata,
  generateContactMetadata,
  generatePressMetadata,
  generateArtistStructuredData,
  generateCollectionStructuredData,
  generateArtworkStructuredData,
  generateCategoryStructuredData,
  generateBreadcrumbStructuredData,
  generateWebsiteStructuredData,
} from '../seo-utils';
import { Artwork } from '../types';

// Mock environment variable is handled in test-setup.ts
// so SITE_CONFIG will be initialized with 'https://test-site.com'

// Mock artwork for testing
const mockArtwork: Artwork = {
  id: 'A1',
  category: 'A',
  title: 'Test Artwork',
  description: 'A beautiful test artwork',
  imageUrl: 'https://example.com/artwork.jpg',
  thumbnailUrl: 'https://example.com/artwork-thumb.jpg',
  year: 2023,
  medium: 'Oil on canvas',
  dimensions: '24x36 inches',
};

const mockArtworks: Artwork[] = [
  mockArtwork,
  {
    id: 'B1',
    category: 'B',
    title: 'Another Artwork',
    description: 'Another test piece',
    imageUrl: 'https://example.com/artwork2.jpg',
    thumbnailUrl: 'https://example.com/artwork2-thumb.jpg',
  },
];

describe('SEO Utils', () => {
  describe('SITE_CONFIG', () => {
    it('has all required properties', () => {
      expect(SITE_CONFIG).toMatchObject({
        name: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        url: expect.any(String),
        author: expect.any(String),
        keywords: expect.any(Array),
        social: expect.any(Object),
      });
    });

    it('uses environment URL when available', () => {
      expect(SITE_CONFIG.url).toBe('https://test-site.com');
    });
  });

  describe('generateHomeMetadata', () => {
    it('generates complete home metadata', () => {
      const metadata = generateHomeMetadata();

      expect(metadata.title).toBe(SITE_CONFIG.title);
      expect(metadata.description).toBe(SITE_CONFIG.description);
      expect(metadata.keywords).toBe(SITE_CONFIG.keywords);
      expect(metadata.authors).toEqual([{ name: SITE_CONFIG.author }]);
      expect(metadata.robots).toBe('index, follow');
    });

    it('includes Open Graph metadata', () => {
      const metadata = generateHomeMetadata();

      expect(metadata.openGraph).toMatchObject({
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
        type: 'website',
        locale: 'en_US',
        siteName: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        images: expect.any(Array),
      });
    });

    it('includes Twitter metadata', () => {
      const metadata = generateHomeMetadata();

      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
        images: expect.any(Array),
      });
    });

    it('includes canonical URL', () => {
      const metadata = generateHomeMetadata();

      expect(metadata.alternates?.canonical).toBe(SITE_CONFIG.url);
    });
  });

  describe('generateAboutMetadata', () => {
    it('generates about page metadata', () => {
      const metadata = generateAboutMetadata();

      expect(metadata.title).toContain('About');
      expect(metadata.title).toContain(SITE_CONFIG.author);
      expect(metadata.description).toContain(SITE_CONFIG.author);
      expect(metadata.keywords).toContain('artist biography');
    });

    it('includes profile Open Graph type', () => {
      const metadata = generateAboutMetadata();

      expect(metadata.openGraph?.type).toBe('profile');
      expect(metadata.openGraph?.url).toBe(`${SITE_CONFIG.url}/about`);
    });
  });

  describe('generateWorkMetadata', () => {
    it('generates work page metadata', () => {
      const metadata = generateWorkMetadata();

      expect(metadata.title).toBe('Artwork Collection');
      expect(metadata.description).toContain('four distinct collections');
      expect(metadata.keywords).toContain('art collection');
    });

    it('includes correct canonical URL', () => {
      const metadata = generateWorkMetadata();

      expect(metadata.alternates?.canonical).toBe(`${SITE_CONFIG.url}/work`);
    });
  });

  describe('generateCategoryMetadata', () => {
    it('generates category metadata with artwork count', () => {
      const metadata = generateCategoryMetadata('A', 25);

      expect(metadata.title).toContain('Collection');
      expect(metadata.description).toContain('25 artworks');
      expect(metadata.openGraph?.url).toBe(`${SITE_CONFIG.url}/work/a`);
    });

    it('handles zero artwork count', () => {
      const metadata = generateCategoryMetadata('D', 0);

      expect(metadata.description).toContain('0 artworks');
    });

    it('includes category-specific keywords', () => {
      const metadata = generateCategoryMetadata('B', 10);

      expect(metadata.keywords).toContain('art category');
    });
  });

  describe('generateArtworkMetadata', () => {
    it('generates artwork-specific metadata', () => {
      const metadata = generateArtworkMetadata(mockArtwork);

      expect(metadata.title).toContain(mockArtwork.title);
      expect(metadata.title).toContain(mockArtwork.id);
      expect(metadata.description).toContain(mockArtwork.description);
      expect(metadata.description).toContain(SITE_CONFIG.author);
    });

    it('includes artwork image in Open Graph', () => {
      const metadata = generateArtworkMetadata(mockArtwork);

      expect(metadata.openGraph?.images?.[0]).toMatchObject({
        url: mockArtwork.imageUrl,
        width: 1200,
        height: 630,
        alt: expect.stringContaining(mockArtwork.title),
      });
    });

    it('uses article type for Open Graph', () => {
      const metadata = generateArtworkMetadata(mockArtwork);

      expect(metadata.openGraph?.type).toBe('article');
    });
  });

  describe('generateContactMetadata', () => {
    it('generates contact page metadata', () => {
      const metadata = generateContactMetadata();

      expect(metadata.title).toBe('Contact');
      expect(metadata.description).toContain('Get in touch');
      expect(metadata.description).toContain(SITE_CONFIG.author);
      expect(metadata.keywords).toContain('contact');
      expect(metadata.keywords).toContain('inquiries');
    });
  });

  describe('generatePressMetadata', () => {
    it('generates press page metadata', () => {
      const metadata = generatePressMetadata();

      expect(metadata.title).toBe('Press & Media');
      expect(metadata.description).toContain('Press coverage');
      expect(metadata.keywords).toContain('press');
      expect(metadata.keywords).toContain('exhibitions');
    });
  });

  describe('generateArtistStructuredData', () => {
    it('generates Person schema for artist', () => {
      const structuredData = generateArtistStructuredData();

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: SITE_CONFIG.author,
        jobTitle: 'Contemporary Artist',
        description: SITE_CONFIG.description,
        url: SITE_CONFIG.url,
      });
    });

    it('includes social media links', () => {
      const structuredData = generateArtistStructuredData();

      expect(structuredData.sameAs).toContain(SITE_CONFIG.social.instagram);
      expect(structuredData.sameAs).toContain(SITE_CONFIG.social.facebook);
    });

    it('includes occupation details', () => {
      const structuredData = generateArtistStructuredData();

      expect(structuredData.hasOccupation).toMatchObject({
        '@type': 'Occupation',
        name: 'Artist',
      });
    });
  });

  describe('generateCollectionStructuredData', () => {
    it('generates Collection schema', () => {
      const structuredData = generateCollectionStructuredData(mockArtworks);

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Collection',
        name: expect.stringContaining(SITE_CONFIG.author),
        numberOfItems: mockArtworks.length,
        url: `${SITE_CONFIG.url}/work`,
      });
    });

    it('includes creator information', () => {
      const structuredData = generateCollectionStructuredData(mockArtworks);

      expect(structuredData.creator).toMatchObject({
        '@type': 'Person',
        name: SITE_CONFIG.author,
      });
    });
  });

  describe('generateArtworkStructuredData', () => {
    it('generates VisualArtwork schema', () => {
      const structuredData = generateArtworkStructuredData(mockArtwork);

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'VisualArtwork',
        name: mockArtwork.title,
        description: mockArtwork.description,
        identifier: mockArtwork.id,
        image: mockArtwork.imageUrl,
        artform: 'Painting',
      });
    });

    it('includes artwork details', () => {
      const structuredData = generateArtworkStructuredData(mockArtwork);

      expect(structuredData.artMedium).toBe(mockArtwork.medium);
      expect(structuredData.dateCreated).toBe(mockArtwork.year?.toString());
      expect(structuredData.size).toBe(mockArtwork.dimensions);
    });

    it('includes creator information', () => {
      const structuredData = generateArtworkStructuredData(mockArtwork);

      expect(structuredData.creator).toMatchObject({
        '@type': 'Person',
        name: SITE_CONFIG.author,
      });
    });

    it('handles missing optional fields', () => {
      const minimalArtwork: Artwork = {
        id: 'B1',
        category: 'B',
        title: 'Minimal Artwork',
        description: 'A minimal test piece',
        imageUrl: 'https://example.com/minimal.jpg',
        thumbnailUrl: 'https://example.com/minimal-thumb.jpg',
      };

      const structuredData = generateArtworkStructuredData(minimalArtwork);

      expect(structuredData.artMedium).toBe('Mixed Media');
      expect(structuredData.dateCreated).toBeUndefined();
      expect(structuredData.size).toBeUndefined();
    });
  });

  describe('generateCategoryStructuredData', () => {
    it('generates category Collection schema', () => {
      const categoryArtworks = mockArtworks.filter(a => a.category === 'A');
      const structuredData = generateCategoryStructuredData(
        'A',
        categoryArtworks
      );

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Collection',
        numberOfItems: categoryArtworks.length,
        url: `${SITE_CONFIG.url}/work/a`,
      });
    });

    it('includes artwork parts', () => {
      const categoryArtworks = mockArtworks.filter(a => a.category === 'A');
      const structuredData = generateCategoryStructuredData(
        'A',
        categoryArtworks
      );

      expect(structuredData.hasPart).toHaveLength(categoryArtworks.length);
      expect(structuredData.hasPart[0]).toMatchObject({
        '@type': 'VisualArtwork',
        name: categoryArtworks[0].title,
        identifier: categoryArtworks[0].id,
        image: categoryArtworks[0].thumbnailUrl,
      });
    });
  });

  describe('generateBreadcrumbStructuredData', () => {
    it('generates BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Work', url: 'https://example.com/work' },
        { name: 'Category A', url: 'https://example.com/work/a' },
      ];

      const structuredData = generateBreadcrumbStructuredData(items);

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
      });
    });

    it('creates correct list items with positions', () => {
      const items = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Work', url: 'https://example.com/work' },
      ];

      const structuredData = generateBreadcrumbStructuredData(items);

      expect(structuredData.itemListElement).toHaveLength(2);
      expect(structuredData.itemListElement[0]).toMatchObject({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://example.com',
      });
      expect(structuredData.itemListElement[1]).toMatchObject({
        '@type': 'ListItem',
        position: 2,
        name: 'Work',
        item: 'https://example.com/work',
      });
    });
  });

  describe('generateWebsiteStructuredData', () => {
    it('generates WebSite schema', () => {
      const structuredData = generateWebsiteStructuredData();

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        url: SITE_CONFIG.url,
      });
    });

    it('includes search action', () => {
      const structuredData = generateWebsiteStructuredData();

      expect(structuredData.potentialAction).toMatchObject({
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_CONFIG.url}/work?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      });
    });

    it('includes author information', () => {
      const structuredData = generateWebsiteStructuredData();

      expect(structuredData.author).toMatchObject({
        '@type': 'Person',
        name: SITE_CONFIG.author,
      });
    });
  });
});
