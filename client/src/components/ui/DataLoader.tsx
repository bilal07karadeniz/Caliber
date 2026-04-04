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
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">Failed to load data</p>
        {onRetry && <button onClick={onRetry} className="text-primary-600 hover:underline">Try again</button>}
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <EmptyState title={emptyMessage || 'No data found'} />;
  }

  return <>{children(data)}</>;
}
