/**
 * Critical Image Preloader Component
 *
 * Preloads critical images (landing background, category covers) for better performance.
 * Uses intersection observer and priority loading for optimal user experience.
 */

'use client';

import { useEffect, useState } from 'react';
import { useCriticalImagePreloader } from '@/lib/hooks/useLazyLoading';
import { generateCategoryCoverUrl } from '@/lib/cloudflare-r2';
import { CategoryId } from '@/lib/types';

/**
 * Critical images configuration
 */
const CRITICAL_IMAGES = {
  // Landing page background
  landingBackground: '/images/landing-background.svg',

  // Category cover images
  categoryCovers: (['A', 'B', 'C', 'D'] as CategoryId[]).map(category =>
    generateCategoryCoverUrl(category, 'medium')
  ),

  // Artist photo for about page
  artistPhoto: '/images/artist-photo.jpeg',
} as const;

/**
 * Get all critical image URLs
 */
function getCriticalImageUrls(): string[] {
  return [
    CRITICAL_IMAGES.landingBackground,
    ...CRITICAL_IMAGES.categoryCovers,
    CRITICAL_IMAGES.artistPhoto,
  ];
}

/**
 * Props for CriticalImagePreloader
 */
export interface CriticalImagePreloaderProps {
  /** Whether to show loading progress */
  showProgress?: boolean;
  /** Whether to preload immediately */
  immediate?: boolean;
  /** Callback when preloading is complete */
  onComplete?: () => void;
  /** Callback for progress updates */
  onProgress?: (_progress: number) => void;
}

/**
 * Critical Image Preloader Component
 */
export default function CriticalImagePreloader({
  showProgress = false,
  immediate = true,
  onComplete,
  onProgress,
}: CriticalImagePreloaderProps) {
  const criticalUrls = getCriticalImageUrls();

  const { loaded, total, progress, isComplete, failed } =
    useCriticalImagePreloader(criticalUrls, {
      immediate,
      maxConcurrent: 2, // Conservative to avoid overwhelming the connection
    });

  // Call callbacks when progress changes
  useEffect(() => {
    onProgress?.(progress);
  }, [progress, onProgress]);

  useEffect(() => {
    if (isComplete) {
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  // Log failed images in development
  useEffect(() => {
    if (failed.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('Failed to preload critical images:', failed);
    }
  }, [failed]);

  if (!showProgress) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">
              Preloading Images
            </span>
            <span className="text-xs text-gray-500">
              {loaded}/{total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status text */}
          <div className="mt-1 text-xs text-gray-500">
            {isComplete ? (
              <span className="text-green-600">✓ Complete</span>
            ) : (
              <span>Loading critical images...</span>
            )}
          </div>

          {/* Failed images indicator */}
          {failed.length > 0 && (
            <div className="mt-1 text-xs text-orange-600">
              {failed.length} failed to load
            </div>
          )}
        </div>

        {/* Loading spinner */}
        {!isComplete && (
          <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        )}

        {/* Complete checkmark */}
        {isComplete && (
          <div className="w-4 h-4 text-green-600">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for using critical image preloader
 */
export function useCriticalImages() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);

  const criticalUrls = getCriticalImageUrls();

  const preloader = useCriticalImagePreloader(criticalUrls, {
    immediate: true,
    maxConcurrent: 2,
  });

  useEffect(() => {
    setPreloadProgress(preloader.progress);
    setIsPreloading(!preloader.isComplete);
  }, [preloader.progress, preloader.isComplete]);

  return {
    isPreloading,
    preloadProgress,
    preloadedImages: preloader.loaded,
    totalImages: preloader.total,
    failedImages: preloader.failed,
    isComplete: preloader.isComplete,
  };
}

/**
 * Preload specific category images
 */
export function preloadCategoryImages(categories: CategoryId[]): Promise<{
  loaded: string[];
  failed: string[];
}> {
  const urls = categories.map(category =>
    generateCategoryCoverUrl(category, 'medium')
  );

  return new Promise(resolve => {
    const loaded: string[] = [];
    const failed: string[] = [];
    let completed = 0;

    urls.forEach(url => {
      const img = new Image();

      img.onload = () => {
        loaded.push(url);
        completed++;
        if (completed === urls.length) {
          resolve({ loaded, failed });
        }
      };

      img.onerror = () => {
        failed.push(url);
        completed++;
        if (completed === urls.length) {
          resolve({ loaded, failed });
        }
      };

      img.src = url;
    });
  });
}

/**
 * Preload landing page images
 */
export function preloadLandingImages(): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();

    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);

    img.src = CRITICAL_IMAGES.landingBackground;
  });
}
