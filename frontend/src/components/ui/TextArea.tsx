import { TextareaHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, maxLength, value, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label mb-2 block">{label}</label>}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={twMerge(
            'w-full bg-surface-sunken border border-ink-200 rounded-md py-3 px-3 text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-verdant-500 transition-colors font-body resize-y min-h-[100px]',
            error ? 'border-signal-low' : '',
            className
          )}
          {...props}
        />
        <div className="flex justify-between mt-1.5">
          {error && <p className="text-xs text-signal-low">{error}</p>}
          {maxLength && <p className="text-xs font-mono text-ink-400 ml-auto">{String(value || '').length}/{maxLength}</p>}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
export default TextArea;
