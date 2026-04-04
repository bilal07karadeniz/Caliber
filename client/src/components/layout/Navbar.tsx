import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LogOut, User, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import Avatar from '../ui/Avatar';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-surface-inverse sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-heading font-bold text-sm tracking-[0.2em] uppercase text-white">
              Caliber
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/jobs" className="font-mono text-xs uppercase tracking-wider text-ink-400 hover:text-white transition-colors">Jobs</Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="font-mono text-xs uppercase tracking-wider text-ink-400 hover:text-white transition-colors">Dashboard</Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="relative p-2 text-ink-400 hover:text-white transition-colors">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-signal-low text-white text-[10px] font-mono rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center">
                    <Avatar name={user?.name || ''} src={user?.avatar || undefined} size="sm" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-ink-800 rounded-md shadow-raised border border-ink-700 py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-ink-700">
                        <p className="text-sm font-heading font-medium text-white">{user?.name}</p>
                        <p className="text-xs font-mono text-ink-400">{user?.role?.replace('_', ' ')}</p>
                      </div>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-300 hover:text-white hover:bg-ink-700 transition-colors">
                        <User className="w-3.5 h-3.5" /> Profile
                      </Link>
                      {user?.role === 'EMPLOYER' && (
                        <Link to="/employer/jobs" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-300 hover:text-white hover:bg-ink-700 transition-colors">
                          <Briefcase className="w-3.5 h-3.5" /> My Jobs
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-signal-low hover:bg-ink-700 w-full transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="font-mono text-xs uppercase tracking-wider text-ink-400 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="px-3 py-1.5 text-xs font-heading font-semibold bg-verdant-500 text-white rounded hover:bg-verdant-600 transition-colors">Register</Link>
              </div>
            )}
            <button className="md:hidden p-2 text-ink-400" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-ink-800 bg-surface-inverse px-4 py-3 space-y-2">
          <Link to="/jobs" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-ink-300 font-mono">Jobs</Link>
          {isAuthenticated && (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-ink-300 font-mono">Dashboard</Link>
          )}
        </div>
      )}
    </nav>
  );
}
