import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      label,
      description,
      error,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const radioId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            disabled={disabled}
            className={clsx(
              'w-4 h-4 border-gray-300 dark:border-gray-600',
              'text-blue-600 dark:text-blue-500',
              'focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0',
              'bg-white dark:bg-gray-800',
              'transition-colors duration-200',
              'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-300 dark:border-red-700',
              className
            )}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={radioId}
                className={clsx(
                  'block text-sm font-medium text-gray-900 dark:text-gray-100',
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// RadioGroup component for grouping radio buttons
export interface RadioGroupProps {
  children: ReactNode;
  label?: string;
  error?: string;
  className?: string;
}

export const RadioGroup = ({
  children,
  label,
  error,
  className,
}: RadioGroupProps) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
      )}
      <div className="space-y-2">{children}</div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

