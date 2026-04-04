import { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { adminApi } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        adminApi.getDashboard().catch(() => ({ data: { data: null } })),
        adminApi.getSystemHealth().catch(() => ({ data: { data: null } })),
      ]);
      setStats(statsRes.data?.data);
      setHealth(healthRes.data?.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Briefcase className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold">{stats?.jobs?.active || 0}</p>
              <p className="text-sm text-gray-500">Active Jobs</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><FileText className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold">{stats?.applications?.total || 0}</p>
              <p className="text-sm text-gray-500">Applications</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><Sparkles className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold">{Math.round(stats?.aiMetrics?.averageMatchScore || 0)}%</p>
              <p className="text-sm text-gray-500">Avg Match Score</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={<h3 className="font-semibold">System Health</h3>}>
          <div className="space-y-3">
            {Object.entries(health || {}).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between">
                <span className="text-sm capitalize">{service}</span>
                <div className="flex items-center gap-1">
                  {status === 'ok' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  <span className={`text-sm ${status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{String(status)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card header={<h3 className="font-semibold">User Breakdown</h3>}>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Job Seekers</span><span className="font-medium">{stats?.users?.jobSeekers || 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Employers</span><span className="font-medium">{stats?.users?.employers || 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Admins</span><span className="font-medium">{stats?.users?.admins || 0}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="text-sm text-gray-500">New this week</span><span className="font-medium text-green-600">+{stats?.growth?.newUsersThisWeek || 0}</span></div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
