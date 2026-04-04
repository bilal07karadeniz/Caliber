import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { skillGapApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function SkillGap() {
  const { user } = useAuthStore();
  const [insights, setInsights] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
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

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Skill Gap Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card header={<h3 className="font-semibold">Your Skills</h3>}>
          {user?.userSkills?.length ? (
            <div className="flex flex-wrap gap-2">
              {user.userSkills.map((us) => (
                <div key={us.id} className="px-3 py-1.5 bg-primary-50 rounded-lg">
                  <span className="text-sm font-medium text-primary-700">{us.skill?.name}</span>
                  <span className="text-xs text-primary-500 ml-1">({us.proficiencyLevel}/5)</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No skills added" description="Add skills in your profile to get analysis" />
          )}
        </Card>

        <Card header={<h3 className="font-semibold">Career Insights</h3>}>
          {insights ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Strongest Areas</p>
                <div className="flex flex-wrap gap-1">
                  {insights.strongest_areas?.map((a: string) => <Badge key={a} variant="success">{a}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Recommended Paths</p>
                <div className="flex flex-wrap gap-1">
                  {insights.recommended_paths?.map((p: string) => <Badge key={p} variant="info">{p}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Next Skills to Learn</p>
                <div className="flex flex-wrap gap-1">
                  {insights.next_skills?.map((s: string) => <Badge key={s} variant="warning">{s}</Badge>)}
                </div>
              </div>
              {insights.summary && <p className="text-sm text-gray-600 mt-2">{insights.summary}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Upload a resume and add skills to get career insights.</p>
          )}
        </Card>
      </div>

      <Card header={<h3 className="font-semibold">Recommended Learning Path</h3>}>
        {learningPath?.courses?.length ? (
          <div className="space-y-3">
            {learningPath.courses.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{c.resource_title}</p>
                  <p className="text-xs text-gray-500">{c.provider} · {c.estimated_duration} · <Badge variant={c.priority === 'critical' ? 'error' : c.priority === 'moderate' ? 'warning' : 'info'}>{c.priority}</Badge></p>
                  <p className="text-xs text-gray-400 mt-0.5">For: {c.skill_name}</p>
                </div>
                {c.url && c.url !== '#' && (
                  <a href={c.url} target="_blank" rel="noopener" className="text-primary-600 text-sm hover:underline shrink-0">View</a>
                )}
              </div>
            ))}
            {learningPath.estimated_total_hours && (
              <p className="text-sm text-gray-500 mt-2">Estimated total: {learningPath.estimated_total_hours}</p>
            )}
          </div>
        ) : (
          <EmptyState title="No learning recommendations" description="Apply to jobs to get personalized learning paths" />
        )}
      </Card>
    </DashboardLayout>
  );
}
