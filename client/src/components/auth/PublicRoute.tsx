import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-1 w-24 bg-ink-200 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-verdant-500 rounded-full animate-pulse-line" /></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
