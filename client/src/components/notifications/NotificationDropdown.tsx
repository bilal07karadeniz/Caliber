import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../../services/api';
import type { Notification } from '../../types';

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    notificationApi.getAll({ limit: 5 }).then(({ data: res }) => setNotifications(res.data?.data || [])).catch(() => {});
  }, []);

  return (
    <div className="absolute right-0 mt-2 w-80 bg-surface-raised rounded-md shadow-raised border border-ink-200 z-50">
      <div className="px-4 py-3 border-b-2 border-ink-900">
        <h4 className="font-heading font-semibold text-sm">Notifications</h4>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-ink-100">
        {notifications.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-6">No notifications</p>
        ) : notifications.map(n => (
          <div key={n.id} className={`p-3 ${!n.isRead ? 'border-l-3 border-l-verdant-500 bg-signal-high-bg' : ''}`}>
            <p className="text-sm font-heading font-medium text-ink-800">{n.title}</p>
            <p className="text-xs text-ink-500 mt-0.5">{n.message}</p>
            <p className="text-[10px] font-mono text-ink-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <Link to="/notifications" onClick={onClose} className="block px-4 py-2.5 text-center text-xs font-mono text-verdant-600 hover:bg-surface-sunken border-t border-ink-200 transition-colors">
        View all
      </Link>
    </div>
  );
}
