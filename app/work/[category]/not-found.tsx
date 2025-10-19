import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Category Not Found',
  description: 'The artwork category you are looking for could not be found.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CategoryNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-primary-400 mb-6">
          <svg
            className="w-20 h-20 mx-auto"
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

        <h1 className="text-3xl font-bold text-primary-900 mb-4">
          Category Not Found
        </h1>
        <p className="text-primary-600 mb-8">
          The artwork category you&apos;re looking for doesn&apos;t exist or is
          currently unavailable.
        </p>

        <div className="space-y-4">
          <Link
            href="/work"
            className="inline-block bg-primary-900 text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition-colors duration-200"
          >
            Browse All Categories
          </Link>

          <div className="text-sm text-primary-500">
            <p>Available categories:</p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <Link
                href="/work/A"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                Category A
              </Link>
              <Link
                href="/work/B"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                Category B
              </Link>
              <Link
                href="/work/C"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                Category C
              </Link>
              <Link
                href="/work/D"
                className="text-primary-600 hover:text-primary-800 underline"
              >
                Category D
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
