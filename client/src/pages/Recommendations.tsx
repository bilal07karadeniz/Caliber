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

function SignalBar({ score }: { score: number }) {
  const level = score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low';
  const colorMap = { high: 'bg-signal-high', mid: 'bg-signal-mid', low: 'bg-signal-low' };
  const bgMap = { high: 'bg-signal-high-bg', mid: 'bg-signal-mid-bg', low: 'bg-signal-low-bg' };
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono tabular-nums text-lg font-bold text-ink-900">{Math.round(score)}%</span>
      <div className={`w-16 h-1.5 rounded-sm ${bgMap[level]}`}>
        <div className={`h-full rounded-sm ${colorMap[level]}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

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
        <h1 className="font-heading text-2xl font-bold text-ink-900">AI Recommendations</h1>
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
                    <SignalBar score={rec.matchScore} />
                    <div>
                      <Link to={`/jobs/${rec.jobId}`} className="font-heading text-lg font-semibold text-ink-900 hover:text-verdant-600 transition-colors">{rec.job?.title || 'Job Position'}</Link>
                      <p className="text-sm text-ink-500">{rec.job?.employer?.companyProfile?.companyName} · {rec.job?.location}</p>
                      {rec.explanation && <p className="text-sm text-ink-600 mt-2 font-body">{rec.explanation}</p>}
                      {rec.skillGap && rec.skillGap.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="label mr-1">Skill gaps:</span>
                          {rec.skillGap.slice(0, 3).map((sg, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 border border-saffron-300 rounded-md font-mono text-xs text-saffron-700">{sg.skill_name}</span>
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
