/**
 * XML Sitemap Generation
 *
 * This file generates a dynamic sitemap for all pages and categories
 * in the artist portfolio website for better SEO indexing.
 */

import { MetadataRoute } from 'next';
import { generateDevMockDataset } from '@/lib/mock-data';
import { getAllCategories } from '@/lib/category-utils';
import { SITE_CONFIG } from '@/lib/seo-utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  // Get artwork data for category URLs
  const artworks = generateDevMockDataset();
  const categories = getAllCategories(artworks);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/press`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
    url: `${baseUrl}/work/${category.id.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Individual artwork pages would be added here when implemented
  // const artworkPages: MetadataRoute.Sitemap = artworks.map(artwork => ({
  //   url: `${baseUrl}/artwork/${artwork.id.toLowerCase()}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'yearly' as const,
  //   priority: 0.6,
  // }));

  return [...staticPages, ...categoryPages];
}
