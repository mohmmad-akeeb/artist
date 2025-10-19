'use client';

/* eslint-disable no-unused-vars */
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Use the parameters to satisfy linting
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-primary-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-primary-600 mb-6">
              We encountered an unexpected error. Please try refreshing the
              page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-900 text-white px-6 py-2 rounded-lg hover:bg-primary-800 transition-colors duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Gallery-specific error boundary
export function GalleryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-[300px] flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-primary-400 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary-900 mb-2">
              Gallery temporarily unavailable
            </h3>
            <p className="text-primary-600 mb-4">
              We&apos;re having trouble loading the artwork gallery.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary-600 hover:text-primary-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Form-specific error boundary
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="text-center">
            <div className="text-red-500 mb-3">
              <svg
                className="w-8 h-8 mx-auto"
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
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Form Error
            </h3>
            <p className="text-red-700 mb-4">
              The contact form encountered an error. Please try refreshing the
              page or contact me directly.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="block w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
              <a
                href="mailto:contact@elenarodriguez.art"
                className="block w-full bg-white text-red-600 px-4 py-2 rounded border border-red-300 hover:bg-red-50 transition-colors"
              >
                Email Directly
              </a>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
