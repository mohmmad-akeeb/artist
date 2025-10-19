import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import CartIndicator from '@/components/ui/CartIndicator';
import ImageModalProvider from '@/components/ui/ImageModalProvider';

import CriticalImagePreloader from '@/components/ui/CriticalImagePreloader';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import ServiceStatus from '@/components/ui/ServiceStatus';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Elena Rodriguez - Contemporary Artist',
    template: '%s | Elena Rodriguez Art',
  },
  description:
    'Discover the contemporary artwork of Elena Rodriguez. Explore a collection of over 1500 paintings across four distinct categories.',
  keywords: [
    'Elena Rodriguez',
    'contemporary art',
    'paintings',
    'artist portfolio',
    'fine art',
    'abstract art',
  ],
  authors: [{ name: 'Elena Rodriguez' }],
  creator: 'Elena Rodriguez',
  publisher: 'Elena Rodriguez Art',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://elenarodriguez.art'
  ),
  alternates: {
    canonical: '/',
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
    // bing: 'your-bing-verification-code',
  },
  category: 'Art & Culture',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/images/landing-background.svg"
          as="image"
          type="image/svg+xml"
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AnalyticsProvider>
          <ErrorBoundary>
            <Navigation />
            <PageTransition>
              <main className="flex-1 pt-16">{children}</main>
            </PageTransition>
            <Footer />
            <CartIndicator />
            <ImageModalProvider />
            <CriticalImagePreloader />
            <ServiceStatus />
          </ErrorBoundary>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
