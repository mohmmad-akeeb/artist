/**
 * Cloudflare R2 Diagnostics Module
 *
 * This module provides utilities for testing, validating, and debugging
 * Cloudflare R2 integration in the artist portfolio website.
 */

import { CategoryId } from './types';
import {
  getR2Config,
  validateR2Config,
  generateArtworkImageUrl,
  generateCategoryCoverUrl,
  loadImageWithRetry,
} from './cloudflare-r2';
import { loadImageSafely } from './image-utils';

/**
 * R2 diagnostic test results
 */
export interface R2DiagnosticResults {
  configValid: boolean;
  configErrors: string[];
  configWarnings: string[];
  connectivityTest: {
    success: boolean;
    error?: string;
    responseTime?: number;
  };
  imageTests: {
    category: CategoryId;
    identifier: string;
    success: boolean;
    url: string;
    error?: string;
    responseTime?: number;
  }[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallSuccess: boolean;
  };
}

/**
 * Test R2 connectivity and configuration
 */
export async function runR2Diagnostics(): Promise<R2DiagnosticResults> {
  const results: R2DiagnosticResults = {
    configValid: false,
    configErrors: [],
    configWarnings: [],
    connectivityTest: { success: false },
    imageTests: [],
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      overallSuccess: false,
    },
  };

  // Test 1: Validate configuration
  const configValidation = validateR2Config();
  results.configValid = configValidation.isValid;
  results.configErrors = configValidation.errors;
  results.configWarnings = configValidation.warnings;

  if (!configValidation.isValid) {
    console.error('R2 configuration is invalid:', configValidation.errors);
    return results;
  }

  // Test 2: Basic connectivity test
  results.summary.totalTests++;
  try {
    const startTime = performance.now();
    const testUrl = generateCategoryCoverUrl('A', 'thumbnail');

    await loadImageWithRetry(testUrl, 1, 0);

    results.connectivityTest = {
      success: true,
      responseTime: performance.now() - startTime,
    };
    results.summary.passedTests++;
  } catch (error) {
    results.connectivityTest = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    results.summary.failedTests++;
  }

  // Test 3: Test sample images from each category
  const testCases = [
    { category: 'A' as CategoryId, identifier: '1' },
    { category: 'B' as CategoryId, identifier: '1' },
    { category: 'C' as CategoryId, identifier: '1' },
    { category: 'D' as CategoryId, identifier: '1' },
    { category: 'A' as CategoryId, identifier: 'cover' },
  ];

  for (const testCase of testCases) {
    results.summary.totalTests++;

    try {
      const startTime = performance.now();
      const testUrl = generateArtworkImageUrl(
        testCase.category,
        testCase.identifier,
        'thumbnail'
      );

      const result = await loadImageSafely(testUrl, {
        maxRetries: 1,
        useFallback: false,
      });

      const testResult = {
        category: testCase.category,
        identifier: testCase.identifier,
        success: result.success,
        url: testUrl,
        responseTime: performance.now() - startTime,
        error: result.error?.message,
      };

      results.imageTests.push(testResult);

      if (result.success) {
        results.summary.passedTests++;
      } else {
        results.summary.failedTests++;
      }
    } catch (error) {
      const testResult = {
        category: testCase.category,
        identifier: testCase.identifier,
        success: false,
        url: generateArtworkImageUrl(
          testCase.category,
          testCase.identifier,
          'thumbnail'
        ),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      results.imageTests.push(testResult);
      results.summary.failedTests++;
    }
  }

  // Calculate overall success
  results.summary.overallSuccess =
    results.configValid &&
    results.connectivityTest.success &&
    results.summary.passedTests > results.summary.failedTests;

  return results;
}

/**
 * Generate R2 diagnostic report
 */
