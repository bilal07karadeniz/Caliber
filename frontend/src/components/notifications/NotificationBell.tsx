import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotificationStore();

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-ink-400 hover:text-white transition-colors">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-signal-low text-white text-[10px] font-mono rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}
