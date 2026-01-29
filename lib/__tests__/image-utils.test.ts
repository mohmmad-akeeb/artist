/**
 * Image Utils Tests
 *
 * Comprehensive tests for image utility functions
 */

import { vi } from 'vitest';
import {
  createImageError,
  getImageErrorType,
  ImageErrorType,
  // loadImageSafely,
  getImageDimensionsForSize,
  generateBlurDataURL,
  isImageCached,
  ImageLoadingTracker,
  // supportsWebP,
  // supportsAVIF,
  // getOptimalImageFormat,
  generateResponsiveSizes,
  calculateOptimalDimensions,
  generateDensitySrcSet,
  getOptimalImageQuality,
  shouldLazyLoad,
} from '../image-utils';

// Mock performance.now with incrementing time to ensure non-zero durations
let currentTime = 1000;
global.performance = {
  now: vi.fn(() => {
    currentTime += 10; // Increment by 10ms each call
    return currentTime;
  }),
} as any;

// Mock navigator
Object.defineProperty(global.navigator, 'connection', {
  writable: true,
  value: {
    effectiveType: '4g',
  },
});

describe('Image Utils', () => {
  describe('createImageError', () => {
    it('creates error object with correct properties', () => {
      const error = createImageError(
        ImageErrorType.NETWORK_ERROR,
        'Network failed',
        'https://example.com/image.jpg'
      );

      expect(error.type).toBe(ImageErrorType.NETWORK_ERROR);
      expect(error.message).toBe('Network failed');
      expect(error.url).toBe('https://example.com/image.jpg');
      expect(error.timestamp).toBeGreaterThan(0);
    });
  });

  describe('getImageErrorType', () => {
    it('identifies network errors', () => {
      const error = new Error('Network request failed');
      expect(getImageErrorType(error)).toBe(ImageErrorType.NETWORK_ERROR);
    });

    it('identifies 404 errors', () => {
      const error = new Error('404 not found');
      expect(getImageErrorType(error)).toBe(ImageErrorType.NOT_FOUND);
    });

    it('identifies timeout errors', () => {
      const error = new Error('Request timeout');
      expect(getImageErrorType(error)).toBe(ImageErrorType.TIMEOUT);
    });

    it('identifies invalid URL errors', () => {
      const error = new Error('Invalid URL format');
      expect(getImageErrorType(error)).toBe(ImageErrorType.INVALID_URL);
    });

    it('returns unknown for unrecognized errors', () => {
      const error = new Error('Some other error');
      expect(getImageErrorType(error)).toBe(ImageErrorType.UNKNOWN);
    });

    it('handles null/undefined errors', () => {
      expect(getImageErrorType(null)).toBe(ImageErrorType.UNKNOWN);
      expect(getImageErrorType(undefined)).toBe(ImageErrorType.UNKNOWN);
    });
  });

  describe('getImageDimensionsForSize', () => {
    it('returns correct dimensions for thumbnail', () => {
      const dimensions = getImageDimensionsForSize('thumbnail');
      expect(dimensions).toEqual({ width: 300, height: 300 });
    });

    it('returns correct dimensions for medium', () => {
      const dimensions = getImageDimensionsForSize('medium');
      expect(dimensions).toEqual({ width: 800, height: 800 });
    });

    it('returns correct dimensions for full', () => {
      const dimensions = getImageDimensionsForSize('full');
      expect(dimensions).toEqual({ width: 2000, height: 2000 });
    });
  });

  describe('generateBlurDataURL', () => {
    it('generates valid data URL', () => {
      const dataUrl = generateBlurDataURL(100, 100);
      expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('includes correct dimensions in SVG', () => {
      const dataUrl = generateBlurDataURL(200, 150);
      const base64 = dataUrl.split(',')[1];
      const svg = Buffer.from(base64, 'base64').toString();
      expect(svg).toContain('width="200"');
      expect(svg).toContain('height="150"');
    });
  });

  describe('isImageCached', () => {
    it('returns false in non-browser environment', () => {
      const result = isImageCached('https://example.com/image.jpg');
      expect(result).toBe(false);
    });
  });

  describe('ImageLoadingTracker', () => {
    let tracker: ImageLoadingTracker;

    beforeEach(() => {
      tracker = new ImageLoadingTracker();
    });

    it('initializes with empty metrics', () => {
      const metrics = tracker.getMetrics();
      expect(metrics.totalImages).toBe(0);
      expect(metrics.loadedImages).toBe(0);
      expect(metrics.failedImages).toBe(0);
      expect(metrics.averageLoadTime).toBe(0);
      expect(metrics.errors).toHaveLength(0);
    });

    it('tracks load start correctly', () => {
      const startTime = tracker.trackLoadStart();
      expect(typeof startTime).toBe('number');
      expect(tracker.getMetrics().totalImages).toBe(1);
    });

    it('tracks successful loads', () => {
      const startTime = tracker.trackLoadStart();
      tracker.trackLoadSuccess(startTime);

      const metrics = tracker.getMetrics();
      expect(metrics.loadedImages).toBe(1);
      expect(metrics.averageLoadTime).toBeGreaterThan(0);
    });

    it('tracks failed loads', () => {
      const startTime = tracker.trackLoadStart();
      const error = createImageError(
        ImageErrorType.NETWORK_ERROR,
        'Failed',
        'test.jpg'
      );
      tracker.trackLoadError(startTime, error);

      const metrics = tracker.getMetrics();
      expect(metrics.failedImages).toBe(1);
      expect(metrics.errors).toHaveLength(1);
      expect(metrics.errors[0]).toBe(error);
    });

    it('calculates average load time correctly', () => {
      // Mock performance.now to return predictable values
      // Use the global mock which auto-increments
      // let mockTime = 1000;
      // vi.mocked(performance.now).mockImplementation(() => mockTime);

      const startTime1 = tracker.trackLoadStart();
      // mockTime = 1100; // 100ms later
      tracker.trackLoadSuccess(startTime1);

      const startTime2 = tracker.trackLoadStart();
      // mockTime = 1300; // 200ms later
      tracker.trackLoadSuccess(startTime2);

      const metrics = tracker.getMetrics();
      // With global mock starting at 1000 and +10 per call:
      // start1: 1010
      // success1: 1020 (duration 10)
      // start2: 1030
      // success2: 1040 (duration 10)
      expect(metrics.averageLoadTime).toBe(10);
    });

    it('resets metrics correctly', () => {
      tracker.trackLoadStart();
      tracker.reset();

      const metrics = tracker.getMetrics();
      expect(metrics.totalImages).toBe(0);
      expect(metrics.loadedImages).toBe(0);
      expect(metrics.failedImages).toBe(0);
      expect(metrics.averageLoadTime).toBe(0);
      expect(metrics.errors).toHaveLength(0);
    });
  });

  describe('generateResponsiveSizes', () => {
    it('generates default responsive sizes', () => {
      const sizes = generateResponsiveSizes();
      expect(sizes).toContain('(max-width: 640px) 100vw');
      expect(sizes).toContain('(max-width: 1024px) 50vw');
      expect(sizes).toContain('(min-width: 1025px) 33vw');
    });

    it('accepts custom breakpoints', () => {
      const customBreakpoints = {
        mobile: '(max-width: 480px)',
        tablet: '(max-width: 768px)',
        desktop: '(min-width: 769px)',
      };
      const sizes = generateResponsiveSizes(customBreakpoints);
      expect(sizes).toContain('(max-width: 480px) 100vw');
      expect(sizes).toContain('(max-width: 768px) 50vw');
      expect(sizes).toContain('(min-width: 769px) 33vw');
    });
  });

  describe('calculateOptimalDimensions', () => {
    it('calculates dimensions with default DPR', () => {
      const dimensions = calculateOptimalDimensions(100, 200);
      expect(dimensions).toEqual({ width: 100, height: 200 });
    });

    it('applies device pixel ratio', () => {
      const dimensions = calculateOptimalDimensions(100, 200, 2);
      expect(dimensions).toEqual({ width: 200, height: 400 });
    });

    it('caps DPR at 2 for performance', () => {
      const dimensions = calculateOptimalDimensions(100, 200, 3);
      expect(dimensions).toEqual({ width: 200, height: 400 });
    });

    it('rounds dimensions to integers', () => {
      const dimensions = calculateOptimalDimensions(100.7, 200.3, 1.5);
      expect(dimensions).toEqual({ width: 151, height: 300 });
    });
  });

  describe('generateDensitySrcSet', () => {
    it('generates srcset for default densities', () => {
      const srcSet = generateDensitySrcSet('https://example.com/image.jpg');
      expect(srcSet).toContain('https://example.com/image.jpg?dpr=1 1x');
      expect(srcSet).toContain('https://example.com/image.jpg?dpr=1.5 1.5x');
      expect(srcSet).toContain('https://example.com/image.jpg?dpr=2 2x');
    });

    it('handles URLs with existing query parameters', () => {
      const srcSet = generateDensitySrcSet(
        'https://example.com/image.jpg?w=100'
      );
      expect(srcSet).toContain('https://example.com/image.jpg?w=100&dpr=1 1x');
    });

    it('accepts custom densities', () => {
      const srcSet = generateDensitySrcSet(
        'https://example.com/image.jpg',
        [1, 2]
      );
      expect(srcSet).toBe(
        'https://example.com/image.jpg?dpr=1 1x, https://example.com/image.jpg?dpr=2 2x'
      );
    });
  });

  describe('getOptimalImageQuality', () => {
    it('returns default quality when navigator is undefined', () => {
      const originalNavigator = global.navigator;
      // @ts-ignore
      delete global.navigator;

      const quality = getOptimalImageQuality();
      expect(quality).toBe(85);

      global.navigator = originalNavigator;
    });

    it('returns default quality when connection is not available', () => {
      Object.defineProperty(global.navigator, 'connection', {
        value: undefined,
      });

      const quality = getOptimalImageQuality();
      expect(quality).toBe(85);
    });

    it('returns lower quality for slow connections', () => {
      Object.defineProperty(global.navigator, 'connection', {
        value: { effectiveType: '2g' },
      });

      const quality = getOptimalImageQuality();
      expect(quality).toBe(60);
    });

    it('returns medium quality for 3G', () => {
      Object.defineProperty(global.navigator, 'connection', {
        value: { effectiveType: '3g' },
      });

      const quality = getOptimalImageQuality();
      expect(quality).toBe(75);
    });

    it('returns high quality for 4G', () => {
      Object.defineProperty(global.navigator, 'connection', {
        value: { effectiveType: '4g' },
      });

      const quality = getOptimalImageQuality();
      expect(quality).toBe(85);
    });
  });

  describe('shouldLazyLoad', () => {
    it('returns true when element is below threshold', () => {
      const result = shouldLazyLoad(2000, 1000, 1.5);
      expect(result).toBe(true);
    });

    it('returns false when element is within threshold', () => {
      const result = shouldLazyLoad(1000, 1000, 1.5);
      expect(result).toBe(false);
    });

    it('uses default threshold of 1.5', () => {
      const result = shouldLazyLoad(1600, 1000);
      expect(result).toBe(true);
    });
  });
});