export function generateR2DiagnosticReport(
  results: R2DiagnosticResults
): string {
  const lines: string[] = [];

  lines.push('=== Cloudflare R2 Diagnostic Report ===\n');

  // Configuration status
  lines.push('Configuration Status:');
  lines.push(`  Valid: ${results.configValid ? '✅' : '❌'}`);

  if (results.configErrors.length > 0) {
    lines.push('  Errors:');
    results.configErrors.forEach(error => lines.push(`    - ${error}`));
  }

  if (results.configWarnings.length > 0) {
    lines.push('  Warnings:');
    results.configWarnings.forEach(warning => lines.push(`    - ${warning}`));
  }

  lines.push('');

  // Connectivity test
  lines.push('Connectivity Test:');
  lines.push(`  Status: ${results.connectivityTest.success ? '✅' : '❌'}`);

  if (results.connectivityTest.responseTime) {
    lines.push(
      `  Response Time: ${results.connectivityTest.responseTime.toFixed(2)}ms`
    );
  }

  if (results.connectivityTest.error) {
    lines.push(`  Error: ${results.connectivityTest.error}`);
  }

  lines.push('');

  // Image tests
  lines.push('Image Loading Tests:');
  results.imageTests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    const responseTime = test.responseTime
      ? ` (${test.responseTime.toFixed(2)}ms)`
      : '';
    lines.push(
      `  ${test.category}${test.identifier}: ${status}${responseTime}`
    );

    if (test.error) {
      lines.push(`    Error: ${test.error}`);
    }
  });

  lines.push('');

  // Summary
  lines.push('Summary:');
  lines.push(`  Total Tests: ${results.summary.totalTests}`);
  lines.push(`  Passed: ${results.summary.passedTests}`);
  lines.push(`  Failed: ${results.summary.failedTests}`);
  lines.push(
    `  Overall Status: ${results.summary.overallSuccess ? '✅ PASS' : '❌ FAIL'}`
  );

  return lines.join('\n');
}

/**
 * Log R2 diagnostic results to console
 */
export async function logR2Diagnostics(): Promise<void> {
  console.log('Running R2 diagnostics...');

  try {
    const results = await runR2Diagnostics();
    const report = generateR2DiagnosticReport(results);

    console.log(report);

    if (!results.summary.overallSuccess) {
      console.error('R2 diagnostics failed. Please check your configuration.');
    }
  } catch (error) {
    console.error('Failed to run R2 diagnostics:', error);
  }
}

/**
 * Test specific artwork image loading
 */
export async function testArtworkImage(
  category: CategoryId,
  identifier: string | number
): Promise<{
  success: boolean;
  urls: {
    thumbnail: string;
    medium: string;
    full: string;
  };
  loadingResults: {
    thumbnail: { success: boolean; error?: string };
    medium: { success: boolean; error?: string };
    full: { success: boolean; error?: string };
  };
}> {
  const urls = {
    thumbnail: generateArtworkImageUrl(category, identifier, 'thumbnail'),
    medium: generateArtworkImageUrl(category, identifier, 'medium'),
    full: generateArtworkImageUrl(category, identifier, 'full'),
  };

  const loadingResults: {
    thumbnail: { success: boolean; error?: string };
    medium: { success: boolean; error?: string };
    full: { success: boolean; error?: string };
  } = {
    thumbnail: { success: false },
    medium: { success: false },
    full: { success: false },
  };

  // Test each size
  for (const [size, url] of Object.entries(urls)) {
    try {
      const result = await loadImageSafely(url, {
        maxRetries: 1,
        useFallback: false,
      });

      loadingResults[size as keyof typeof loadingResults] = {
        success: result.success,
        error: result.error?.message,
      };
    } catch (error) {
      loadingResults[size as keyof typeof loadingResults] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  const success = Object.values(loadingResults).some(result => result.success);

  return {
    success,
    urls,
    loadingResults,
  };
}

/**
 * Get R2 configuration info for debugging
 */
export function getR2DebugInfo(): {
  config: ReturnType<typeof getR2Config>;
  validation: ReturnType<typeof validateR2Config>;
  sampleUrls: {
    artworkThumbnail: string;
    artworkMedium: string;
    artworkFull: string;
    categoryCover: string;
  };
} {
  const config = getR2Config();
  const validation = validateR2Config();

  const sampleUrls = {
    artworkThumbnail: generateArtworkImageUrl('A', '1', 'thumbnail'),
    artworkMedium: generateArtworkImageUrl('A', '1', 'medium'),
    artworkFull: generateArtworkImageUrl('A', '1', 'full'),
    categoryCover: generateCategoryCoverUrl('A', 'medium'),
  };

  return {
    config,
    validation,
    sampleUrls,
  };
}

/**
 * Development helper to run diagnostics in browser console
 */
export function runR2DiagnosticsInBrowser(): void {
  if (typeof window !== 'undefined') {
    logR2Diagnostics();
  } else {
    console.warn('R2 diagnostics can only be run in the browser');
  }
}

// Export for browser console access in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).r2Diagnostics = {
    run: runR2DiagnosticsInBrowser,
    test: testArtworkImage,
    debug: getR2DebugInfo,
  };
}
