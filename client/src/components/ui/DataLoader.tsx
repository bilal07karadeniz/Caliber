import Spinner from './Spinner';
import EmptyState from './EmptyState';

interface DataLoaderProps<T> {
  isLoading: boolean;
  error?: any;
  data?: T;
  children: (data: T) => React.ReactNode;
  emptyMessage?: string;
  onRetry?: () => void;
}

export default function DataLoader<T>({ isLoading, error, data, children, emptyMessage, onRetry }: DataLoaderProps<T>) {
  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }
  if (error) {
    return (
      <div className="py-16 border-t border-ink-200 pt-6">
        <p className="text-signal-low font-heading">Failed to load data</p>
        {onRetry && <button onClick={onRetry} className="text-sm text-ink-500 hover:text-ink-800 underline underline-offset-4 mt-2">Try again</button>}
      </div>
    );
  }
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <EmptyState title={emptyMessage || 'No data found'} />;
  }
  return <>{children(data)}</>;
}
