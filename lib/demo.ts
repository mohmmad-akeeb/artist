/**
 * Demonstration of the Artwork Data Management System
 *
 * This file shows how to use the various utilities for managing artwork data.
 * Run this with: npx tsx lib/demo.ts (after installing tsx)
 */

import {
  generateImageUrl,
  parseArtworkId,
  createArtwork,
  filterArtworksByCategory,
  sortArtworksById,
  getCategoryStats,
  searchArtworks,
  validateArtwork,
} from './artwork-data';

import { getAllCategories } from './category-utils';

import { generateDevMockDataset, getFeaturedArtworks } from './mock-data';

// Demo function to showcase the artwork data management system
function demonstrateArtworkSystem() {
  console.log('🎨 Artwork Data Management System Demo\n');

  // 1. Generate mock dataset
  console.log('1. Generating mock dataset...');
  const artworks = generateDevMockDataset();
  console.log(`   Generated ${artworks.length} artworks`);

  // 2. Show category statistics
  console.log('\n2. Category Statistics:');
  const stats = getCategoryStats(artworks);
  Object.entries(stats).forEach(([category, stat]) => {
    console.log(
      `   Category ${category}: ${stat.count} artworks (${stat.percentage}%)`
    );
  });

  // 3. Demonstrate URL generation
  console.log('\n3. Image URL Generation:');
  console.log(`   Thumbnail: ${generateImageUrl('A', 1, 'thumbnail')}`);
  console.log(`   Full size: ${generateImageUrl('A', 1, 'full')}`);

  // 4. Show artwork ID parsing
  console.log('\n4. Artwork ID Parsing:');
  const parsed = parseArtworkId('A23');
  console.log(`   'A23' parsed as:`, parsed);

  // 5. Filter artworks by category
  console.log('\n5. Category Filtering:');
  const categoryA = filterArtworksByCategory(artworks, 'A');
  console.log(`   Category A has ${categoryA.length} artworks`);

  // 6. Search functionality
  console.log('\n6. Search Functionality:');
  const searchResults = searchArtworks(artworks, 'abstract');
  console.log(`   Found ${searchResults.length} artworks matching 'abstract'`);

  // 7. Sorting demonstration
  console.log('\n7. Sorting by ID:');
  const sorted = sortArtworksById(artworks.slice(0, 5));
  console.log('   First 5 artworks sorted by ID:');
  sorted.forEach(artwork => {
    console.log(`   - ${artwork.id}: ${artwork.title}`);
  });

  // 8. Category management
  console.log('\n8. Category Management:');
  const categories = getAllCategories(artworks);
  categories.forEach(category => {
    console.log(`   ${category.name}: ${category.artworkCount} artworks`);
  });

  // 9. Validation
  console.log('\n9. Artwork Validation:');
  const sampleArtwork = createArtwork('B', 1, {
    title: 'Sample Artwork',
    description: 'A beautiful landscape',
  });
  const validation = validateArtwork(sampleArtwork);
  console.log(`   Sample artwork is valid: ${validation.isValid}`);

  // 10. Featured artworks
  console.log('\n10. Featured Artworks:');
  const featured = getFeaturedArtworks();
  featured.forEach(artwork => {
    console.log(`   ${artwork.id}: ${artwork.title}`);
  });

  console.log('\n✅ Demo completed successfully!');
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateArtworkSystem();
}

export { demonstrateArtworkSystem };
