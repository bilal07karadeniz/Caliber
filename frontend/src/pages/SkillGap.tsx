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
      <h1 className="font-heading text-2xl font-bold text-ink-900 mb-6">Skill Gap Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card header={<h3 className="font-heading font-semibold text-ink-900">Your Skills</h3>}>
          {user?.userSkills?.length ? (
            <div className="flex flex-wrap gap-2">
              {user.userSkills.map((us) => (
                <span key={us.id} className="inline-flex items-center px-2.5 py-1 border border-verdant-300 rounded-md font-mono text-xs text-verdant-700">
                  {us.skill?.name}
                  <span className="text-verdant-500 ml-1 tabular-nums">({us.proficiencyLevel}/5)</span>
                </span>
              ))}
            </div>
          ) : (
            <EmptyState title="No skills added" description="Add skills in your profile to get analysis" />
          )}
        </Card>

        <Card header={<h3 className="font-heading font-semibold text-ink-900">Career Insights</h3>}>
          {insights ? (
            <div className="space-y-3">
              <div>
                <p className="label mb-1">Strongest Areas</p>
                <div className="flex flex-wrap gap-1">
                  {insights.strongest_areas?.map((a: string) => (
                    <span key={a} className="inline-flex items-center px-2 py-0.5 border border-verdant-300 rounded-md font-mono text-xs text-verdant-700">{a}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="label mb-1">Recommended Paths</p>
                <div className="flex flex-wrap gap-1">
                  {insights.recommended_paths?.map((p: string) => (
                    <span key={p} className="inline-flex items-center px-2 py-0.5 border border-ink-200 rounded-md font-mono text-xs text-ink-700">{p}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="label mb-1">Next Skills to Learn</p>
                <div className="flex flex-wrap gap-1">
                  {insights.next_skills?.map((s: string) => (
                    <span key={s} className="inline-flex items-center px-2 py-0.5 border border-saffron-300 rounded-md font-mono text-xs text-saffron-700">{s}</span>
                  ))}
                </div>
              </div>
              {insights.summary && <p className="text-sm text-ink-600 mt-2 font-body">{insights.summary}</p>}
            </div>
          ) : (
            <p className="text-sm text-ink-500 font-body">Upload a resume and add skills to get career insights.</p>
          )}
        </Card>
      </div>

      <Card header={<h3 className="font-heading font-semibold text-ink-900">Recommended Learning Path</h3>}>
        {learningPath?.courses?.length ? (
          <div className="space-y-3">
            {learningPath.courses.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border border-ink-200 rounded-md transition-colors hover:bg-surface-sunken">
                <div>
                  <p className="font-medium text-sm text-ink-900">{c.resource_title}</p>
                  <p className="text-xs text-ink-500 flex items-center gap-2">
                    {c.provider} · {c.estimated_duration} ·
                    <Badge variant={c.priority === 'critical' ? 'error' : c.priority === 'moderate' ? 'warning' : 'info'}>{c.priority}</Badge>
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">For: <span className="font-mono">{c.skill_name}</span></p>
                </div>
                {c.url && c.url !== '#' && (
                  <a href={c.url} target="_blank" rel="noopener" className="text-verdant-600 text-sm hover:underline underline-offset-4 shrink-0 transition-colors">View</a>
                )}
              </div>
            ))}
            {learningPath.estimated_total_hours && (
              <p className="text-sm text-ink-500 mt-2 font-body">Estimated total: <span className="font-mono tabular-nums">{learningPath.estimated_total_hours}</span></p>
            )}
          </div>
        ) : (
          <EmptyState title="No learning recommendations" description="Apply to jobs to get personalized learning paths" />
        )}
      </Card>
    </DashboardLayout>
  );
}
