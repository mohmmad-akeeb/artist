'use client';

interface SkeletonLoaderProps {
  /** Type of skeleton to display */
  variant?: 'image' | 'text' | 'card' | 'grid' | 'category';
  /** Number of skeleton items to show */
  count?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show animated shimmer effect */
  animated?: boolean;
}

export default function SkeletonLoader({
  variant = 'image',
  count = 1,
  className = '',
  animated = true,
}: SkeletonLoaderProps) {
  const shimmerClass = animated
    ? 'animate-pulse bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100 bg-[length:200%_100%]'
    : 'bg-primary-200';

  const renderSkeleton = () => {
    switch (variant) {
      case 'image':
        return (
          <div
            className={`aspect-square rounded-lg ${shimmerClass} ${className}`}
          >
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            <div className={`h-4 rounded ${shimmerClass} w-3/4`} />
            <div className={`h-4 rounded ${shimmerClass} w-1/2`} />
            <div className={`h-4 rounded ${shimmerClass} w-5/6`} />
          </div>
        );

      case 'card':
        return (
          <div className={`rounded-lg overflow-hidden ${className}`}>
            <div className={`aspect-square ${shimmerClass}`} />
            <div className="p-3 space-y-2">
              <div className={`h-4 rounded ${shimmerClass} w-3/4`} />
              <div className={`h-3 rounded ${shimmerClass} w-1/2`} />
            </div>
          </div>
        );

      case 'category':
        return (
          <div
            className={`aspect-square rounded-lg overflow-hidden ${className}`}
          >
            <div className={`w-full h-full ${shimmerClass} relative`}>
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="h-6 bg-white/20 rounded w-2/3" />
                <div className="h-4 bg-white/15 rounded w-1/2" />
              </div>
            </div>
          </div>
        );

      case 'grid':
        return (
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 ${className}`}
          >
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg ${shimmerClass}`}
              />
            ))}
          </div>
        );

      default:
        return <div className={`h-20 rounded ${shimmerClass} ${className}`} />;
    }
  };

  if (variant === 'grid') {
    return renderSkeleton();
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
}

// Specialized skeleton components for common use cases
export function ImageSkeleton({
  className = '',
  animated = true,
}: Pick<SkeletonLoaderProps, 'className' | 'animated'>) {
  return (
    <SkeletonLoader variant="image" className={className} animated={animated} />
  );
}

export function TextSkeleton({
  className = '',
  animated = true,
}: Pick<SkeletonLoaderProps, 'className' | 'animated'>) {
  return (
    <SkeletonLoader variant="text" className={className} animated={animated} />
  );
}

export function CardSkeleton({
  className = '',
  animated = true,
}: Pick<SkeletonLoaderProps, 'className' | 'animated'>) {
  return (
    <SkeletonLoader variant="card" className={className} animated={animated} />
  );
}

export function CategorySkeleton({
  className = '',
  animated = true,
}: Pick<SkeletonLoaderProps, 'className' | 'animated'>) {
  return (
    <SkeletonLoader
      variant="category"
      className={className}
      animated={animated}
    />
  );
}

export function GridSkeleton({
  count = 12,
  className = '',
  animated = true,
}: Pick<SkeletonLoaderProps, 'count' | 'className' | 'animated'>) {
  return (
    <SkeletonLoader
      variant="grid"
      count={count}
      className={className}
      animated={animated}
    />
  );
}
