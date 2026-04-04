import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { notificationApi } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';
import { Bell, Check, Trash2 } from 'lucide-react';
import type { Notification } from '../types';

const typeIcons: Record<string, string> = {
  APPLICATION_UPDATE: 'info', NEW_JOB_MATCH: 'success', NEW_APPLICANT: 'warning', SYSTEM: 'neutral', RECOMMENDATION: 'success',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount } = useNotificationStore();

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const { data: res } = await notificationApi.getAll({ limit: 50 });
      setNotifications(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(Math.max(0, notifications.filter((n) => !n.isRead).length - 1));
  };

  const handleDelete = async (id: string) => {
    await notificationApi.delete(id);
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-2xl font-bold text-ink-900">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}><Check className="w-4 h-4 mr-1" /> Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="w-12 h-12" />} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.isRead ? 'border-l-4 border-l-verdant-500' : ''}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={typeIcons[n.type] as any || 'neutral'}>{n.type.replace('_', ' ')}</Badge>
                    {!n.isRead && <span className="w-2 h-2 bg-verdant-500 rounded-full" />}
                  </div>
                  <p className="font-medium text-sm text-ink-900">{n.title}</p>
                  <p className="text-sm text-ink-500 font-body">{n.message}</p>
                  <p className="text-xs text-ink-400 mt-1 font-mono tabular-nums">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  {!n.isRead && (
                    <button onClick={() => handleMarkRead(n.id)} className="p-1 hover:bg-surface-sunken rounded-md transition-colors" title="Mark read">
                      <Check className="w-4 h-4 text-ink-400" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="p-1 hover:bg-surface-sunken rounded-md transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-ink-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
