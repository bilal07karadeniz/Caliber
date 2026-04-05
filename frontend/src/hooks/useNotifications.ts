import { useState, useEffect } from 'react';
import { notificationApi } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';
import type { Notification } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount } = useNotificationStore();

  const fetchNotifications = async () => {
    try {
      const { data: res } = await notificationApi.getAll({ limit: 50 });
      setNotifications(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const markRead = async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(Math.max(0, notifications.filter(n => !n.isRead).length - 1));
  };

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id: string) => {
    await notificationApi.delete(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  useEffect(() => { fetchNotifications(); }, []);

  return { notifications, loading, markRead, markAllRead, deleteNotification, refetch: fetchNotifications };
};
