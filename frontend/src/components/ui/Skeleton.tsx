import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Shape variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Number of lines for text variant */
  lines?: number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      width,
      height,
      variant = 'text',
      animation = 'wave',
      lines = 1,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'bg-gray-200 dark:bg-gray-700';
    
    const variantStyles = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: '',
      rounded: 'rounded-lg',
    };

    const animationStyles = {
      pulse: 'animate-pulse',
      wave: 'skeleton-wave',
      none: '',
    };

    const getHeight = () => {
      if (height) return height;
      if (variant === 'text') return '1em';
      return '100%';
    };

    const skeletonStyle = {
      width: width || '100%',
      height: getHeight(),
      ...style,
    };

    // For text variant with multiple lines
    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={clsx('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={clsx(
                baseStyles,
                variantStyles[variant],
                animationStyles[animation]
              )}
              style={{
                width: index === lines - 1 ? '80%' : '100%',
                height: '1em',
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          animationStyles[animation],
          className
        )}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

