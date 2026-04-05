import { useState, useEffect } from 'react';
import { recommendationApi, applicationApi, jobApi, adminApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const useDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'JOB_SEEKER') {
          const [recs, apps] = await Promise.all([
            recommendationApi.getMy().catch(() => ({ data: { data: [] } })),
            applicationApi.getMy().catch(() => ({ data: { data: { data: [] } } })),
          ]);
          setData({ recommendations: recs.data?.data || [], applications: apps.data?.data?.data || [] });
        } else if (user?.role === 'EMPLOYER') {
          const jobs = await jobApi.getMyListings().catch(() => ({ data: { data: { data: [] } } }));
          setData({ jobs: jobs.data?.data?.data || [] });
        } else if (user?.role === 'ADMIN') {
          const stats = await adminApi.getDashboard().catch(() => ({ data: { data: null } }));
          setData({ stats: stats.data?.data });
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [user]);

  return { data, loading };
};
