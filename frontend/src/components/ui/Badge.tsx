import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

const variants = {
  success: 'border-verdant-500 text-verdant-700',
  warning: 'border-saffron-500 text-saffron-700',
  error: 'border-signal-low text-signal-low',
  info: 'border-ink-400 text-ink-600',
  neutral: 'border-ink-200 text-ink-500',
};

export default function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-sm border font-mono text-xs', variants[variant], className)}>
      {children}
    </span>
  );
}
