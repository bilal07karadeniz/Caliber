import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
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
      <h1 className="font-heading text-2xl font-bold text-ink-900 mb-6">Admin Dashboard</h1>

      {/* Data wall stats */}
      <div className="border border-ink-200 rounded-md bg-surface-raised mb-6">
        <div className="data-wall">
          <div>
            <p className="label mb-1">Total Users</p>
            <p className="data-value">{stats?.users?.total || 0}</p>
          </div>
          <div>
            <p className="label mb-1">Active Jobs</p>
            <p className="data-value">{stats?.jobs?.active || 0}</p>
          </div>
          <div>
            <p className="label mb-1">Applications</p>
            <p className="data-value">{stats?.applications?.total || 0}</p>
          </div>
          <div>
            <p className="label mb-1">Avg Match Score</p>
            <p className="data-value">{Math.round(stats?.aiMetrics?.averageMatchScore || 0)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={<h3 className="font-heading font-semibold text-ink-900">System Health</h3>}>
          <div className="space-y-3">
            {Object.entries(health || {}).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between">
                <span className="text-sm capitalize text-ink-700">{service}</span>
                <div className="flex items-center gap-1">
                  {status === 'ok' ? <CheckCircle className="w-4 h-4 text-signal-high" /> : <XCircle className="w-4 h-4 text-signal-low" />}
                  <span className={`text-sm font-mono ${status === 'ok' ? 'text-signal-high' : 'text-signal-low'}`}>{String(status)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card header={<h3 className="font-heading font-semibold text-ink-900">User Breakdown</h3>}>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-ink-500">Job Seekers</span><span className="font-mono tabular-nums font-medium text-ink-900">{stats?.users?.jobSeekers || 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-ink-500">Employers</span><span className="font-mono tabular-nums font-medium text-ink-900">{stats?.users?.employers || 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-ink-500">Admins</span><span className="font-mono tabular-nums font-medium text-ink-900">{stats?.users?.admins || 0}</span></div>
            <div className="flex justify-between border-t border-ink-200 pt-2"><span className="text-sm text-ink-500">New this week</span><span className="font-mono tabular-nums font-medium text-verdant-600">+{stats?.growth?.newUsersThisWeek || 0}</span></div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
