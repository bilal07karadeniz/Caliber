import { SelectHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label mb-2 block">{label}</label>}
        <select
          ref={ref}
          className={twMerge(
            'w-full bg-transparent border-b-2 py-2.5 text-ink-900 focus:outline-none transition-colors font-body appearance-none cursor-pointer',
            error ? 'border-signal-low' : 'border-ink-300 focus:border-verdant-500',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-signal-low">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
