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
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={twMerge(
            'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y min-h-[80px]',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {maxLength && <p className="text-xs text-gray-400 ml-auto">{String(value || '').length}/{maxLength}</p>}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
export default TextArea;
