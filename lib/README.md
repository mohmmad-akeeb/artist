# Artwork Data Management System

This module provides a comprehensive system for managing artwork data in the artist portfolio website. It handles 1500+ images organized into four categories (A, B, C, D) with unique identifiers and Cloudflare R2 integration.

## Features

- **Artwork Organization**: Manage artworks across four categories (A, B, C, D)
- **Unique Identifiers**: Generate and parse artwork IDs (A1, A2, B1, etc.)
- **Cloudflare R2 Integration**: Generate optimized image URLs for different sizes
- **Filtering & Sorting**: Filter by category, sort by ID/year/title
- **Search Functionality**: Search artworks by title, description, or ID
- **Data Validation**: Validate artwork data structure
- **Mock Data Generation**: Generate realistic test data for development

## Core Modules

### `artwork-data.ts`

Main utilities for artwork management:

- `generateImageUrl()` - Generate Cloudflare R2 URLs
- `createArtwork()` - Create artwork objects with metadata
- `filterArtworksByCategory()` - Filter artworks by category
- `sortArtworksById()` - Sort artworks naturally by ID
- `searchArtworks()` - Search functionality
- `validateArtwork()` - Data validation

### `category-utils.ts`

Category management utilities:

- `getAllCategories()` - Get all categories with artwork counts
- `getCategory()` - Get specific category information
- `isValidCategoryId()` - Validate category IDs
- `getCategoryNavigation()` - Generate navigation data

### `mock-data.ts`

Development and testing utilities:

- `generateMockDataset()` - Generate full dataset (1500+ artworks)
- `generateDevMockDataset()` - Generate smaller dataset for development
- `getFeaturedArtworks()` - Get sample featured artworks

## Usage Examples

### Basic Artwork Creation

```typescript
import { createArtwork } from './artwork-data';

const artwork = createArtwork('A', 1, {
  title: 'Abstract Harmony',
  description: 'A vibrant exploration of color and form',
  year: 2023,
  medium: 'Oil on canvas',
  dimensions: '24" × 36"',
});
```

### Filtering and Sorting

```typescript
import { filterArtworksByCategory, sortArtworksById } from './artwork-data';

// Filter artworks by category
const categoryA = filterArtworksByCategory(allArtworks, 'A');

// Sort artworks by ID
const sorted = sortArtworksById(categoryA);
```

### Category Management

```typescript
import { getAllCategories, getCategory } from './category-utils';

// Get all categories with artwork counts
const categories = getAllCategories(artworks);

// Get specific category
const categoryA = getCategory('A', artworks);
```

### Search Functionality

```typescript
import { searchArtworks } from './artwork-data';

// Search by title or description
const results = searchArtworks(artworks, 'abstract');
```

### Image URL Generation

```typescript
import { generateImageUrl } from './artwork-data';

// Generate different image sizes
const thumbnail = generateImageUrl('A', 1, 'thumbnail');
const full = generateImageUrl('A', 1, 'full');
```

## Data Structure

### Artwork Interface

```typescript
interface Artwork {
  id: string; // Unique ID (A1, B2, etc.)
  category: 'A' | 'B' | 'C' | 'D';
  title: string;
  description: string;
  imageUrl: string; // Full resolution URL
  thumbnailUrl: string; // Thumbnail URL
  dimensions?: string; // Optional dimensions
  year?: number; // Optional year
  medium?: string; // Optional medium
}
```

### Category Interface

```typescript
interface Category {
  id: 'A' | 'B' | 'C' | 'D';
  name: string;
  description: string;
  coverImage: string;
  artworkCount: number;
}
```

## Configuration

### Environment Variables

```bash
NEXT_PUBLIC_R2_BASE_URL=https://your-domain.com
NEXT_PUBLIC_R2_BUCKET_NAME=artist-portfolio-images
```

### Cloudflare R2 Structure

```
bucket/
├── A/
│   ├── thumbnail/
│   ├── medium/
│   └── full/
├── B/
│   ├── thumbnail/
│   ├── medium/
│   └── full/
├── C/
│   ├── thumbnail/
│   ├── medium/
│   └── full/
└── D/
    ├── thumbnail/
    ├── medium/
    └── full/
```

## Performance Considerations

- **Lazy Loading**: Use intersection observer for gallery images
- **Image Optimization**: Multiple size variants (thumbnail, medium, full)
- **Efficient Filtering**: Optimized algorithms for large datasets
- **Memory Management**: Avoid loading all 1500+ images at once

## Development

### Running the Demo

```bash
# Install tsx for TypeScript execution
npm install -g tsx

# Run the demonstration
npx tsx lib/demo.ts
```

### Mock Data Generation

```typescript
import { generateDevMockDataset } from './mock-data';

// Generate smaller dataset for development (90 artworks)
const devData = generateDevMockDataset();

// Generate full dataset (1500+ artworks)
const fullData = generateMockDataset();
```

## Requirements Fulfilled

This implementation addresses the following requirements:

- **4.1**: Organize artwork by categories A, B, C, D
- **4.3**: Unique identifier format (A1, A2, B1, etc.)
- **4.4**: Efficient image loading and Cloudflare R2 integration

The system is designed to handle 1500+ images efficiently while providing a clean API for artwork management throughout the application.
