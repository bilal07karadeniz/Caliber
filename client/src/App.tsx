import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { notificationApi } from './services/api';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import MyApplications from './pages/MyApplications';
import Recommendations from './pages/Recommendations';
import SkillGap from './pages/SkillGap';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// Employer pages
import MyJobs from './pages/employer/MyJobs';
import CreateJob from './pages/employer/CreateJob';
import EditJob from './pages/employer/EditJob';
import Applicants from './pages/employer/Applicants';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import JobManagement from './pages/admin/JobManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const { refreshToken, isAuthenticated } = useAuthStore();
  const { setUnreadCount } = useNotificationStore();

  useEffect(() => {
    refreshToken();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const { data: res } = await notificationApi.getUnreadCount();
        setUnreadCount(res.data?.count || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Authenticated routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      {/* Job Seeker routes */}
      <Route path="/applications" element={<ProtectedRoute allowedRoles={['JOB_SEEKER']}><MyApplications /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute allowedRoles={['JOB_SEEKER']}><Recommendations /></ProtectedRoute>} />
      <Route path="/skill-gap" element={<ProtectedRoute allowedRoles={['JOB_SEEKER']}><SkillGap /></ProtectedRoute>} />

      {/* Employer routes */}
      <Route path="/employer/jobs" element={<ProtectedRoute allowedRoles={['EMPLOYER']}><MyJobs /></ProtectedRoute>} />
      <Route path="/employer/jobs/new" element={<ProtectedRoute allowedRoles={['EMPLOYER']}><CreateJob /></ProtectedRoute>} />
      <Route path="/employer/jobs/:id/edit" element={<ProtectedRoute allowedRoles={['EMPLOYER']}><EditJob /></ProtectedRoute>} />
      <Route path="/employer/jobs/:id/applicants" element={<ProtectedRoute allowedRoles={['EMPLOYER']}><Applicants /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['ADMIN']}><JobManagement /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
