/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Image optimization configuration
  images: {
    // Disable Next.js Image Optimization for static exports
    unoptimized: true,
    // Configure domains for Cloudflare R2
    domains: [
      'your-bucket.r2.cloudflarestorage.com',
      'pub-123456789.r2.dev',
      'images.example.com', // Custom domain placeholder
    ],
    // Add remote patterns for more flexible domain matching
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.example.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable blur placeholder support
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable static exports for better performance
  output: 'export',
  trailingSlash: true,

  // Optimize for Cloudflare Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // Performance optimizations
  experimental: {
    // Note: optimizeCss requires critters package and may cause issues in development
    // optimizeCss: process.env.NODE_ENV === 'production',
    optimizePackageImports: ['react', 'react-dom', 'zustand'],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: config => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      );
      return config;
    },
  }),

  // Note: headers() and redirects() are not supported with output: 'export'
  // These are handled by Cloudflare Pages via _headers and _redirects files
  // Security headers and redirects are configured in:
  // - _headers file for HTTP headers
  // - _redirects file for URL redirects
  // - wrangler.toml for additional Cloudflare-specific configuration
};

module.exports = nextConfig;
