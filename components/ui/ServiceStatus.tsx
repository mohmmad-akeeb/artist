'use client';

import { useState, useEffect } from 'react';
import {
  checkCloudflareServices,
  createOfflineHandler,
} from '@/lib/error-handling';

interface ServiceStatusProps {
  showDetails?: boolean;
}

export default function ServiceStatus({
  showDetails = false,
}: ServiceStatusProps) {
  const [services, setServices] = useState({
    r2Available: true,
    pagesAvailable: true,
    web3formsAvailable: true,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    // Check service availability periodically
    const checkServices = async () => {
      if (!isOnline) return;

      setIsChecking(true);
      try {
        const status = await checkCloudflareServices();
        setServices(status);
      } catch (error) {
        console.warn('Service check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkServices();

    // Check every 5 minutes
    const interval = setInterval(checkServices, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const hasIssues =
    !isOnline || !services.r2Available || !services.web3formsAvailable;

  if (!hasIssues && !showDetails) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOnline && (
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg mb-2 max-w-sm">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
              />
            </svg>
            <div>
              <p className="font-medium text-sm">You&apos;re offline</p>
              <p className="text-xs opacity-90">Some features may not work</p>
            </div>
          </div>
        </div>
      )}

      {isOnline && !services.r2Available && (
        <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg mb-2 max-w-sm">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="font-medium text-sm">Image service degraded</p>
              <p className="text-xs opacity-90">Some images may not load</p>
            </div>
          </div>
        </div>
      )}

      {isOnline && !services.web3formsAvailable && (
        <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg mb-2 max-w-sm">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="font-medium text-sm">Contact form unavailable</p>
              <p className="text-xs opacity-90">
                <a
                  href="mailto:contact@elenarodriguez.art"
                  className="underline hover:no-underline"
                >
                  Email directly
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {showDetails && isOnline && (
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700 transition-colors"
          disabled={isChecking}
        >
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      )}
    </div>
  );
}

// Simplified offline indicator
export function OfflineIndicator() {
  const { isOnline, getOfflineMessage } = createOfflineHandler();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isOnline) {
    return null;
  }

  return (
    <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
      {getOfflineMessage()}
    </div>
  );
}
