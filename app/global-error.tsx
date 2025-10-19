'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
          <div className="text-center max-w-md">
            <div className="text-red-500 mb-6">
              <svg
                className="w-20 h-20 mx-auto"
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

            <h1 className="text-2xl font-bold text-primary-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-primary-600 mb-8">
              We encountered an unexpected error. This has been logged and
              we&apos;ll look into it.
            </p>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full bg-primary-900 text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition-colors duration-200"
              >
                Try Again
              </button>

              <a
                href="/"
                className="block w-full bg-white text-primary-900 px-6 py-3 rounded-lg border border-primary-300 hover:bg-primary-50 transition-colors duration-200"
              >
                Return Home
              </a>

              <div className="text-sm text-primary-500 mt-6">
                <p>If this problem persists, please contact:</p>
                <a
                  href="mailto:contact@elenarodriguez.art"
                  className="text-primary-600 hover:text-primary-800 underline"
                >
                  contact@elenarodriguez.art
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
