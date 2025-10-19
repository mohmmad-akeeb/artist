/**
 * Enhanced Lazy Loading Hook
 *
 * Advanced intersection observer hook for lazy loading images and components
 * with performance optimizations and customizable thresholds.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Lazy loading options
 */
export interface UseLazyLoadingOptions {
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number | number[];
  /** Whether to trigger only once */
  triggerOnce?: boolean;
  /** Whether to start observing immediately */
  enabled?: boolean;
  /** Callback when element enters viewport */
  onEnter?: () => void;
  /** Callback when element exits viewport */
  onExit?: () => void;
}

/**
 * Lazy loading return type
 */
export interface UseLazyLoadingReturn {
  /** Ref to attach to the element */
  ref: React.RefObject<HTMLElement>;
  /** Whether the element is in viewport */
  inView: boolean;
  /** Whether the element has been seen */
  hasBeenSeen: boolean;
  /** Manually trigger the intersection */
  trigger: () => void;
  /** Reset the state */
  reset: () => void;
}

/**
 * Enhanced lazy loading hook with intersection observer
 */
export function useLazyLoading(
  options: UseLazyLoadingOptions = {}
): UseLazyLoadingReturn {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true,
    enabled = true,
    onEnter,
    onExit,
  } = options;

  const [inView, setInView] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const trigger = useCallback(() => {
    setInView(true);
    setHasBeenSeen(true);
    onEnter?.();
  }, [onEnter]);

  const reset = useCallback(() => {
    setInView(false);
    setHasBeenSeen(false);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        setInView(isIntersecting);

        if (isIntersecting) {
          setHasBeenSeen(true);
          onEnter?.();

          // Disconnect if triggerOnce is true
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else {
          onExit?.();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [rootMargin, threshold, triggerOnce, enabled, onEnter, onExit]);

  return {
    ref,
    inView,
    hasBeenSeen,
    trigger,
    reset,
  };
}

/**
 * Lazy loading hook specifically for images
 */
export function useLazyImage(
  src: string,
  options: UseLazyLoadingOptions & {
    /** Whether to preload the image when in view */
    preload?: boolean;
  } = {}
): UseLazyLoadingReturn & {
  /** Image source to use (empty until in view) */
  imageSrc: string;
  /** Whether the image is loaded */
  imageLoaded: boolean;
  /** Whether the image failed to load */
  imageError: boolean;
} {
  const { preload = true, ...lazyOptions } = options;
  const [imageSrc, setImageSrc] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const lazyLoading = useLazyLoading({
    ...lazyOptions,
    onEnter: () => {
      setImageSrc(src);
      lazyOptions.onEnter?.();
    },
  });

  // Preload image when it becomes visible
  useEffect(() => {
    if (imageSrc && preload) {
      const img = new Image();

      img.onload = () => {
        setImageLoaded(true);
        setImageError(false);
      };

      img.onerror = () => {
        setImageError(true);
        setImageLoaded(false);
      };

      img.src = imageSrc;
    }
  }, [imageSrc, preload]);

  return {
    ...lazyLoading,
    imageSrc,
    imageLoaded,
    imageError,
  };
}

/**
 * Lazy loading hook for multiple elements
 */
export function useLazyLoadingList<T>(
  items: T[],
  options: UseLazyLoadingOptions & {
    /** Number of items to load initially */
    initialCount?: number;
    /** Number of items to load per batch */
    batchSize?: number;
  } = {}
): {
  /** Items that should be rendered */
  visibleItems: T[];
  /** Whether more items are available */
  hasMore: boolean;
  /** Load more items */
  loadMore: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Ref for the load more trigger element */
  loadMoreRef: React.RefObject<HTMLElement>;
} {
  const { initialCount = 10, batchSize = 10, ...lazyOptions } = options;
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + batchSize, items.length));
  }, [batchSize, items.length]);

  const reset = useCallback(() => {
    setVisibleCount(initialCount);
  }, [initialCount]);

  const lazyLoading = useLazyLoading({
    ...lazyOptions,
    triggerOnce: false,
    onEnter: loadMore,
  });

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    hasMore,
    loadMore,
    reset,
    loadMoreRef: lazyLoading.ref,
  };
}

/**
 * Performance-optimized lazy loading for large lists
 */
export function useVirtualizedLazyLoading<T>(
  items: T[],
  options: {
    /** Container height */
    containerHeight: number;
    /** Item height */
    itemHeight: number;
    /** Buffer size (number of items to render outside viewport) */
    buffer?: number;
    /** Root margin for intersection observer */
    rootMargin?: string;
  }
): {
  /** Items that should be rendered */
  visibleItems: Array<{ item: T; index: number }>;
  /** Start index of visible items */
  startIndex: number;
  /** End index of visible items */
  endIndex: number;
  /** Total height of the list */
  totalHeight: number;
  /** Offset from top */
  offsetY: number;
  /** Ref for the container */
  containerRef: React.RefObject<HTMLElement>;
} {
  const { containerHeight, itemHeight, buffer = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );

  const visibleItems = items
    .slice(startIndex, endIndex + 1)
    .map((item, index) => ({ item, index: startIndex + index }));

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    containerRef,
  };
}

/**
 * Hook for preloading critical images
 */
export function useCriticalImagePreloader(
  imageUrls: string[],
  options: {
    /** Whether to start preloading immediately */
    immediate?: boolean;
    /** Maximum concurrent preloads */
    maxConcurrent?: number;
  } = {}
): {
  /** Number of images loaded */
  loaded: number;
  /** Total number of images */
  total: number;
  /** Loading progress (0-100) */
  progress: number;
  /** Whether all images are loaded */
  isComplete: boolean;
  /** Array of failed URLs */
  failed: string[];
  /** Start preloading */
  startPreloading: () => void;
} {
  const { immediate = true, maxConcurrent = 3 } = options;
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const startPreloading = useCallback(async () => {
    if (imageUrls.length === 0) {
      setIsComplete(true);
      return;
    }

    let loadedCount = 0;
    const failedUrls: string[] = [];

    // Process images in batches to avoid overwhelming the browser
    for (let i = 0; i < imageUrls.length; i += maxConcurrent) {
      const batch = imageUrls.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async url => {
        try {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load: ${url}`));
            img.src = url;
          });
          loadedCount++;
        } catch (error) {
          failedUrls.push(url);
        }

        setLoaded(loadedCount);
        setFailed([...failedUrls]);
      });

      await Promise.allSettled(batchPromises);
    }

    setIsComplete(true);
  }, [imageUrls, maxConcurrent]);

  useEffect(() => {
    if (immediate) {
      startPreloading();
    }
  }, [immediate, startPreloading]);

  const progress =
    imageUrls.length > 0 ? (loaded / imageUrls.length) * 100 : 100;

  return {
    loaded,
    total: imageUrls.length,
    progress,
    isComplete,
    failed,
    startPreloading,
  };
}
