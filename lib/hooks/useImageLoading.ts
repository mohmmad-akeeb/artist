/**
 * Image Loading Hook
 *
 * Custom React hook for handling image loading states, errors, and retries
 * with Cloudflare R2 integration and fallback support.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageLoadState } from '../types';
import {
  loadImageSafely,
  ImageLoadingOptions,
  ImageError,
  imageLoadingTracker,
} from '../image-utils';
import { getFallbackImageUrl } from '../cloudflare-r2';

/**
 * Extended image loading state with additional utilities
 */
export interface UseImageLoadingReturn extends ImageLoadState {
  /** Retry loading the image */
  retry: () => void;
  /** Reset loading state */
  reset: () => void;
  /** Current image URL (may be fallback) */
  currentUrl: string;
  /** Whether currently using fallback image */
  isUsingFallback: boolean;
  /** Image error details if any */
  imageError?: ImageError;
}

/**
 * Hook options
 */
export interface UseImageLoadingOptions extends ImageLoadingOptions {
  /** Whether to start loading immediately */
  immediate?: boolean;
  /** Callback when image loads successfully */
  onLoad?: (_url: string) => void;
  /** Callback when image fails to load */
  onError?: (_error: ImageError) => void;
}

/**
 * Custom hook for image loading with comprehensive error handling
 */
export function useImageLoading(
  url: string,
  options: UseImageLoadingOptions = {}
): UseImageLoadingReturn {
  const { immediate = true, onLoad, onError, ...loadingOptions } = options;

  const [state, setState] = useState<ImageLoadState>({
    loading: false,
    loaded: false,
    error: undefined,
  });

  const [currentUrl, setCurrentUrl] = useState(url);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [imageError, setImageError] = useState<ImageError | undefined>();

  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingStartTimeRef = useRef<number>(0);

  /**
   * Load image with error handling
   */
  const loadImage = useCallback(
    async (imageUrl: string) => {
      // Cancel any ongoing loading
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        loading: true,
        error: undefined,
      }));

      setImageError(undefined);
      loadingStartTimeRef.current = imageLoadingTracker.trackLoadStart();

      try {
        const result = await loadImageSafely(imageUrl, loadingOptions);

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (result.success) {
          setState({
            loading: false,
            loaded: true,
            error: undefined,
          });

          setCurrentUrl(result.url);
          setIsUsingFallback(result.url !== imageUrl);

          if (result.error) {
            setImageError(result.error);
          }

          imageLoadingTracker.trackLoadSuccess(loadingStartTimeRef.current);
          onLoad?.(result.url);
        } else {
          const errorMessage = result.error?.message || 'Failed to load image';

          setState({
            loading: false,
            loaded: false,
            error: errorMessage,
          });

          if (result.error) {
            setImageError(result.error);
            imageLoadingTracker.trackLoadError(
              loadingStartTimeRef.current,
              result.error
            );
          }

          setCurrentUrl(result.url);
          setIsUsingFallback(true);

          onError?.(result.error!);
        }
      } catch (error) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        setState({
          loading: false,
          loaded: false,
          error: errorMessage,
        });

        // Try to use fallback image
        const fallbackUrl = getFallbackImageUrl('artwork');
        setCurrentUrl(fallbackUrl);
        setIsUsingFallback(true);

        onError?.(imageError!);
      }
    },
    [loadingOptions, onLoad, onError, imageError]
  );

  /**
   * Retry loading the original image
   */
  const retry = useCallback(() => {
    setIsUsingFallback(false);
    loadImage(url);
  }, [url, loadImage]);

  /**
   * Reset loading state
   */
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      loading: false,
      loaded: false,
      error: undefined,
    });

    setCurrentUrl(url);
    setIsUsingFallback(false);
    setImageError(undefined);
  }, [url]);

  // Load image when URL changes or on mount
  useEffect(() => {
    if (immediate && url) {
      loadImage(url);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, immediate, loadImage]);

  // Update current URL when prop changes
  useEffect(() => {
    if (!isUsingFallback) {
      setCurrentUrl(url);
    }
  }, [url, isUsingFallback]);

  return {
    ...state,
    retry,
    reset,
    currentUrl,
    isUsingFallback,
    imageError,
  };
}

/**
 * Hook for preloading multiple images
 */
export function useImagePreloader(urls: string[]): {
  loaded: number;
  total: number;
  progress: number;
  isComplete: boolean;
  errors: ImageError[];
} {
  const [loaded, setLoaded] = useState(0);
  const [errors, setErrors] = useState<ImageError[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setIsComplete(true);
      return;
    }

    let loadedCount = 0;
    const errorList: ImageError[] = [];

    const preloadPromises = urls.map(async url => {
      try {
        const result = await loadImageSafely(url, {
          maxRetries: 1,
          useFallback: false,
        });

        if (result.success) {
          loadedCount++;
        } else if (result.error) {
          errorList.push(result.error);
        }
      } catch (error) {
        // Handle any unexpected errors
        console.warn('Image preload failed:', url, error);
      }

      setLoaded(loadedCount);
    });

    Promise.allSettled(preloadPromises).then(() => {
      setErrors(errorList);
      setIsComplete(true);
    });

    return () => {
      // Cleanup if component unmounts
      setLoaded(0);
      setErrors([]);
      setIsComplete(false);
    };
  }, [urls]);

  const progress = urls.length > 0 ? (loaded / urls.length) * 100 : 100;

  return {
    loaded,
    total: urls.length,
    progress,
    isComplete,
    errors,
  };
}

/**
 * Hook for lazy loading images with intersection observer
 */
export function useLazyImageLoading(
  url: string,
  options: UseImageLoadingOptions & {
    /** Root margin for intersection observer */
    rootMargin?: string;
    /** Threshold for intersection observer */
    threshold?: number;
  } = {}
): UseImageLoadingReturn & {
  /** Ref to attach to the image element */
  ref: React.RefObject<HTMLElement>;
  /** Whether the image is in viewport */
  inView: boolean;
} {
  const { rootMargin = '50px', threshold = 0.1, ...imageOptions } = options;

  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Set up intersection observer
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  // Use regular image loading hook, but only start when in view
  const imageLoading = useImageLoading(url, {
    ...imageOptions,
    immediate: inView,
  });

  return {
    ...imageLoading,
    ref,
    inView,
  };
}
