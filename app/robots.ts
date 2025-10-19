/**
 * Robots.txt Generation
 *
 * This file generates the robots.txt file for search engine crawlers
 * to properly index the artist portfolio website.
 */

import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo-utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/admin/', '*.json'],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
