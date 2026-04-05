import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([
          adminApi.getDashboard().catch(() => ({ data: { data: null } })),
          adminApi.getSystemHealth().catch(() => ({ data: { data: null } })),
        ]);
        setStats(statsRes.data?.data);
        setHealth(healthRes.data?.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  return { stats, health, loading };
};
