import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div className={clsx(
      'animate-pulse bg-ink-100',
      { 'h-4 rounded-sm': variant === 'text', 'rounded-full': variant === 'circular', 'rounded-md': variant === 'rectangular' },
      className
    )} />
  );
}
