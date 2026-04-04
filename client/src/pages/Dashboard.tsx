import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, TrendingUp } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { useAuthStore } from '../store/authStore';
import { recommendationApi, applicationApi, jobApi } from '../services/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      if (user?.role === 'JOB_SEEKER') {
        const [recsRes, appsRes] = await Promise.all([
          recommendationApi.getMy().catch(() => ({ data: { data: [] } })),
          applicationApi.getMy().catch(() => ({ data: { data: { data: [] } } })),
        ]);
        setStats({
          recommendations: recsRes.data?.data || [],
          applications: recsRes.data?.data?.data || appsRes.data?.data?.data || [],
        });
      } else if (user?.role === 'EMPLOYER') {
        const jobsRes = await jobApi.getMyListings().catch(() => ({ data: { data: { data: [] } } }));
        setStats({ jobs: jobsRes.data?.data?.data || [] });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink-900">Welcome back, {user?.name}</h1>
        <p className="text-ink-500 mt-1">{user?.role === 'EMPLOYER' ? 'Manage your job postings' : 'Find your next opportunity'}</p>
      </div>

      {user?.role === 'JOB_SEEKER' && (
        <>
          {/* Data wall stats */}
          <div className="border border-ink-200 rounded-md bg-surface-raised mb-8">
            <div className="data-wall">
              <div>
                <p className="label mb-1">Applications</p>
                <p className="data-value">{stats?.applications?.length || 0}</p>
              </div>
              <div>
                <p className="label mb-1">Recommendations</p>
                <p className="data-value">{stats?.recommendations?.length || 0}</p>
              </div>
              <div>
                <p className="label mb-1">Skills</p>
                <p className="data-value">{user?.userSkills?.length || 0}</p>
              </div>
              <div>
                <p className="label mb-1">Profile Score</p>
                <p className="data-value">--</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card header={<div className="flex justify-between items-center"><h3 className="font-heading font-semibold text-ink-900">Recent Recommendations</h3><Link to="/recommendations" className="text-sm text-verdant-600 hover:underline underline-offset-4 transition-colors">View all</Link></div>}>
              {stats?.recommendations?.slice(0, 5).map((rec: any) => (
                <div key={rec.id} className="flex items-center justify-between py-3 border-b border-ink-200 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-ink-900">{rec.job?.title || 'Job'}</p>
                    <p className="text-xs text-ink-500">{rec.job?.employer?.companyProfile?.companyName || ''}</p>
                  </div>
                  <span className="font-mono tabular-nums text-sm font-medium">{Math.round(rec.matchScore)}%</span>
                </div>
              )) || <p className="text-ink-500 text-sm py-4">No recommendations yet. Upload a resume to get started.</p>}
            </Card>

            <Card header={<div className="flex justify-between items-center"><h3 className="font-heading font-semibold text-ink-900">Recent Applications</h3><Link to="/applications" className="text-sm text-verdant-600 hover:underline underline-offset-4 transition-colors">View all</Link></div>}>
              {stats?.applications?.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between py-3 border-b border-ink-200 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-ink-900">{app.job?.title || 'Job'}</p>
                    <p className="text-xs text-ink-500">{new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={app.status === 'ACCEPTED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'info'}>
                    {app.status}
                  </Badge>
                </div>
              )) || <p className="text-ink-500 text-sm py-4">No applications yet.</p>}
            </Card>
          </div>
        </>
      )}

      {user?.role === 'EMPLOYER' && (
        <>
          {/* Data wall stats */}
          <div className="border border-ink-200 rounded-md bg-surface-raised mb-8">
            <div className="data-wall">
              <div>
                <p className="label mb-1">Job Postings</p>
                <p className="data-value">{stats?.jobs?.length || 0}</p>
              </div>
              <div>
                <p className="label mb-1">Total Applications</p>
                <p className="data-value">{stats?.jobs?.reduce((acc: number, j: any) => acc + (j._count?.applications || 0), 0) || 0}</p>
              </div>
              <div>
                <p className="label mb-1">Active Jobs</p>
                <p className="data-value">{stats?.jobs?.filter((j: any) => j.isActive).length || 0}</p>
              </div>
            </div>
          </div>

          <Card header={<div className="flex justify-between items-center"><h3 className="font-heading font-semibold text-ink-900">My Job Postings</h3><Link to="/employer/jobs/new" className="text-sm text-verdant-600 hover:underline underline-offset-4 transition-colors">Create new</Link></div>}>
            {stats?.jobs?.slice(0, 5).map((job: any) => (
              <div key={job.id} className="flex items-center justify-between py-3 border-b border-ink-200 last:border-0">
                <div>
                  <p className="font-medium text-sm text-ink-900">{job.title}</p>
                  <p className="text-xs text-ink-500"><span className="font-mono tabular-nums">{job._count?.applications || 0}</span> applicants</p>
                </div>
                <Badge variant={job.isActive ? 'success' : 'neutral'}>{job.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            )) || <p className="text-ink-500 text-sm py-4">No jobs posted yet.</p>}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
