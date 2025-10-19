import LandingHero from '@/components/ui/LandingHero';
import {
  generateHomeMetadata,
  generateArtistStructuredData,
  generateWebsiteStructuredData,
} from '@/lib/seo-utils';

export const metadata = generateHomeMetadata();

export default function Home() {
  return (
    <>
      <LandingHero />

      {/* Structured Data - Artist Information */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArtistStructuredData()),
        }}
      />

      {/* Structured Data - Website Information */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebsiteStructuredData()),
        }}
      />
    </>
  );
}
