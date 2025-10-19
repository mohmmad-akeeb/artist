'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);

    // Delay content update to allow exit animation
    const contentTimer = setTimeout(() => {
      setDisplayChildren(children);
    }, 100);

    // Complete transition
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(loadingTimer);
    };
  }, [pathname, children]);

  return (
    <>
      {/* Enhanced loading overlay with gradient */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
          isLoading
            ? 'opacity-100 backdrop-blur-sm'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/50 to-white" />

        {/* Loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced page content with stagger animation */}
      <div
        className={`transition-all duration-500 ease-out ${
          isLoading
            ? 'opacity-0 translate-y-4 scale-[0.98]'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <div
          className={`transition-all duration-300 delay-100 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {displayChildren}
        </div>
      </div>
    </>
  );
}
