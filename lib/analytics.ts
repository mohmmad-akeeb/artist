// Analytics and performance monitoring utilities

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    gtag?: (..._args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID || process.env.NODE_ENV !== 'production') return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title || document.title,
    page_location: url,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track artwork interactions
export const trackArtworkView = (artworkId: string, category: string) => {
  trackEvent('view_artwork', 'artwork', `${category}-${artworkId}`);
};

export const trackArtworkSelect = (artworkId: string, category: string) => {
  trackEvent('select_artwork', 'cart', `${category}-${artworkId}`);
};

export const trackCartAction = (
  action: 'add' | 'remove' | 'clear',
  itemCount?: number
) => {
  trackEvent(action, 'cart', undefined, itemCount);
};

export const trackFormSubmission = (
  formType: 'contact' | 'inquiry',
  success: boolean
) => {
  trackEvent(
    success ? 'form_submit_success' : 'form_submit_error',
    'form',
    formType
  );
};

// Performance monitoring
export const trackPerformance = () => {
  if (!process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING) return;

  // Track Core Web Vitals
  import('web-vitals')
    .then(webVitals => {
      if (webVitals.getCLS) {
        webVitals.getCLS(metric =>
          trackEvent('CLS', 'performance', undefined, metric.value)
        );
      }
      if (webVitals.getFID) {
        webVitals.getFID(metric =>
          trackEvent('FID', 'performance', undefined, metric.value)
        );
      }
      if (webVitals.getFCP) {
        webVitals.getFCP(metric =>
          trackEvent('FCP', 'performance', undefined, metric.value)
        );
      }
      if (webVitals.getLCP) {
        webVitals.getLCP(metric =>
          trackEvent('LCP', 'performance', undefined, metric.value)
        );
      }
      if (webVitals.getTTFB) {
        webVitals.getTTFB(metric =>
          trackEvent('TTFB', 'performance', undefined, metric.value)
        );
      }
    })
    .catch(error => {
      console.warn('Web Vitals not available:', error);
    });

  // Track custom performance metrics
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const domContentLoaded =
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart;

      trackEvent(
        'page_load_time',
        'performance',
        undefined,
        Math.round(loadTime)
      );
      trackEvent(
        'dom_content_loaded',
        'performance',
        undefined,
        Math.round(domContentLoaded)
      );
    }
  }
};

// Error tracking
export const trackError = (error: Error, errorInfo?: any) => {
  if (!process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING) return;

  trackEvent('javascript_error', 'error', error.message);

  // Send to external error tracking service if configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== 'undefined') {
    // Sentry integration would go here
    console.error('Error tracked:', error, errorInfo);
  }
};

// Image loading performance
export const trackImageLoad = (
  src: string,
  loadTime: number,
  success: boolean
) => {
  const category = success ? 'image_load_success' : 'image_load_error';
  trackEvent(category, 'performance', src, Math.round(loadTime));
};
