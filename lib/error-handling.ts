// Network error handling utilities

export interface NetworkError extends Error {
  status?: number;
  code?: string;
  isNetworkError: boolean;
}

export class NetworkErrorHandler {
  static createNetworkError(
    message: string,
    status?: number,
    code?: string
  ): NetworkError {
    const error = new Error(message) as NetworkError;
    error.status = status;
    error.code = code;
    error.isNetworkError = true;
    return error;
  }

  static isNetworkError(error: unknown): error is NetworkError {
    return (
      error instanceof Error &&
      'isNetworkError' in error &&
      error.isNetworkError === true
    );
  }

  static getErrorMessage(error: unknown): string {
    if (this.isNetworkError(error)) {
      switch (error.status) {
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return error.message || 'Network error occurred.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred.';
  }

  static shouldRetry(error: unknown): boolean {
    if (this.isNetworkError(error)) {
      // Retry on server errors but not client errors
      return error.status ? error.status >= 500 : true;
    }
    return false;
  }
}

// Retry mechanism for network requests
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a retryable error
      if (!NetworkErrorHandler.shouldRetry(error)) {
        throw error;
      }

      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, delay * (attempt + 1))
        );
      }
    }
  }

  throw lastError;
}

// Image loading error handling
export function createImageErrorHandler(fallbackSrc?: string) {
  return (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget;

    // Prevent infinite loop if fallback also fails
    if (img.src === fallbackSrc) {
      return;
    }

    if (fallbackSrc) {
      img.src = fallbackSrc;
    } else {
      // Create a placeholder SVG
      const placeholder = `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
            Image unavailable
          </text>
        </svg>
      `)}`;
      img.src = placeholder;
    }
  };
}

// Form submission error handling
export interface FormSubmissionResult {
  success: boolean;
  error?: string;
  shouldRetry?: boolean;
}

export async function handleFormSubmission(
  submitFn: () => Promise<Response>,
  maxRetries: number = 2
): Promise<FormSubmissionResult> {
  try {
    await withRetry(async () => {
      const res = await submitFn();

      if (!res.ok) {
        throw NetworkErrorHandler.createNetworkError(
          `Form submission failed: ${res.statusText}`,
          res.status
        );
      }

      return res;
    }, maxRetries);

    return { success: true };
  } catch (error) {
    const errorMessage = NetworkErrorHandler.getErrorMessage(error);
    const shouldRetry = NetworkErrorHandler.shouldRetry(error);

    return {
      success: false,
      error: errorMessage,
      shouldRetry,
    };
  }
}

// Cloudflare service availability check
export async function checkCloudflareServices(): Promise<{
  r2Available: boolean;
  pagesAvailable: boolean;
  web3formsAvailable: boolean;
}> {
  const checks = await Promise.allSettled([
    // Check R2 by trying to load a test image
    fetch('/images/artwork-placeholder.svg', { method: 'HEAD' }),
    // Check Pages (current site)
    fetch('/api/health', { method: 'HEAD' }).catch(() =>
      // Fallback: if no health endpoint, assume pages is working since we're here
      Promise.resolve(new Response('', { status: 200 }))
    ),
    // Check Web3forms
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_key: 'test' }),
    }),
  ]);

  return {
    r2Available: checks[0].status === 'fulfilled' && checks[0].value.ok,
    pagesAvailable: checks[1].status === 'fulfilled' && checks[1].value.ok,
    web3formsAvailable: checks[2].status === 'fulfilled',
  };
}

// Graceful degradation helpers
export function createOfflineHandler() {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  return {
    isOnline,
    showOfflineMessage: !isOnline,
    getOfflineMessage: () =>
      'You appear to be offline. Some features may not work properly.',
  };
}
