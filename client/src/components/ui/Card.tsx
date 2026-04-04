import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Card({ children, className, header, footer }: CardProps) {
  return (
    <div className={twMerge('bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden', className)}>
      {header && <div className="px-6 py-4 border-b border-gray-200">{header}</div>}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">{footer}</div>}
    </div>
  );
}
