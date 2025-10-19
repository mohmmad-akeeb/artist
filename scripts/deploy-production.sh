#!/bin/bash

# Production deployment script for Cloudflare Pages
set -e

echo "🚀 Starting production deployment..."

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ Error: CLOUDFLARE_API_TOKEN is not set"
  exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "❌ Error: CLOUDFLARE_ACCOUNT_ID is not set"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting and tests
echo "🔍 Running linting..."
npm run lint

echo "🧪 Running tests..."
npm run test:run

# Build the application
echo "🏗️  Building application for production..."
NODE_ENV=production npm run build

# Run Lighthouse CI for performance validation
echo "🔍 Running Lighthouse CI..."
npm run lighthouse:ci

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
npx wrangler pages deploy out --project-name=artist-portfolio-website --env=production

echo "✅ Production deployment completed successfully!"
echo "🌍 Your site should be available at: https://artist-portfolio-website.pages.dev"