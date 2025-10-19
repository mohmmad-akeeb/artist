import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-primary-400 mb-6">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5-1.709M15 11V9a6 6 0 00-12 0v2"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-primary-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-primary-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-primary-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-primary-900 text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition-colors duration-200"
          >
            Return Home
          </Link>

          <div className="text-sm text-primary-500">
            <p>Or explore:</p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <Link
                href="/work"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                Artwork
              </Link>
              <Link
                href="/about"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
