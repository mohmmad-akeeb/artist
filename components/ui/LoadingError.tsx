'use client';

import { useState } from 'react';

interface LoadingErrorProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  type?: 'gallery' | 'form' | 'general';
}

export default function LoadingError({
  message,
  onRetry,
  showRetry = true,
  type = 'general',
}: LoadingErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'gallery':
        return 'Unable to load artwork gallery. Please check your connection and try again.';
      case 'form':
        return 'Unable to load the contact form. Please try refreshing the page.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'gallery':
        return (
          <svg
            className="w-12 h-12 text-primary-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'form':
        return (
          <svg
            className="w-12 h-12 text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5-1.709M15 11V9a6 6 0 00-12 0v2"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-12 h-12 text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="mb-4">{getIcon()}</div>

      <h3 className="text-lg font-medium text-primary-900 mb-2">
        {type === 'gallery'
          ? 'Gallery Unavailable'
          : type === 'form'
            ? 'Form Error'
            : 'Error'}
      </h3>

      <p className="text-primary-600 mb-6 max-w-md">
        {message || getDefaultMessage()}
      </p>

      {showRetry && onRetry && (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="bg-primary-900 text-white px-6 py-2 rounded-lg hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isRetrying ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Retrying...
            </span>
          ) : (
            'Try Again'
          )}
        </button>
      )}

      {type === 'form' && (
        <div className="mt-4 text-sm text-primary-500">
          <p>Alternative contact methods:</p>
          <a
            href="mailto:contact@elenarodriguez.art"
            className="text-primary-600 hover:text-primary-800 underline"
          >
            contact@elenarodriguez.art
          </a>
        </div>
      )}
    </div>
  );
}

// Specialized loading error for network issues
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <LoadingError
      message="Network connection error. Please check your internet connection and try again."
      onRetry={onRetry}
      type="general"
    />
  );
}

// Specialized loading error for service unavailable
export function ServiceUnavailableError({
  service,
  onRetry,
}: {
  service: string;
  onRetry?: () => void;
}) {
  return (
    <LoadingError
      message={`${service} is temporarily unavailable. Please try again later.`}
      onRetry={onRetry}
      type="general"
    />
  );
}
