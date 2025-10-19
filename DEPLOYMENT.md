# Deployment Guide

This document outlines the deployment process for the Artist Portfolio Website to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account**: Ensure you have a Cloudflare account with Pages enabled
2. **Environment Variables**: Configure all required environment variables
3. **Domain Setup**: (Optional) Configure custom domain for production

## Environment Variables

### Required Variables

Set these in your Cloudflare Pages dashboard under Settings > Environment Variables:

```bash
# Web3forms Configuration
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your_web3forms_access_key

# Cloudflare R2 Configuration
NEXT_PUBLIC_R2_BASE_URL=https://your-bucket.r2.cloudflarestorage.com
NEXT_PUBLIC_R2_BUCKET_NAME=artist-portfolio-images
NEXT_PUBLIC_R2_CUSTOM_DOMAIN=https://images.yourdomain.com

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your_google_analytics_id
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### GitHub Secrets (for CI/CD)

If using GitHub Actions, set these secrets in your repository:

```bash
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
R2_BASE_URL=https://your-bucket.r2.cloudflarestorage.com
R2_BUCKET_NAME=artist-portfolio-images
R2_CUSTOM_DOMAIN=https://images.yourdomain.com
ANALYTICS_ID=your_google_analytics_id
LHCI_GITHUB_APP_TOKEN=your_lighthouse_ci_token
```

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)

1. **Connect Repository**: Link your GitHub repository to Cloudflare Pages
2. **Configure Build Settings**:
   - Build command: `npm run build:production`
   - Build output directory: `out`
   - Root directory: `/`
   - Node.js version: `18`

3. **Set Environment Variables**: Add all required environment variables in the Cloudflare Pages dashboard

4. **Deploy**: Push to main branch to trigger automatic deployment

### Method 2: Manual Deployment

1. **Build Locally**:

   ```bash
   npm ci
   npm run build:production
   ```

2. **Deploy with Wrangler**:

   ```bash
   npx wrangler pages deploy out --project-name=artist-portfolio-website
   ```

3. **Production Deployment**:
   ```bash
   ./scripts/deploy-production.sh
   ```

### Method 3: GitHub Actions (CI/CD)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Runs tests and linting
2. Builds the application
3. Runs Lighthouse CI for performance validation
4. Deploys to Cloudflare Pages
5. Provides preview deployments for pull requests

## Build Configuration

### Next.js Configuration

The `next.config.js` file is optimized for production with:

- Static export generation
- Image optimization settings
- Security headers
- Performance optimizations
- Bundle analysis (when enabled)

### Cloudflare Pages Configuration

The deployment uses multiple configuration files for optimal performance:

- **wrangler.toml**: Build settings and Cloudflare-specific configuration
- **\_headers**: HTTP headers for caching, security, and optimization (replaces Next.js headers() in static export mode)
- **\_redirects**: URL redirects for SEO and routing (replaces Next.js redirects() in static export mode)

Note: When using `output: 'export'` in Next.js, custom headers and redirects must be handled by the hosting platform (Cloudflare Pages) rather than Next.js itself.

## Performance Optimization

### Caching Strategy

- **Static Assets**: 1 year cache with immutable flag
- **HTML Pages**: 1 hour cache with CDN revalidation
- **API Routes**: 5 minutes cache with CDN optimization
- **Images**: 1 year cache with optimization

### CDN Configuration

Cloudflare Pages automatically provides:

- Global CDN distribution
- Automatic HTTPS
- HTTP/2 and HTTP/3 support
- Brotli compression
- Image optimization (when configured)

## Monitoring and Analytics

### Health Checks

The application includes a health check endpoint at `/api/health` that monitors:

- Application status
- R2 storage connectivity
- Web3forms service availability
- Response times
- Environment configuration

### Performance Monitoring

- **Lighthouse CI**: Automated performance testing
- **Core Web Vitals**: Real user monitoring
- **Google Analytics**: User behavior tracking
- **Error Tracking**: Production error monitoring

### Monitoring URLs

- Health Check: `https://yourdomain.com/api/health`
- Lighthouse Reports: Available in CI/CD pipeline
- Analytics Dashboard: Google Analytics (if configured)

## Custom Domain Setup

### DNS Configuration

1. **Add CNAME Record**:

   ```
   Type: CNAME
   Name: www (or @)
   Target: artist-portfolio-website.pages.dev
   ```

2. **Configure in Cloudflare Pages**:
   - Go to Pages > Your Project > Custom Domains
   - Add your domain
   - Verify DNS configuration

### SSL/TLS Configuration

Cloudflare automatically provides SSL certificates for custom domains.

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables are set correctly
   - Verify Node.js version (should be 18+)
   - Check for TypeScript errors

2. **Headers/Redirects Not Working**:
   - Ensure `_headers` and `_redirects` files are in the root directory
   - Verify Cloudflare Pages is processing these files correctly
   - Check that `output: 'export'` is set in next.config.js (headers/redirects handled by Cloudflare)

3. **Image Loading Issues**:
   - Verify R2 bucket configuration
   - Check CORS settings on R2 bucket
   - Ensure custom domain is properly configured

4. **Form Submission Issues**:
   - Verify Web3forms access key
   - Check CORS configuration
   - Ensure form validation is working

### Debug Commands

```bash
# Check build locally
npm run build:production

# Analyze bundle size
npm run build:analyze

# Run health checks
curl https://yourdomain.com/api/health

# Test Lighthouse performance
npm run lighthouse
```

### Logs and Debugging

- **Cloudflare Pages Logs**: Available in the Pages dashboard
- **Function Logs**: Check Functions tab for API route logs
- **Analytics**: Monitor real user metrics in dashboard

## Security Considerations

### Headers Configuration

The application includes security headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Content Security Policy

CSP is configured for form submissions and external resources.

### Environment Variables

- Never commit sensitive keys to version control
- Use Cloudflare Pages environment variables for secrets
- Rotate API keys regularly

## Rollback Procedure

### Automatic Rollback

Cloudflare Pages maintains deployment history:

1. Go to Pages > Your Project > Deployments
2. Select a previous successful deployment
3. Click "Rollback to this deployment"

### Manual Rollback

```bash
# Deploy a specific commit
git checkout <previous-commit-hash>
npm run build:production
npx wrangler pages deploy out --project-name=artist-portfolio-website
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Update Dependencies**: Monthly security updates
2. **Performance Review**: Weekly Lighthouse CI reports
3. **Health Check Monitoring**: Daily health endpoint checks
4. **Analytics Review**: Monthly performance and user behavior analysis

### Monitoring Checklist

- [ ] Health check endpoint responding
- [ ] All images loading correctly
- [ ] Contact form working
- [ ] Performance metrics within targets
- [ ] No JavaScript errors in production
- [ ] SSL certificate valid
- [ ] CDN cache hit rates optimal

For additional support, refer to:

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Web3forms Documentation](https://web3forms.com/docs)
