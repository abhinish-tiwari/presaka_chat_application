import { forwardRef, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { cardHover } from '@/utils/animations';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  isAnimated?: boolean;
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      isAnimated = true,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
      bordered: 'bg-white border-2 border-gray-300 dark:bg-gray-800 dark:border-gray-600',
      elevated: 'bg-white shadow-lg dark:bg-gray-800 dark:shadow-gray-900/50',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <motion.div
        ref={ref}
        className={clsx(
          'rounded-lg transition-all duration-200',
          variants[variant],
          paddings[padding],
          hoverable && 'cursor-pointer',
          className
        )}
        whileHover={hoverable && isAnimated ? cardHover : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
