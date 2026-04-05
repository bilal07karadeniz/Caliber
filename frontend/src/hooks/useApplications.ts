import { useState, useEffect } from 'react';
import { applicationApi } from '../services/api';
import type { Application } from '../types';

export const useApplications = (params?: any) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApplications = async (queryParams?: any) => {
    setLoading(true);
    try {
      const { data: res } = await applicationApi.getMy(queryParams || params);
      setApplications(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  return { applications, loading, totalPages, refetch: fetchApplications };
};
