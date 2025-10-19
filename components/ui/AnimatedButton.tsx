'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Animation type */
  animation?: 'scale' | 'lift' | 'glow' | 'ripple' | 'slide';
  /** Whether button is loading */
  loading?: boolean;
  /** Icon to display (JSX element) */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Additional CSS classes */
  className?: string;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      animation = 'scale',
      loading = false,
      icon,
      iconPosition = 'left',
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

    // Variant styles
    const variantStyles = {
      primary:
        'bg-primary-900 text-white hover:bg-primary-800 focus:ring-primary-500 active:bg-primary-700',
      secondary:
        'bg-primary-100 text-primary-900 hover:bg-primary-200 focus:ring-primary-500 active:bg-primary-300',
      ghost:
        'text-primary-700 hover:bg-primary-100 focus:ring-primary-500 active:bg-primary-200',
      outline:
        'border border-primary-300 text-primary-700 hover:bg-primary-50 focus:ring-primary-500 active:bg-primary-100',
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    // Animation styles
    const animationStyles = {
      scale: 'hover:scale-105 active:scale-95',
      lift: 'hover:-translate-y-1 hover:shadow-lg active:translate-y-0',
      glow: 'hover:shadow-lg hover:shadow-primary-500/25',
      ripple: 'relative overflow-hidden',
      slide: 'hover:translate-x-1 active:translate-x-0',
    };

    const buttonClasses = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${animationStyles[animation]}
      ${className}
    `;

    const iconElement = icon && (
      <span
        className={`${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}`}
      >
        {icon}
      </span>
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {/* Ripple effect background */}
        {animation === 'ripple' && (
          <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        )}

        {/* Loading spinner */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {/* Button content */}
        <span
          className={`flex items-center ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        >
          {iconPosition === 'left' && iconElement}
          {children}
          {iconPosition === 'right' && iconElement}
        </span>

        {/* Glow effect */}
        {animation === 'glow' && (
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl" />
        )}
      </button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
