import { useState, useEffect } from 'react';
import { jobApi } from '../services/api';
import type { Job } from '../types';

export const useJobs = (params?: any) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async (queryParams?: any) => {
    setLoading(true);
    try {
      const { data: res } = await jobApi.getAll(queryParams || params);
      setJobs(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  return { jobs, loading, total, totalPages, refetch: fetchJobs };
};
