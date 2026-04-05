import { useState, useEffect } from 'react';
import { skillGapApi } from '../services/api';

export const useSkillGap = () => {
  const [insights, setInsights] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [insightsRes, pathRes] = await Promise.all([
          skillGapApi.careerInsights().catch(() => ({ data: { data: null } })),
          skillGapApi.learningPath().catch(() => ({ data: { data: null } })),
        ]);
        setInsights(insightsRes.data?.data);
        setLearningPath(pathRes.data?.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  return { insights, learningPath, loading };
};
