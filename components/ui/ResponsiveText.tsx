'use client';

import { ReactNode, ElementType } from 'react';

interface ResponsiveTextProps {
  /** The HTML element to render */
  as?: ElementType;
  /** Text size variant */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Text weight */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text color */
  color?: 'primary' | 'secondary' | 'muted' | 'white';
  /** Additional CSS classes */
  className?: string;
  /** Child content */
  children: ReactNode;
}

const sizeVariants = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl md:text-2xl',
  xl: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  '2xl': 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  '3xl': 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  '4xl': 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
  '5xl': 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl',
};

const weightVariants = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorVariants = {
  primary: 'text-primary-900',
  secondary: 'text-primary-600',
  muted: 'text-primary-500',
  white: 'text-white',
};

export default function ResponsiveText({
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  className = '',
  children,
  ...props
}: ResponsiveTextProps) {
  const sizeClass = sizeVariants[size];
  const weightClass = weightVariants[weight];
  const colorClass = colorVariants[color];

  return (
    <Component
      className={`${sizeClass} ${weightClass} ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
