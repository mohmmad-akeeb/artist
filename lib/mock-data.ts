/**
 * Mock Data Generator
 *
 * This module provides utilities for generating mock artwork data
 * for development and testing purposes.
 */

import { Artwork, CategoryId } from './types';
import { createArtwork } from './artwork-data';

/**
 * Sample artwork titles by category for more realistic mock data
 */
const SAMPLE_TITLES: Record<CategoryId, string[]> = {
  A: [
    'Abstract Harmony',
    'Geometric Dreams',
    'Color Symphony',
    'Fluid Motion',
    'Ethereal Composition',
    'Dynamic Balance',
    'Chromatic Exploration',
    'Textural Landscape',
    'Rhythmic Patterns',
    'Atmospheric Study',
  ],
  B: [
    'Mountain Vista',
    'Ocean Breeze',
    'Forest Canopy',
    'Desert Sunset',
    'River Valley',
    'Coastal Cliffs',
    'Prairie Winds',
    'Alpine Meadow',
    'Autumn Reflections',
    'Winter Solitude',
  ],
  C: [
    'Portrait Study',
    'Figure in Light',
    'Contemplative Moment',
    'Character Study',
    'Expressive Gesture',
    'Human Form',
    'Emotional Depth',
    'Life Drawing',
    'Personality Capture',
    'Intimate Portrait',
  ],
  D: [
    'Mixed Media Experiment',
    'Contemporary Vision',
    'Urban Landscape',
    'Digital Fusion',
    'Collage Composition',
    'Modern Expression',
    'Conceptual Piece',
    'Installation Study',
    'Multimedia Work',
    'Innovative Technique',
  ],
};

/**
 * Sample descriptions by category
 */
const SAMPLE_DESCRIPTIONS: Record<CategoryId, string[]> = {
  A: [
    'An exploration of abstract forms and vibrant colors that evoke emotion through pure visual elements.',
    'Geometric shapes dance across the canvas in a harmonious composition of line and color.',
    'A study in color theory and emotional expression through non-representational forms.',
    'Fluid brushstrokes create movement and energy in this dynamic abstract piece.',
    'Layered textures and bold colors combine to create a powerful visual impact.',
  ],
  B: [
    'A serene landscape capturing the natural beauty and tranquility of the outdoors.',
    'Painted en plein air, this piece captures the changing light and atmosphere of nature.',
    'A celebration of the natural world through careful observation and artistic interpretation.',
    'The interplay of light and shadow creates depth and mood in this landscape study.',
    'Rich earth tones and careful composition bring this natural scene to life.',
  ],
  C: [
    'A sensitive portrayal that captures both the physical likeness and inner character of the subject.',
    'Careful attention to light and form reveals the humanity and dignity of the subject.',
    'An intimate study that explores the relationship between artist and subject.',
    'Expressive brushwork and thoughtful composition create a compelling character study.',
    'The subtle interplay of light and shadow reveals the depth and complexity of human emotion.',
  ],
  D: [
    'An innovative work that pushes the boundaries of traditional artistic media and techniques.',
    'Contemporary themes explored through experimental materials and unconventional approaches.',
    'A fusion of digital and traditional media creates new possibilities for artistic expression.',
    'Mixed media elements combine to create a multi-layered exploration of modern life.',
    'Conceptual art that challenges viewers to think beyond traditional artistic boundaries.',
  ],
};

/**
 * Sample mediums by category
 */
const SAMPLE_MEDIUMS: Record<CategoryId, string[]> = {
  A: [
    'Oil on canvas',
    'Acrylic on canvas',
    'Mixed media',
    'Oil on board',
    'Acrylic on paper',
  ],
  B: [
    'Oil on canvas',
    'Watercolor',
    'Oil on board',
    'Acrylic on canvas',
    'Pastel on paper',
  ],
  C: [
    'Oil on canvas',
    'Charcoal on paper',
    'Oil on board',
    'Acrylic on canvas',
    'Graphite on paper',
  ],
  D: [
    'Mixed media',
    'Digital print',
    'Collage',
    'Acrylic and digital',
    'Installation',
  ],
};

/**
 * Generate realistic mock artwork with varied metadata
 *
 * @param category - The artwork category
 * @param number - The sequential number within the category
 * @returns Artwork object with realistic mock data
 */
export function generateMockArtwork(
  category: CategoryId,
  number: number
): Artwork {
  const titles = SAMPLE_TITLES[category];
  const descriptions = SAMPLE_DESCRIPTIONS[category];
  const mediums = SAMPLE_MEDIUMS[category];

  // Use modulo to cycle through available options
  const titleIndex = (number - 1) % titles.length;
  const descriptionIndex = (number - 1) % descriptions.length;
  const mediumIndex = (number - 1) % mediums.length;

  // Generate random year between 2015 and current year
  const currentYear = new Date().getFullYear();
  const year = Math.floor(Math.random() * (currentYear - 2015 + 1)) + 2015;

  // Generate random dimensions
  const widths = [16, 18, 20, 24, 30, 36, 48];
  const heights = [12, 16, 20, 24, 30, 36, 40];
  const width = widths[Math.floor(Math.random() * widths.length)];
  const height = heights[Math.floor(Math.random() * heights.length)];

  return createArtwork(category, number, {
    title:
      `${titles[titleIndex]} ${number > titles.length ? Math.ceil(number / titles.length) : ''}`.trim(),
    description: descriptions[descriptionIndex],
    medium: mediums[mediumIndex],
    year,
    dimensions: `${width}" × ${height}"`,
  });
}

/**
 * Generate a complete mock dataset with specified counts per category
 *
 * @param categoryCounts - Object specifying how many artworks per category
 * @returns Array of all generated artworks
 */
export function generateMockDataset(
  categoryCounts: Partial<Record<CategoryId, number>> = {}
): Artwork[] {
  const defaultCounts: Record<CategoryId, number> = {
    A: 400, // Largest category
    B: 350,
    C: 300,
    D: 450, // Second largest
  };

  const counts = { ...defaultCounts, ...categoryCounts };
  const allArtworks: Artwork[] = [];

  (['A', 'B', 'C', 'D'] as CategoryId[]).forEach(category => {
    const count = counts[category];
    for (let i = 1; i <= count; i++) {
      allArtworks.push(generateMockArtwork(category, i));
    }
  });

  return allArtworks;
}

/**
 * Generate a smaller mock dataset for development
 *
 * @returns Array of artworks with smaller counts for faster development
 */
export function generateDevMockDataset(): Artwork[] {
  return generateMockDataset({
    A: 25,
    B: 20,
    C: 15,
    D: 30,
  });
}

/**
 * Generate mock artworks for a specific category with realistic progression
 *
 * @param category - The category to generate artworks for
 * @param count - Number of artworks to generate
 * @returns Array of artworks for the specified category
 */
export function generateMockCategoryArtworks(
  category: CategoryId,
  count: number
): Artwork[] {
  const artworks: Artwork[] = [];

  for (let i = 1; i <= count; i++) {
    artworks.push(generateMockArtwork(category, i));
  }

  return artworks;
}

/**
 * Get a sample of featured artworks (one from each category)
 *
 * @returns Array of featured artworks for homepage or gallery previews
 */
export function getFeaturedArtworks(): Artwork[] {
  return [
    generateMockArtwork('A', 1),
    generateMockArtwork('B', 1),
    generateMockArtwork('C', 1),
    generateMockArtwork('D', 1),
  ];
}
