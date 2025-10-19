# Cloudflare R2 Integration

This directory contains the complete Cloudflare R2 integration for the artist portfolio website, providing efficient image storage, optimization, and delivery for 1500+ artwork images.

## Overview

The R2 integration includes:

- **Image URL generation** with optimization parameters
- **Error handling and fallbacks** for failed image loads
- **Performance optimization** with lazy loading and caching
- **Responsive image support** with multiple size variants
- **Diagnostic tools** for testing and debugging

## File Structure

```
lib/
├── cloudflare-r2.ts          # Core R2 integration utilities
├── image-utils.ts             # Image handling and optimization
├── r2-diagnostics.ts          # Testing and debugging tools
└── hooks/
    └── useImageLoading.ts     # React hook for image loading

components/ui/
└── OptimizedImage.tsx         # React component with R2 integration

public/images/
├── artwork-placeholder.svg    # Fallback for artwork images
└── category-placeholder.svg   # Fallback for category images

scripts/
└── test-r2-integration.js     # Integration test script
```

## Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```bash
# Required: Base URL for your R2 bucket
NEXT_PUBLIC_R2_BASE_URL=https://your-bucket.r2.cloudflarestorage.com

# Required: R2 bucket name
NEXT_PUBLIC_R2_BUCKET_NAME=artist-portfolio-images

# Optional: Custom domain for better performance
NEXT_PUBLIC_R2_CUSTOM_DOMAIN=https://images.yourdomain.com

# Optional: Enable Cloudflare Image Resizing
NEXT_PUBLIC_R2_ENABLE_OPTIMIZATION=true
```

### R2 Bucket Structure

Organize your images in the R2 bucket as follows:

```
artist-portfolio-images/
├── A/
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── cover.jpg
│   └── ...
├── B/
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── cover.jpg
│   └── ...
├── C/
│   └── ...
└── D/
    └── ...
```

## Usage

### Basic Image Loading

```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

// Load artwork image
<OptimizedImage
  category="A"
  identifier="1"
  size="medium"
  alt="Artwork A1"
  className="w-full h-auto"
/>

// Load category cover
<CategoryCoverImage
  category="A"
  size="medium"
  alt="Category A"
/>

// Load by artwork ID
<ArtworkImage
  artworkId="A1"
  size="thumbnail"
  alt="Artwork A1"
/>
```

### Using the Image Loading Hook

```tsx
import { useImageLoading } from '@/lib/hooks/useImageLoading';

