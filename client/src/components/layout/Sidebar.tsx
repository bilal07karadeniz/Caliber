import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Sparkles, FileText, BarChart3, User, Briefcase, PlusCircle,
  Users, Settings, Activity
} from 'lucide-react';
import { clsx } from 'clsx';

const seekerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/applications', label: 'My Applications', icon: FileText },
  { to: '/skill-gap', label: 'Skill Gap Analysis', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

const employerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employer/jobs', label: 'My Job Postings', icon: Briefcase },
  { to: '/employer/jobs/new', label: 'Create Job', icon: PlusCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/system', label: 'System Health', icon: Activity },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const links = user?.role === 'ADMIN' ? adminLinks : user?.role === 'EMPLOYER' ? employerLinks : seekerLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-16 bottom-0 overflow-y-auto">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              location.pathname === to
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
