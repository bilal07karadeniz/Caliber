import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Sparkles, TrendingUp } from 'lucide-react';
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">{user?.role === 'EMPLOYER' ? 'Manage your job postings' : 'Find your next opportunity'}</p>
      </div>

      {user?.role === 'JOB_SEEKER' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats?.applications?.length || 0}</p>
                  <p className="text-sm text-gray-500">Applications</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><Sparkles className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats?.recommendations?.length || 0}</p>
                  <p className="text-sm text-gray-500">Recommendations</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{user?.userSkills?.length || 0}</p>
                  <p className="text-sm text-gray-500">Skills</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg"><Briefcase className="w-5 h-5 text-orange-600" /></div>
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-gray-500">Profile Score</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card header={<div className="flex justify-between items-center"><h3 className="font-semibold">Recent Recommendations</h3><Link to="/recommendations" className="text-sm text-primary-600 hover:underline">View all</Link></div>}>
              {stats?.recommendations?.slice(0, 5).map((rec: any) => (
                <div key={rec.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{rec.job?.title || 'Job'}</p>
                    <p className="text-xs text-gray-500">{rec.job?.employer?.companyProfile?.companyName || ''}</p>
                  </div>
                  <Badge variant={rec.matchScore > 80 ? 'success' : rec.matchScore > 60 ? 'warning' : 'error'}>
                    {Math.round(rec.matchScore)}%
                  </Badge>
                </div>
              )) || <p className="text-gray-500 text-sm py-4">No recommendations yet. Upload a resume to get started.</p>}
            </Card>

            <Card header={<div className="flex justify-between items-center"><h3 className="font-semibold">Recent Applications</h3><Link to="/applications" className="text-sm text-primary-600 hover:underline">View all</Link></div>}>
              {stats?.applications?.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{app.job?.title || 'Job'}</p>
                    <p className="text-xs text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={app.status === 'ACCEPTED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'info'}>
                    {app.status}
                  </Badge>
                </div>
              )) || <p className="text-gray-500 text-sm py-4">No applications yet.</p>}
            </Card>
          </div>
        </>
      )}

      {user?.role === 'EMPLOYER' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Briefcase className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats?.jobs?.length || 0}</p>
                  <p className="text-sm text-gray-500">Job Postings</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><FileText className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats?.jobs?.reduce((acc: number, j: any) => acc + (j._count?.applications || 0), 0) || 0}</p>
                  <p className="text-sm text-gray-500">Total Applications</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg"><Sparkles className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats?.jobs?.filter((j: any) => j.isActive).length || 0}</p>
                  <p className="text-sm text-gray-500">Active Jobs</p>
                </div>
              </div>
            </Card>
          </div>
          <Card header={<div className="flex justify-between items-center"><h3 className="font-semibold">My Job Postings</h3><Link to="/employer/jobs/new" className="text-sm text-primary-600 hover:underline">Create new</Link></div>}>
            {stats?.jobs?.slice(0, 5).map((job: any) => (
              <div key={job.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{job.title}</p>
                  <p className="text-xs text-gray-500">{job._count?.applications || 0} applicants</p>
                </div>
                <Badge variant={job.isActive ? 'success' : 'neutral'}>{job.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            )) || <p className="text-gray-500 text-sm py-4">No jobs posted yet.</p>}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
