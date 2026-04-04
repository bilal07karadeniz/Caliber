import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Sparkles, FileText, BarChart3, User, Briefcase, PlusCircle, Users, Activity } from 'lucide-react';
import { clsx } from 'clsx';

const seekerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/skill-gap', label: 'Skill Analysis', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

const employerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employer/jobs', label: 'Job Postings', icon: Briefcase },
  { to: '/employer/jobs/new', label: 'Create Job', icon: PlusCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/system', label: 'System', icon: Activity },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const links = user?.role === 'ADMIN' ? adminLinks : user?.role === 'EMPLOYER' ? employerLinks : seekerLinks;

  return (
    <aside className="hidden md:flex flex-col w-56 bg-surface-sunken border-r border-ink-200 fixed top-14 bottom-0 overflow-y-auto">
      <nav className="flex-1 py-4 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className={clsx(
              'flex items-center gap-2.5 px-4 py-2 text-sm font-body transition-colors border-l-3',
              location.pathname === to
                ? 'border-verdant-500 bg-surface-raised text-ink-900 font-medium'
                : 'border-transparent text-ink-500 hover:text-ink-800 hover:border-ink-200'
            )}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
