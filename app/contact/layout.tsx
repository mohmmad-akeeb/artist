import {
  generateContactMetadata,
  generateBreadcrumbStructuredData,
  SITE_CONFIG,
} from '@/lib/seo-utils';

export const metadata = generateContactMetadata();

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* Structured Data - Breadcrumb Navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbStructuredData([
              { name: 'Home', url: SITE_CONFIG.url },
              { name: 'Contact', url: `${SITE_CONFIG.url}/contact` },
            ])
          ),
        }}
      />
    </>
  );
}
