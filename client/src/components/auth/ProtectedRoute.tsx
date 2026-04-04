import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-1 w-24 bg-ink-200 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-verdant-500 rounded-full animate-pulse-line" /></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
