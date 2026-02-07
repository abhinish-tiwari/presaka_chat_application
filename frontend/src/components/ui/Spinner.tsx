import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'white' | 'current';
  /** Show with text label */
  label?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = 'md',
      variant = 'primary',
      label,
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    const variants = {
      primary: 'text-blue-600 dark:text-blue-500',
      secondary: 'text-gray-600 dark:text-gray-400',
      white: 'text-white',
      current: 'text-current',
    };

    const spinner = (
      <svg
        className={clsx(
          'animate-spin',
          sizes[size],
          variants[variant],
          className
        )}
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
    );

    if (label) {
      return (
        <div
          ref={ref}
          className={clsx('flex items-center gap-2', className)}
          {...props}
        >
          {spinner}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {label}
          </span>
        </div>
      );
    }

    return (
      <div ref={ref} {...props}>
        {spinner}
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * Full page spinner overlay
 */
export const SpinnerOverlay = ({ label }: { label?: string }) => {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <Spinner size="lg" variant="primary" label={label} />
      </div>
    </div>
  );
};

/**
 * Centered spinner for loading states
 */
export const SpinnerCenter = ({ label, size = 'lg' }: { label?: string; size?: SpinnerProps['size'] }) => {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Spinner size={size} variant="primary" label={label} />
    </div>
  );
};
