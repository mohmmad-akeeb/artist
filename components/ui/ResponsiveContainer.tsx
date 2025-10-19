'use client';

import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  /** Child components to render */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Maximum width variant */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Whether to center the container */
  centered?: boolean;
}

const paddingVariants = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-4 sm:px-6 lg:px-8 xl:px-12',
};

const maxWidthVariants = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-8xl',
  full: 'max-w-full',
};

export default function ResponsiveContainer({
  children,
  className = '',
  padding = 'md',
  maxWidth = 'xl',
  centered = true,
}: ResponsiveContainerProps) {
  const paddingClass = paddingVariants[padding];
  const maxWidthClass = maxWidthVariants[maxWidth];
  const centerClass = centered ? 'mx-auto' : '';

  return (
    <div
      className={`${maxWidthClass} ${centerClass} ${paddingClass} ${className}`}
    >
      {children}
    </div>
  );
}
