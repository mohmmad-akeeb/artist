'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  /** Threshold for triggering animation (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Whether to trigger animation only once */
  triggerOnce?: boolean;
  /** Delay before animation starts (in ms) */
  delay?: number;
  /** Whether the element should start as visible */
  initialInView?: boolean;
}

interface UseScrollAnimationReturn {
  /** Ref to attach to the element */
  ref: React.RefObject<HTMLElement>;
  /** Whether the element is in view */
  inView: boolean;
  /** Whether the animation has been triggered */
  hasAnimated: boolean;
}

export function useScrollAnimation({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  delay = 0,
  initialInView = false,
}: UseScrollAnimationOptions = {}): UseScrollAnimationReturn {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(initialInView);
  const [hasAnimated, setHasAnimated] = useState(initialInView);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setInView(true);
              setHasAnimated(true);
            }, delay);
          } else {
            setInView(true);
            setHasAnimated(true);
          }

          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, delay]);

  return { ref, inView, hasAnimated };
}

// Specialized hooks for common animation patterns
export function useFadeInAnimation(options?: UseScrollAnimationOptions) {
  return useScrollAnimation({ threshold: 0.2, ...options });
}

export function useSlideUpAnimation(options?: UseScrollAnimationOptions) {
  return useScrollAnimation({ threshold: 0.1, ...options });
}

export function useStaggerAnimation(
  itemCount: number,
  staggerDelay: number = 100,
  options?: UseScrollAnimationOptions
) {
  const { ref, inView, hasAnimated } = useScrollAnimation(options);

  const getStaggerDelay = (index: number) => {
    return inView ? index * staggerDelay : 0;
  };

  return { ref, inView, hasAnimated, getStaggerDelay };
}
