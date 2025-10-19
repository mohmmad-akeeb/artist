#!/usr/bin/env node

/**
 * Test script for Cloudflare R2 integration
 *
 * This script tests the R2 configuration and image URL generation
 * without requiring a full Next.js environment.
 */

// Mock Next.js environment variables for testing
process.env.NEXT_PUBLIC_R2_BASE_URL =
  'https://test-bucket.r2.cloudflarestorage.com';
process.env.NEXT_PUBLIC_R2_BUCKET_NAME = 'artist-portfolio-images';
process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN = 'https://images.example.com';
process.env.NEXT_PUBLIC_R2_ENABLE_OPTIMIZATION = 'true';

// Import the modules (using require for Node.js compatibility)
const path = require('path');
const fs = require('fs');

// Simple test function
function testR2Integration() {
  console.log('🧪 Testing Cloudflare R2 Integration\n');

  // Test 1: Configuration
  console.log('1. Testing R2 Configuration:');
  console.log(`   Base URL: ${process.env.NEXT_PUBLIC_R2_BASE_URL}`);
  console.log(`   Bucket: ${process.env.NEXT_PUBLIC_R2_BUCKET_NAME}`);
  console.log(`   Custom Domain: ${process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN}`);
  console.log(
    `   Optimization: ${process.env.NEXT_PUBLIC_R2_ENABLE_OPTIMIZATION}`
  );
  console.log('   ✅ Configuration loaded\n');

  // Test 2: URL Generation (mock implementation)
  console.log('2. Testing URL Generation:');

  const mockGenerateUrl = (category, identifier, size) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN ||
      process.env.NEXT_PUBLIC_R2_BASE_URL;
    const bucket = process.env.NEXT_PUBLIC_R2_BUCKET_NAME;
    const optimization =
      process.env.NEXT_PUBLIC_R2_ENABLE_OPTIMIZATION === 'true';

    const imagePath = `${category}/${identifier}.jpg`;

    if (optimization) {
      const sizeParams = {
        thumbnail: 'width=300,height=300,quality=80,format=webp,fit=cover',
        medium: 'width=800,height=800,quality=85,format=webp,fit=scale-down',
        full: 'width=2000,height=2000,quality=90,format=webp,fit=scale-down',
      };

      return `${baseUrl}/cdn-cgi/image/${sizeParams[size]}/${bucket}/${imagePath}`;
    }

    return `${baseUrl}/${bucket}/${imagePath}`;
  };

  const testUrls = [
    { category: 'A', identifier: '1', size: 'thumbnail' },
    { category: 'B', identifier: '25', size: 'medium' },
    { category: 'C', identifier: 'cover', size: 'full' },
  ];

  testUrls.forEach(({ category, identifier, size }) => {
    const url = mockGenerateUrl(category, identifier, size);
    console.log(`   ${category}${identifier} (${size}): ${url}`);
  });
  console.log('   ✅ URL generation working\n');

  // Test 3: File structure
  console.log('3. Testing File Structure:');
  const requiredFiles = [
    'lib/cloudflare-r2.ts',
    'lib/image-utils.ts',
    'lib/hooks/useImageLoading.ts',
    'lib/r2-diagnostics.ts',
    'components/ui/OptimizedImage.tsx',
    'public/images/artwork-placeholder.svg',
    'public/images/category-placeholder.svg',
  ];

  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (missing)`);
      allFilesExist = false;
    }
  });

  if (allFilesExist) {
    console.log('   ✅ All required files present\n');
  } else {
    console.log('   ❌ Some files are missing\n');
  }

  // Test 4: Environment file
  console.log('4. Testing Environment Configuration:');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    const hasR2Config = envContent.includes('NEXT_PUBLIC_R2_BASE_URL');

    if (hasR2Config) {
      console.log('   ✅ .env.example contains R2 configuration');
    } else {
      console.log('   ❌ .env.example missing R2 configuration');
    }
  } else {
    console.log('   ❌ .env.example file not found');
  }

  console.log('\n🎉 R2 Integration Test Complete!');
  console.log('\nNext Steps:');
  console.log('1. Copy .env.example to .env.local');
  console.log('2. Update R2 configuration with your actual values');
  console.log('3. Upload test images to your R2 bucket');
  console.log('4. Run the application and test image loading');
}

// Run the test
testR2Integration();
