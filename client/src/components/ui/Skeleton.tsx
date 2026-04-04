import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div className={clsx(
      'animate-pulse bg-gray-200',
      { 'h-4 rounded': variant === 'text', 'rounded-full': variant === 'circular', 'rounded-lg': variant === 'rectangular' },
      className
    )} />
  );
}