function MyComponent() {
  const { loading, loaded, error, currentUrl, retry } = useImageLoading(
    'https://images.example.com/A/1.jpg',
    {
      maxRetries: 3,
      useFallback: true,
      onLoad: url => console.log('Image loaded:', url),
      onError: error => console.error('Image failed:', error),
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <button onClick={retry}>Retry</button>;

  return <img src={currentUrl} alt="Artwork" />;
}
```

### Generating Image URLs

```tsx
import {
  generateArtworkImageUrl,
  generateResponsiveImageUrls,
  generateImageSrcSet,
} from '@/lib/cloudflare-r2';

// Single URL
const thumbnailUrl = generateArtworkImageUrl('A', '1', 'thumbnail');

// Multiple sizes
const urls = generateResponsiveImageUrls('A', '1');
// Returns: { thumbnail: '...', medium: '...', full: '...' }

// For responsive images
const srcSet = generateImageSrcSet('A', '1');
// Returns: "url1 300w, url2 800w, url3 2000w"
```

## Image Optimization

The integration supports Cloudflare Image Resizing with these size configurations:

- **Thumbnail**: 300x300px, WebP, 80% quality, cover fit
- **Medium**: 800x800px, WebP, 85% quality, scale-down fit
- **Full**: 2000x2000px, WebP, 90% quality, scale-down fit

### Custom Optimization

```tsx
import { generateOptimizedImageUrl } from '@/lib/cloudflare-r2';

const customUrl = generateOptimizedImageUrl('A/1.jpg', {
  width: 500,
  height: 500,
  quality: 75,
  format: 'avif',
  fit: 'crop',
});
```

## Error Handling

The integration provides comprehensive error handling:

### Automatic Fallbacks

- Failed images automatically fall back to placeholder SVGs
- Network errors trigger retry mechanisms
- Invalid URLs are handled gracefully

### Error Types

```tsx
import { ImageErrorType } from '@/lib/image-utils';

// Error types:
// - NETWORK_ERROR: Connection issues
// - NOT_FOUND: 404 errors
// - INVALID_URL: Malformed URLs
// - TIMEOUT: Loading timeouts
// - UNKNOWN: Other errors
```

### Custom Error Handling

```tsx
<OptimizedImage
  category="A"
  identifier="1"
  fallbackUrl="/custom-fallback.jpg"
  onError={error => {
    console.error('Image failed to load:', error);
    // Custom error handling logic
  }}
/>
```

## Performance Features

### Lazy Loading

```tsx
import { useLazyImageLoading } from '@/lib/hooks/useImageLoading';

function LazyImage({ src }) {
  const { loading, currentUrl, ref, inView } = useLazyImageLoading(src);

  return (
    <div ref={ref}>{inView && <img src={currentUrl} alt="Lazy loaded" />}</div>
  );
}
```

### Image Preloading

```tsx
import { preloadCriticalImages } from '@/lib/image-utils';

// Preload important images
const artworks = [
  { category: 'A', id: 'A1' },
  { category: 'A', id: 'A2' },
];

const { loaded, failed, errors } = await preloadCriticalImages(artworks);
```

### Performance Tracking

```tsx
import { imageLoadingTracker } from '@/lib/image-utils';

// Get performance metrics
const metrics = imageLoadingTracker.getMetrics();
console.log('Average load time:', metrics.averageLoadTime);
console.log('Success rate:', metrics.loadedImages / metrics.totalImages);
```

## Testing and Diagnostics

### Run Diagnostics

```bash
# Test R2 integration
node scripts/test-r2-integration.js

# In browser console (development only)
window.r2Diagnostics.run();
```

### Manual Testing

```tsx
import { runR2Diagnostics, testArtworkImage } from '@/lib/r2-diagnostics';

// Full diagnostic suite
const results = await runR2Diagnostics();
console.log('R2 Status:', results.summary.overallSuccess);

// Test specific image
const test = await testArtworkImage('A', '1');
console.log('Image test:', test.success);
```

### Debug Information

```tsx
import { getR2DebugInfo } from '@/lib/r2-diagnostics';

const debug = getR2DebugInfo();
console.log('R2 Config:', debug.config);
console.log('Sample URLs:', debug.sampleUrls);
```

## Troubleshooting

### Common Issues

1. **Images not loading**
   - Check R2 bucket configuration
   - Verify environment variables
   - Run diagnostics: `node scripts/test-r2-integration.js`

2. **Slow loading**
   - Enable custom domain for R2
   - Check image optimization settings
   - Verify image sizes are appropriate

3. **CORS errors**
   - Configure CORS policy in R2 bucket settings
   - Allow your domain in R2 CORS configuration

### Debug Mode

Enable debug logging in development:

```tsx
// Add to your app
if (process.env.NODE_ENV === 'development') {
  import('@/lib/r2-diagnostics').then(({ logR2Diagnostics }) => {
    logR2Diagnostics();
  });
}
```

## Best Practices

1. **Use appropriate image sizes** for different contexts
2. **Enable custom domain** for better performance
3. **Implement lazy loading** for large galleries
4. **Preload critical images** above the fold
5. **Monitor performance** with the tracking utilities
6. **Test regularly** with the diagnostic tools

## Security Considerations

- R2 bucket should be configured for public read access
- Use custom domain to avoid exposing R2 URLs
- Implement proper CORS policies
- Consider signed URLs for sensitive content

## Migration Guide

If migrating from another image storage solution:

1. Upload images to R2 bucket in the correct structure
2. Update environment variables
3. Replace image components with `OptimizedImage`
4. Test with diagnostics
5. Monitor performance and adjust as needed
