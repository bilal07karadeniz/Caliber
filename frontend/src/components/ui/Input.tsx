import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label mb-2 block">{label}</label>}
        <input
          ref={ref}
          className={twMerge(
            'w-full bg-transparent border-b-2 py-2.5 text-ink-900 placeholder:text-ink-300 focus:outline-none transition-colors font-body',
            error ? 'border-signal-low' : 'border-ink-300 focus:border-verdant-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-signal-low">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
