import Link from 'next/link';
import {
  generatePressMetadata,
  generateBreadcrumbStructuredData,
  SITE_CONFIG,
} from '@/lib/seo-utils';

export const metadata = generatePressMetadata();

export default function Press() {
  return (
    <div className="container-custom py-8 sm:py-12 lg:py-20">
      {/* Page Header */}
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-primary-900 mb-4 sm:mb-6">
          Press & Media
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-primary-600 max-w-3xl mx-auto leading-relaxed px-4">
          Discover media coverage, exhibitions, and press features highlighting
          Prof. Zargar Zahoor&apos;s contemporary artwork and artistic journey.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
        {/* Recent Features Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-light text-primary-900 mb-6 sm:mb-8">
            Recent Features
          </h2>
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white border border-primary-200 rounded-lg p-6 sm:p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-medium text-primary-900 mb-2 sm:mb-0">
                  Contemporary Art Review Magazine
                </h3>
                <span className="text-sm text-primary-500 font-medium">
                  March 2024
                </span>
              </div>
              <p className="text-primary-700 mb-4 leading-relaxed">
                &ldquo;Prof. Zargar Zahoor&apos;s latest collection demonstrates
                a masterful understanding of minimalist principles while
                maintaining emotional depth that resonates with contemporary
                audiences.&rdquo;
              </p>
              <div className="flex items-center text-sm text-primary-600">
                <span className="mr-2">Featured Article:</span>
                <span className="italic">
                  &ldquo;The Quiet Revolution: Minimalism in Modern Art&rdquo;
                </span>
              </div>
            </div>

            <div className="bg-white border border-primary-200 rounded-lg p-6 sm:p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-medium text-primary-900 mb-2 sm:mb-0">
                  Seattle Arts Weekly
                </h3>
                <span className="text-sm text-primary-500 font-medium">
                  January 2024
                </span>
              </div>
              <p className="text-primary-700 mb-4 leading-relaxed">
                Profile feature highlighting Elena&apos;s artistic process and
                the inspiration behind her four distinct collection categories.
              </p>
              <div className="flex items-center text-sm text-primary-600">
                <span className="mr-2">Article:</span>
                <span className="italic">
                  &ldquo;Local Artist Finds Beauty in Simplicity&rdquo;
                </span>
              </div>
            </div>

            <div className="text-center py-6">
              <p className="text-primary-600 italic">
                Additional press coverage and features will be added as they
                become available.
              </p>
            </div>
          </div>
        </section>

        {/* Exhibitions Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-light text-primary-900 mb-6 sm:mb-8">
            Exhibitions & Shows
          </h2>
          <div className="space-y-6 sm:space-y-8">
            {/* Upcoming Exhibitions */}
            <div>
              <h3 className="text-xl sm:text-2xl font-light text-primary-800 mb-4 sm:mb-6">
                Upcoming
              </h3>
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <h4 className="text-lg font-medium text-primary-900 mb-2 sm:mb-0">
                    &ldquo;Contemplative Spaces&rdquo; Group Exhibition
                  </h4>
                  <span className="text-sm text-accent-700 font-medium bg-accent-100 px-3 py-1 rounded-full">
                    Opening Fall 2024
                  </span>
                </div>
                <p className="text-primary-700 mb-3">
                  Pacific Northwest Contemporary Gallery, Seattle
                </p>
                <p className="text-sm text-primary-600 leading-relaxed">
                  A curated group exhibition featuring contemporary artists
                  exploring themes of mindfulness and contemplation through
                  minimalist approaches.
                </p>
              </div>
            </div>

            {/* Past Exhibitions */}
            <div>
              <h3 className="text-xl sm:text-2xl font-light text-primary-800 mb-4 sm:mb-6">
                Past Exhibitions
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-primary-300 pl-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                    <h4 className="text-lg font-medium text-primary-900">
                      Solo Exhibition: &ldquo;Quiet Moments&rdquo;
                    </h4>
                    <span className="text-sm text-primary-500">2023</span>
                  </div>
                  <p className="text-primary-700 mb-2">
                    Meridian Gallery, San Francisco
                  </p>
                  <p className="text-sm text-primary-600">
                    A comprehensive showcase of Elena&apos;s work spanning three
                    years of artistic development.
                  </p>
                </div>

                <div className="border-l-4 border-primary-300 pl-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                    <h4 className="text-lg font-medium text-primary-900">
                      &ldquo;Emerging Voices&rdquo; Group Show
                    </h4>
                    <span className="text-sm text-primary-500">2022</span>
                  </div>
                  <p className="text-primary-700 mb-2">
                    Contemporary Art Museum, Portland
                  </p>
                  <p className="text-sm text-primary-600">
                    Featured alongside twelve other Pacific Northwest artists in
                    this juried exhibition.
                  </p>
                </div>

                <div className="border-l-4 border-primary-300 pl-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                    <h4 className="text-lg font-medium text-primary-900">
                      MFA Thesis Exhibition
                    </h4>
                    <span className="text-sm text-primary-500">2021</span>
                  </div>
                  <p className="text-primary-700 mb-2">
                    University of Washington, Seattle
                  </p>
                  <p className="text-sm text-primary-600">
                    Graduate thesis exhibition exploring the intersection of
                    minimalism and emotional expression.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Awards & Recognition Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-light text-primary-900 mb-6 sm:mb-8">
            Awards & Recognition
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                Seattle Arts Commission Grant
              </h3>
              <p className="text-primary-600 mb-3">2023</p>
              <p className="text-sm text-primary-700">
                Awarded for excellence in contemporary painting and contribution
                to the local arts community.
              </p>
            </div>

            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                Emerging Artist Fellowship
              </h3>
              <p className="text-primary-600 mb-3">2022</p>
              <p className="text-sm text-primary-700">
                Pacific Northwest Arts Foundation recognition for innovative
                approach to minimalist painting.
              </p>
            </div>
          </div>
        </section>

        {/* Media Resources Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-light text-primary-900 mb-6 sm:mb-8">
            Media Resources
          </h2>
          <div className="bg-primary-50 rounded-lg p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-lg font-medium text-primary-900 mb-4">
                  Press Kit
                </h3>
                <ul className="space-y-2 text-sm text-primary-700">
                  <li>• High-resolution artist photographs</li>
                  <li>• Artwork images for publication</li>
                  <li>• Artist biography and statement</li>
                  <li>• Exhibition history and CV</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-primary-900 mb-4">
                  Interview Availability
                </h3>
                <ul className="space-y-2 text-sm text-primary-700">
                  <li>• In-person interviews (Seattle area)</li>
                  <li>• Virtual interviews via video call</li>
                  <li>• Written Q&A responses</li>
                  <li>• Studio visits by appointment</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Media Inquiries Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-light text-primary-900 mb-6 sm:mb-8">
            Media Inquiries
          </h2>
          <div className="bg-white border border-primary-200 rounded-lg p-6 sm:p-8 text-center">
            <p className="text-primary-700 mb-6 leading-relaxed">
              For press inquiries, interview requests, high-resolution images,
              or additional information about Prof. Zargar Zahoor and his work,
              please get in touch.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-primary-900 text-white font-medium rounded-lg hover:bg-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Contact for Press Inquiries
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <p className="text-sm text-primary-600 mt-4">
              Response time: Usually within 24 hours
            </p>
          </div>
        </section>
      </div>

      {/* Structured Data - Breadcrumb Navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbStructuredData([
              { name: 'Home', url: SITE_CONFIG.url },
              { name: 'Press', url: `${SITE_CONFIG.url}/press` },
            ])
          ),
        }}
      />
    </div>
  );
}
