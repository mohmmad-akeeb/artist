import Image from 'next/image';
import {
  generateAboutMetadata,
  generateArtistStructuredData,
  generateBreadcrumbStructuredData,
  SITE_CONFIG,
} from '@/lib/seo-utils';

export const metadata = generateAboutMetadata();

export default function About() {
  return (
    <div className="container-custom py-8 sm:py-12 lg:py-20">
      {/* Page Title - Hidden on larger screens as content speaks for itself */}
      <h1 className="sr-only">About Elena Rodriguez</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-start">
        {/* Artist Image - Left side on desktop, top on mobile */}
        <div className="relative">
          <div className="aspect-[4/5] relative overflow-hidden rounded-lg shadow-soft">
            <Image
              src="/images/artist-photo-placeholder.svg"
              alt="Elena Rodriguez, contemporary artist, in her studio surrounded by her minimalist paintings"
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
            />
          </div>
        </div>

        {/* About Content - Right side on desktop, bottom on mobile */}
        <div className="space-y-4 sm:space-y-6 lg:pt-8">
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-primary-900 leading-tight">
              Elena Rodriguez
            </h2>
            <p className="text-base sm:text-lg text-primary-600 font-light">
              Contemporary Artist
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 text-primary-700 leading-relaxed text-sm sm:text-base">
            <p className="text-base sm:text-lg">
              Elena Rodriguez is a contemporary artist whose minimalist approach
              to painting explores the delicate interplay between light, space,
              and human emotion. Her work invites viewers into contemplative
              spaces where simplicity reveals profound depth.
            </p>

            <p>
              Born and raised in the Pacific Northwest, Elena draws inspiration
              from the region&apos;s natural landscapes and the subtle shifts in
              light that define its seasons. Her artistic journey began with
              traditional representational work, but over the years, she has
              evolved toward an increasingly abstract vocabulary that distills
              experience to its essential elements.
            </p>

            <p>
              Working primarily in oils and mixed media, Elena&apos;s paintings
              are characterized by their restrained color palettes, gestural
              brushwork, and careful attention to texture and surface. Each
              piece emerges from a meditative process of layering and reduction,
              where the artist seeks to capture fleeting moments of clarity and
              connection.
            </p>

            <p>
              Her work has been exhibited in galleries across the United States
              and is held in private collections internationally. Elena
              continues to work from her studio in Seattle, where she divides
              her time between creating new work and teaching workshops on
              contemplative art practices.
            </p>

            <blockquote className="border-l-4 border-accent-300 pl-4 sm:pl-6 italic text-primary-600 my-6 sm:my-8 text-sm sm:text-base">
              &ldquo;I believe that in our increasingly complex world, there is
              profound power in simplicity. My paintings are invitations to
              pause, to breathe, and to find moments of stillness within
              ourselves.&rdquo;
            </blockquote>

            <div className="pt-4">
              <h3 className="text-lg sm:text-xl font-medium text-primary-900 mb-3">
                Education & Recognition
              </h3>
              <ul className="space-y-2 text-primary-600 text-sm sm:text-base">
                <li>• MFA in Painting, University of Washington (2015)</li>
                <li>
                  • BFA in Fine Arts, Pacific Northwest College of Art (2012)
                </li>
                <li>• Seattle Arts Commission Grant Recipient (2020)</li>
                <li>• Featured in Contemporary Art Review Magazine (2021)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data - Artist Profile */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArtistStructuredData()),
        }}
      />

      {/* Structured Data - Breadcrumb Navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbStructuredData([
              { name: 'Home', url: SITE_CONFIG.url },
              { name: 'About', url: `${SITE_CONFIG.url}/about` },
            ])
          ),
        }}
      />
    </div>
  );
}
