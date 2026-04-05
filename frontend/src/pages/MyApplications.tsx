import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { applicationApi } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Application } from '../types';

const statusVariants: Record<string, 'info' | 'warning' | 'success' | 'error' | 'neutral'> = {
  PENDING: 'info', REVIEWED: 'warning', SHORTLISTED: 'success', ACCEPTED: 'success', REJECTED: 'error',
};

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadApplications(); }, [page, statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data: res } = await applicationApi.getMy({ page, limit: 10, status: statusFilter || undefined });
      setApplications(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm('Withdraw this application?')) return;
    try {
      await applicationApi.withdraw(id);
      toast.success('Application withdrawn');
      loadApplications();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-2xl font-bold text-ink-900">My Applications</h1>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[{ value: '', label: 'All Status' }, { value: 'PENDING', label: 'Pending' }, { value: 'REVIEWED', label: 'Reviewed' }, { value: 'SHORTLISTED', label: 'Shortlisted' }, { value: 'ACCEPTED', label: 'Accepted' }, { value: 'REJECTED', label: 'Rejected' }]}
          className="w-40" />
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> :
        applications.length === 0 ? (
          <EmptyState title="No applications yet" description="Start applying to jobs to see them here" action={<Link to="/jobs"><Button>Browse Jobs</Button></Link>} />
        ) : (
          <>
            <div className="space-y-3">
              {applications.map((app) => (
                <Card key={app.id}>
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <Link to={`/jobs/${app.jobId}`} className="font-heading font-semibold text-ink-900 hover:text-verdant-600 transition-colors">{app.job?.title}</Link>
                      <p className="text-sm text-ink-500">{app.job?.employer?.companyProfile?.companyName} · {app.job?.location}</p>
                      <p className="text-xs text-ink-400 mt-1">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariants[app.status]}>{app.status}</Badge>
                      {['PENDING', 'REVIEWED'].includes(app.status) && (
                        <Button variant="ghost" size="sm" onClick={() => handleWithdraw(app.id)}>Withdraw</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
    </DashboardLayout>
  );
}
