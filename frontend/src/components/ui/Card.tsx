import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Card({ children, className, header, footer }: CardProps) {
  return (
    <div className={twMerge('bg-surface-raised border border-ink-200 rounded-md', className)}>
      {header && <div className="px-5 py-4 border-b-2 border-ink-900 font-heading">{header}</div>}
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="px-5 py-3 border-t border-ink-200 bg-surface-sunken">{footer}</div>}
    </div>
  );
}
