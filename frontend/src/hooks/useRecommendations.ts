import { useState, useEffect } from 'react';
import { recommendationApi } from '../services/api';
import type { AiRecommendation } from '../types';
import toast from 'react-hot-toast';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async () => {
    try {
      const { data: res } = await recommendationApi.getMy();
      setRecommendations(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await recommendationApi.refresh();
      await fetchRecommendations();
      toast.success('Recommendations refreshed');
    } catch { toast.error('Failed to refresh'); }
    setRefreshing(false);
  };

  useEffect(() => { fetchRecommendations(); }, []);

  return { recommendations, loading, refreshing, refresh, refetch: fetchRecommendations };
};
