module.exports = {
  ci: {
    collect: {
      url: process.env.CI
        ? [
            // Production URLs for CI
            'https://artist-portfolio-website.pages.dev/',
            'https://artist-portfolio-website.pages.dev/about',
            'https://artist-portfolio-website.pages.dev/work',
            'https://artist-portfolio-website.pages.dev/work/A',
            'https://artist-portfolio-website.pages.dev/contact',
            'https://artist-portfolio-website.pages.dev/press',
          ]
        : [
            // Local URLs for development
            'http://localhost:3000/',
            'http://localhost:3000/about',
            'http://localhost:3000/work',
            'http://localhost:3000/work/A',
            'http://localhost:3000/contact',
            'http://localhost:3000/press',
          ],
      startServerCommand: process.env.CI ? undefined : 'npx serve out -p 3000',
      numberOfRuns: process.env.CI ? 1 : 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': 'off',

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Other important metrics
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        interactive: ['warn', { maxNumericValue: 3500 }],

        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        label: 'error',
        'link-name': 'error',

        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'robots-txt': 'off', // May not be applicable in dev

        // Best Practices
        'uses-https': 'off', // Not applicable for localhost
        'is-on-https': 'off', // Not applicable for localhost
        'uses-http2': 'off', // Not applicable for localhost

        // Performance
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'offscreen-images': 'warn',
        'render-blocking-resources': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'efficient-animated-content': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'warn',
        'uses-responsive-images': 'warn',

        // Image optimization
        'properly-size-images': 'warn',
        'legacy-javascript': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: './lighthouse-reports',
    },
  },
};
