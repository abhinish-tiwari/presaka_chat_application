import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      primary:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      success:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      warning:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      danger:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      info:
        'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors duration-200',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={clsx(
              'rounded-full',
              dotSizes[size],
              variant === 'default' && 'bg-gray-500 dark:bg-gray-400',
              variant === 'primary' && 'bg-blue-500 dark:bg-blue-400',
              variant === 'success' && 'bg-green-500 dark:bg-green-400',
              variant === 'warning' && 'bg-yellow-500 dark:bg-yellow-400',
              variant === 'danger' && 'bg-red-500 dark:bg-red-400',
              variant === 'info' && 'bg-cyan-500 dark:bg-cyan-400'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

