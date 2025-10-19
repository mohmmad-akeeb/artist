import CategoryGrid from '@/components/gallery/CategoryGrid';
import { getAllCategories } from '@/lib/category-utils';
import { generateDevMockDataset } from '@/lib/mock-data';
import { GalleryErrorBoundary } from '@/components/error/ErrorBoundary';
import {
  generateWorkMetadata,
  generateCollectionStructuredData,
  generateBreadcrumbStructuredData,
  SITE_CONFIG,
} from '@/lib/seo-utils';

export const metadata = generateWorkMetadata();

export default function Work() {
  // Get mock data for development - in production this would come from your data source
  const artworks = generateDevMockDataset();
  const categories = getAllCategories(artworks);

  return (
    <div className="container-custom py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-primary-900 mb-4">
          Work
        </h1>
        <p className="text-base sm:text-lg text-primary-600 max-w-2xl mx-auto px-4">
          Explore my artistic journey through four distinct collections, each
          representing different themes and creative explorations.
        </p>
      </div>

      {/* Category Grid */}
      <GalleryErrorBoundary>
        <CategoryGrid categories={categories} />
      </GalleryErrorBoundary>

      {/* Collection Stats */}
      <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-primary-200">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-light text-primary-900 mb-4 sm:mb-6">
            Collection Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {categories.map(category => (
              <div key={category.id} className="text-center">
                <div className="text-2xl sm:text-3xl font-light text-primary-900 mb-2">
                  {category.artworkCount}
                </div>
                <div className="text-xs sm:text-sm text-primary-600">
                  {category.name}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 sm:mt-8">
            <div className="text-3xl sm:text-4xl font-light text-primary-900 mb-2">
              {categories.reduce((total, cat) => total + cat.artworkCount, 0)}
            </div>
            <div className="text-xs sm:text-sm text-primary-600">
              Total Artworks
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data - Collection Information */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCollectionStructuredData(artworks)),
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
            ])
          ),
        }}
      />
    </div>
  );
}
