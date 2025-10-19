import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CategoryId } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/artwork-data';
import { generateDevMockDataset } from '@/lib/mock-data';
import { filterArtworksByCategory, sortArtworksById } from '@/lib/artwork-data';
import ImageGrid from '@/components/gallery/ImageGrid';
import { GalleryErrorBoundary } from '@/components/error/ErrorBoundary';
import {
  generateCategoryMetadata,
  generateCategoryStructuredData,
  generateBreadcrumbStructuredData,
  SITE_CONFIG,
} from '@/lib/seo-utils';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

// Valid categories for type checking
const VALID_CATEGORIES = ['a', 'b', 'c', 'd'] as const;

function isValidCategory(category: string): category is Lowercase<CategoryId> {
  return VALID_CATEGORIES.includes(category as any);
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = params;

  if (!isValidCategory(category)) {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryId = category.toUpperCase() as CategoryId;

  // Get artwork count for this category
  const allArtworks = generateDevMockDataset();
  const categoryArtworks = filterArtworksByCategory(allArtworks, categoryId);

  return generateCategoryMetadata(categoryId, categoryArtworks.length);
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;

  // Validate category parameter
  if (!isValidCategory(category)) {
    notFound();
  }

  const categoryId = category.toUpperCase() as CategoryId;
  const categoryConfig = CATEGORY_CONFIG[categoryId];

  // Get artwork data - in production this would come from your data source
  const allArtworks = generateDevMockDataset();
  const categoryArtworks = sortArtworksById(
    filterArtworksByCategory(allArtworks, categoryId)
  );

  return (
    <div className="container-custom py-8 sm:py-12">
      {/* Category Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-primary-900 mb-4">
          {categoryConfig.name}
        </h1>
        <p className="text-base sm:text-lg text-primary-600 max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
          {categoryConfig.description}
        </p>
        <div className="text-xs sm:text-sm text-primary-500">
          {categoryArtworks.length}{' '}
          {categoryArtworks.length === 1 ? 'piece' : 'pieces'}
        </div>
      </div>

      {/* Image Grid */}
      <GalleryErrorBoundary>
        <ImageGrid artworks={categoryArtworks} />
      </GalleryErrorBoundary>

      {/* Back to Work Navigation */}
      <div className="mt-12 sm:mt-16 text-center">
        <a
          href="/work/"
          className="inline-flex items-center text-primary-600 hover:text-primary-800 active:text-primary-700 transition-colors duration-200 touch-target py-2 px-4 -mx-4"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to All Categories
        </a>
      </div>

      {/* Structured Data - Category Collection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateCategoryStructuredData(categoryId, categoryArtworks)
          ),
        }}
      />

      {/* Structured Data - Breadcrumb Navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbStructuredData([
              { name: 'Home', url: SITE_CONFIG.url },
              { name: 'Work', url: `${SITE_CONFIG.url}/work/` },
              {
                name: categoryConfig.name,
                url: `${SITE_CONFIG.url}/work/${category}/`,
              },
            ])
          ),
        }}
      />
    </div>
  );
}

// Generate static params for all categories at build time
export function generateStaticParams() {
  return VALID_CATEGORIES.map(category => ({
    category,
  }));
}
