// Production monitoring and health check utilities

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    r2Connection: boolean;
    web3forms: boolean;
    analytics: boolean;
    performance: {
      loadTime: number;
      memoryUsage?: number;
    };
  };
  errors?: string[];
}

// Health check for R2 connectivity
export async function checkR2Health(): Promise<boolean> {
  try {
    const testUrl = `${process.env.NEXT_PUBLIC_R2_BASE_URL}/health-check.txt`;
    const response = await fetch(testUrl, {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch (error) {
    console.warn('R2 health check failed:', error);
    return false;
  }
}

// Health check for Web3forms
export async function checkWeb3formsHealth(): Promise<boolean> {
  try {
    // Simple connectivity test to Web3forms
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'OPTIONS',
      cache: 'no-cache',
    });
    return response.ok || response.status === 405; // 405 is expected for OPTIONS
  } catch (error) {
    console.warn('Web3forms health check failed:', error);
    return false;
  }
}

// Check analytics connectivity
export function checkAnalyticsHealth(): boolean {
  if (!process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) return true;

  try {
    return (
      typeof window !== 'undefined' &&
      !!window.gtag &&
      !!process.env.NEXT_PUBLIC_ANALYTICS_ID
    );
  } catch (error) {
    console.warn('Analytics health check failed:', error);
    return false;
  }
}

// Performance metrics collection
export function getPerformanceMetrics() {
  if (typeof window === 'undefined') return { loadTime: 0 };

  const navigation = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;
  const loadTime = navigation
    ? navigation.loadEventEnd - navigation.loadEventStart
    : 0;

  let memoryUsage;
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    memoryUsage = memory.usedJSHeapSize;
  }

  return {
    loadTime: Math.round(loadTime),
    memoryUsage,
  };
}

// Comprehensive health check
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    const [r2Health, web3formsHealth] = await Promise.all([
      checkR2Health(),
      checkWeb3formsHealth(),
    ]);

    const analyticsHealth = checkAnalyticsHealth();
    const performance = getPerformanceMetrics();

    // Determine overall status
    let status: HealthCheckResult['status'] = 'healthy';

    if (!r2Health) {
      errors.push('R2 storage connectivity issues');
      status = 'degraded';
    }

    if (!web3formsHealth) {
      errors.push('Web3forms service unavailable');
      status = 'degraded';
    }

    if (
      !analyticsHealth &&
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
    ) {
      errors.push('Analytics not properly initialized');
      status = 'degraded';
    }

    if (performance.loadTime > 5000) {
      errors.push('High page load time detected');
      status = status === 'healthy' ? 'degraded' : status;
    }

    if (errors.length > 2) {
      status = 'unhealthy';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        r2Connection: r2Health,
        web3forms: web3formsHealth,
        analytics: analyticsHealth,
        performance,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        r2Connection: false,
        web3forms: false,
        analytics: false,
        performance: { loadTime: Date.now() - startTime },
      },
      errors: [
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

// Error boundary for production monitoring
export class ProductionErrorBoundary extends Error {
  constructor(
    message: string,
    public readonly _context?: Record<string, any>,
    public readonly _severity: 'low' | 'medium' | 'high' = 'medium'
  ) {
    super(message);
    this.name = 'ProductionErrorBoundary';
  }
}

// Log production errors
export function logProductionError(
  error: Error,
  _context?: Record<string, any>
) {
  if (process.env.NODE_ENV !== 'production') return;

  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent:
      typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    context: _context,
  };

  // Send to external monitoring service
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry integration would go here
    console.error('Production error logged:', errorData);
  } else {
    console.error('Production error:', errorData);
  }
}

// Monitor resource usage
export function monitorResourceUsage() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production')
    return;

  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`Performance measure: ${entry.name} - ${entry.duration}ms`);
      }
    }
  });

  observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });

  // Monitor memory usage if available
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      };

      // Alert if memory usage is high
      if (memoryUsage.used > memoryUsage.limit * 0.8) {
        logProductionError(
          new ProductionErrorBoundary(
            'High memory usage detected',
            memoryUsage,
            'medium'
          )
        );
      }
    }, 30000); // Check every 30 seconds
  }
}
