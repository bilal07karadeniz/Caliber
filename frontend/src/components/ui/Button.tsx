import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center font-heading font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-inset disabled:opacity-50 disabled:cursor-not-allowed',
            {
              'bg-verdant-500 text-white hover:bg-verdant-600 focus:ring-verdant-300': variant === 'primary',
              'bg-ink-100 text-ink-800 hover:bg-ink-200 border border-ink-300 focus:ring-ink-400': variant === 'secondary',
              'border-2 border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white focus:ring-ink-400': variant === 'outline',
              'bg-signal-low text-white hover:bg-signal-low/90 focus:ring-signal-low/50': variant === 'danger',
              'text-ink-600 hover:text-ink-900 hover:underline underline-offset-4 focus:ring-ink-400': variant === 'ghost',
              'px-2.5 py-1 text-xs': size === 'sm',
              'px-4 py-2 text-sm': size === 'md',
              'px-5 py-2.5 text-sm uppercase tracking-wide': size === 'lg',
            }
          ),
          className
        )}
        {...props}
      >
        {isLoading && (
          <div className="mr-2 h-3 w-3 animate-pulse-line rounded-full bg-current" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
