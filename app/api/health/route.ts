import { NextResponse } from 'next/server';

// Health check for R2 connectivity
async function checkR2Health(): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_R2_BASE_URL) return false;

    // Try to fetch a small test file or make a HEAD request
    const testUrl = `${process.env.NEXT_PUBLIC_R2_BASE_URL}/health-check.txt`;
    const response = await fetch(testUrl, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('R2 health check failed:', error);
    return false;
  }
}

// Health check for Web3forms
async function checkWeb3formsHealth(): Promise<boolean> {
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'OPTIONS',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok || response.status === 405; // 405 is expected for OPTIONS
  } catch (error) {
    console.warn('Web3forms health check failed:', error);
    return false;
  }
}

export async function GET() {
  try {
    const startTime = Date.now();

    // Run health checks in parallel
    const [r2Health, web3formsHealth] = await Promise.allSettled([
      checkR2Health(),
      checkWeb3formsHealth(),
    ]);

    const responseTime = Date.now() - startTime;

    // Determine service statuses
    const r2Status = r2Health.status === 'fulfilled' && r2Health.value;
    const web3formsStatus =
      web3formsHealth.status === 'fulfilled' && web3formsHealth.value;

    // Determine overall status
    let overallStatus = 'healthy';
    const issues: string[] = [];

    if (!r2Status) {
      issues.push('R2 storage connectivity issues');
      overallStatus = 'degraded';
    }

    if (!web3formsStatus) {
      issues.push('Web3forms service unavailable');
      overallStatus = 'degraded';
    }

    if (responseTime > 10000) {
      issues.push('High response time detected');
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
    }

    if (issues.length > 1) {
      overallStatus = 'unhealthy';
    }

    const healthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        app: 'healthy',
        r2Storage: r2Status ? 'healthy' : 'unhealthy',
        web3forms: web3formsStatus ? 'healthy' : 'unhealthy',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasR2Config: !!process.env.NEXT_PUBLIC_R2_BASE_URL,
        hasWeb3formsConfig: !!process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
        hasAnalyticsConfig: !!process.env.NEXT_PUBLIC_ANALYTICS_ID,
      },
      ...(issues.length > 0 && { issues }),
    };

    const statusCode =
      overallStatus === 'healthy'
        ? 200
        : overallStatus === 'degraded'
          ? 200
          : 503;

    return NextResponse.json(healthStatus, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          app: 'unhealthy',
          r2Storage: 'unknown',
          web3forms: 'unknown',
        },
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}

export async function HEAD() {
  // Simple HEAD request for basic availability check
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
