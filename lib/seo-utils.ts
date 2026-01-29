/**
 * SEO Utilities
 *
 * This module provides utilities for generating SEO metadata, structured data,
 * and Open Graph tags for the artist portfolio website.
 */

import { Metadata } from 'next';
import { Artwork, CategoryId } from './types';
import { CATEGORY_CONFIG } from './artwork-data';

/**
 * Base site configuration for SEO
 */
export const SITE_CONFIG = {
  name: 'Prof. Zargar Zahoor Art',
  title: 'Prof. Zargar Zahoor - Contemporary Artist',
  description:
    'Discover the contemporary artwork of Prof. Zargar Zahoor. Explore a collection of over 1500 paintings across four distinct categories.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://elenarodriguez.art',
  author: 'Prof. Zargar Zahoor',
  keywords: [
    'Prof. Zargar Zahoor',
    'contemporary art',
    'paintings',
    'artist portfolio',
    'fine art',
  ] as string[],
  social: {
    instagram: 'https://instagram.com/elenarodriguezart',
    facebook: 'https://facebook.com/elenarodriguezart',
  },
} as const;

/**
 * Generate metadata for the homepage
 */
export function generateHomeMetadata(): Metadata {
  return {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    keywords: SITE_CONFIG.keywords,
    authors: [{ name: SITE_CONFIG.author }],
    robots: 'index, follow',
    openGraph: {
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      type: 'website',
      locale: 'en_US',
      siteName: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      images: [
        {
          url: '/images/landing-background.svg',
          width: 1920,
          height: 1080,
          alt: 'Prof. Zargar Zahoor artwork background',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      images: ['/images/landing-background.svg'],
    },
    alternates: {
      canonical: SITE_CONFIG.url,
    },
  };
}

/**
 * Generate metadata for the about page
 */
export function generateAboutMetadata(): Metadata {
  const title = `About ${SITE_CONFIG.author}`;
  const description = `Learn about ${SITE_CONFIG.author}, a contemporary artist whose minimalist approach to painting explores themes of light, space, and human emotion through abstract compositions.`;

  return {
    title,
    description,
    keywords: [
      ...SITE_CONFIG.keywords,
      'artist biography',
      'abstract art',
      'minimalist painting',
    ],
    openGraph: {
      title: `${title} - Contemporary Artist`,
      description,
      type: 'profile',
      url: `${SITE_CONFIG.url}/about`,
      images: [
        {
          url: '/images/artist-photo.jpeg',
          width: 800,
          height: 600,
          alt: `${SITE_CONFIG.author} in her studio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/artist-photo.jpeg'],
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/about`,
    },
  };
}

/**
 * Generate metadata for the work page
 */
export function generateWorkMetadata(): Metadata {
  const title = 'Artwork Collection';
  const description =
    "Explore Prof. Zargar Zahoor's artistic journey through four distinct collections, each representing different themes and creative explorations.";

  return {
    title,
    description,
    keywords: [
      ...SITE_CONFIG.keywords,
      'art collection',
      'gallery',
      'categories',
    ],
    openGraph: {
      title: `${title} - ${SITE_CONFIG.name}`,
      description,
      type: 'website',
      url: `${SITE_CONFIG.url}/work`,
      images: [
        {
          url: '/images/category-placeholder.svg',
          width: 1200,
          height: 630,
          alt: 'Prof. Zargar Zahoor artwork collection',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/category-placeholder.svg'],
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/work`,
    },
  };
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata(
  categoryId: CategoryId,
  artworkCount: number
): Metadata {
  const categoryConfig = CATEGORY_CONFIG[categoryId];
  const title = `${categoryConfig.name} Collection`;
  const description = `${categoryConfig.description}. View ${artworkCount} artworks in this collection.`;

  return {
    title,
    description,
    keywords: [
      ...SITE_CONFIG.keywords,
      categoryConfig.name.toLowerCase(),
      'art category',
    ],
    openGraph: {
      title: `${title} - ${SITE_CONFIG.name}`,
      description,
      type: 'website',
      url: `${SITE_CONFIG.url}/work/${categoryId.toLowerCase()}`,
      images: [
        {
          url: categoryConfig.coverImage,
          width: 1200,
          height: 630,
          alt: `${categoryConfig.name} artwork collection`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [categoryConfig.coverImage],
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/work/${categoryId.toLowerCase()}`,
    },
  };
}

/**
 * Generate metadata for individual artwork pages (if implemented)
 */
export function generateArtworkMetadata(artwork: Artwork): Metadata {
  const title = `${artwork.title} - ${artwork.id}`;
  const description = `${artwork.description} Created by ${SITE_CONFIG.author}.`;

  return {
    title,
    description,
    keywords: [
      ...SITE_CONFIG.keywords,
      artwork.title.toLowerCase(),
      artwork.category.toLowerCase(),
    ],
    openGraph: {
      title: `${title} - ${SITE_CONFIG.name}`,
      description,
      type: 'article',
      url: `${SITE_CONFIG.url}/artwork/${artwork.id.toLowerCase()}`,
      images: [
        {
          url: artwork.imageUrl,
          width: 1200,
          height: 630,
          alt: `${artwork.title} by ${SITE_CONFIG.author}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [artwork.imageUrl],
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/artwork/${artwork.id.toLowerCase()}`,
    },
  };
}

/**
 * Generate metadata for the contact page
 */
export function generateContactMetadata(): Metadata {
  const title = 'Contact';
  const description = `Get in touch with ${SITE_CONFIG.author} for inquiries about artwork, commissions, or print purchases.`;

  return {
    title,
    description,
    keywords: [...SITE_CONFIG.keywords, 'contact', 'inquiries', 'commissions'],
    openGraph: {
      title: `${title} - ${SITE_CONFIG.name}`,
      description,
      type: 'website',
      url: `${SITE_CONFIG.url}/contact`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/contact`,
    },
  };
}

/**
 * Generate metadata for the press page
 */
export function generatePressMetadata(): Metadata {
  const title = 'Press & Media';
  const description = `Press coverage, exhibitions, and media features of ${SITE_CONFIG.author}'s contemporary artwork.`;

  return {
    title,
    description,
    keywords: [
      ...SITE_CONFIG.keywords,
      'press',
      'media',
      'exhibitions',
      'news',
    ],
    openGraph: {
      title: `${title} - ${SITE_CONFIG.name}`,
      description,
      type: 'website',
      url: `${SITE_CONFIG.url}/press`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/press`,
    },
  };
}

/**
 * Generate structured data for the artist (Person schema)
 */
export function generateArtistStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_CONFIG.author,
    jobTitle: 'Contemporary Artist',
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    image: '/images/artist-photo.jpeg',
    sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
    knowsAbout: ['Contemporary Art', 'Painting', 'Fine Art', 'Abstract Art'],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Artist',
      occupationLocation: {
        '@type': 'Place',
        name: 'Art Studio',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': SITE_CONFIG.url,
    },
  };
}

/**
 * Generate structured data for artwork collection
 */
export function generateCollectionStructuredData(artworks: Artwork[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: `${SITE_CONFIG.author} Artwork Collection`,
    description:
      'A comprehensive collection of contemporary paintings and artworks',
    creator: {
      '@type': 'Person',
      name: SITE_CONFIG.author,
    },
    numberOfItems: artworks.length,
    url: `${SITE_CONFIG.url}/work`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/work`,
    },
  };
}

/**
 * Generate structured data for individual artwork
 */
export function generateArtworkStructuredData(artwork: Artwork) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    description: artwork.description,
    identifier: artwork.id,
    creator: {
      '@type': 'Person',
      name: SITE_CONFIG.author,
    },
    image: artwork.imageUrl,
    url: `${SITE_CONFIG.url}/artwork/${artwork.id.toLowerCase()}`,
    artform: 'Painting',
    artMedium: artwork.medium || 'Mixed Media',
    dateCreated: artwork.year?.toString(),
    size: artwork.dimensions,
    genre: CATEGORY_CONFIG[artwork.category].name,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/artwork/${artwork.id.toLowerCase()}`,
    },
  };
}

/**
 * Generate structured data for category collection
 */
export function generateCategoryStructuredData(
  categoryId: CategoryId,
  artworks: Artwork[]
) {
  const categoryConfig = CATEGORY_CONFIG[categoryId];

  return {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: categoryConfig.name,
    description: categoryConfig.description,
    creator: {
      '@type': 'Person',
      name: SITE_CONFIG.author,
    },
    numberOfItems: artworks.length,
    url: `${SITE_CONFIG.url}/work/${categoryId.toLowerCase()}`,
    image: categoryConfig.coverImage,
    hasPart: artworks.map(artwork => ({
      '@type': 'VisualArtwork',
      name: artwork.title,
      identifier: artwork.id,
      image: artwork.thumbnailUrl,
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/work/${categoryId.toLowerCase()}`,
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.author,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/work?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
