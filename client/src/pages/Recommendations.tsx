import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { recommendationApi } from '../services/api';
import toast from 'react-hot-toast';
import type { AiRecommendation } from '../types';

export default function Recommendations() {
  const [recs, setRecs] = useState<AiRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadRecs(); }, []);

  const loadRecs = async () => {
    try {
      const { data: res } = await recommendationApi.getMy();
      setRecs(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await recommendationApi.refresh();
      await loadRecs();
      toast.success('Recommendations refreshed');
    } catch { toast.error('Failed to refresh'); }
    setRefreshing(false);
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Recommendations</h1>
        <Button variant="outline" onClick={handleRefresh} isLoading={refreshing}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {recs.length === 0 ? (
        <EmptyState title="No recommendations yet" description="Upload a resume and add skills to get personalized job recommendations" action={<Link to="/profile"><Button>Complete Profile</Button></Link>} />
      ) : (
        <div className="space-y-4">
          {recs.map((rec) => (
            <Card key={rec.id}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 ${rec.matchScore >= 80 ? 'bg-green-500' : rec.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {Math.round(rec.matchScore)}%
                    </div>
                    <div>
                      <Link to={`/jobs/${rec.jobId}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">{rec.job?.title || 'Job Position'}</Link>
                      <p className="text-sm text-gray-500">{rec.job?.employer?.companyProfile?.companyName} · {rec.job?.location}</p>
                      {rec.explanation && <p className="text-sm text-gray-600 mt-2">{rec.explanation}</p>}
                      {rec.skillGap && rec.skillGap.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs text-gray-500 mr-1">Skill gaps:</span>
                          {rec.skillGap.slice(0, 3).map((sg, i) => (
                            <Badge key={i} variant="warning">{sg.skill_name}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <Link to={`/jobs/${rec.jobId}`}><Button variant="outline" size="sm">View Job</Button></Link>
                  <Link to={`/skill-gap?job=${rec.jobId}`}><Button variant="ghost" size="sm">Skill Gap</Button></Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
