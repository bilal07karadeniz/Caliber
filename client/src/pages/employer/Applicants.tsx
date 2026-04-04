import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { applicationApi } from '../../services/api';
import toast from 'react-hot-toast';
import type { Application } from '../../types';

const statusVariants: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  PENDING: 'info', REVIEWED: 'warning', SHORTLISTED: 'success', ACCEPTED: 'success', REJECTED: 'error',
};

const nextActions: Record<string, { label: string; status: string; variant: 'primary' | 'secondary' | 'danger' }[]> = {
  PENDING: [{ label: 'Review', status: 'REVIEWED', variant: 'secondary' }, { label: 'Reject', status: 'REJECTED', variant: 'danger' }],
  REVIEWED: [{ label: 'Shortlist', status: 'SHORTLISTED', variant: 'primary' }, { label: 'Reject', status: 'REJECTED', variant: 'danger' }],
  SHORTLISTED: [{ label: 'Accept', status: 'ACCEPTED', variant: 'primary' }, { label: 'Reject', status: 'REJECTED', variant: 'danger' }],
};

export default function Applicants() {
  const { id } = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadApplicants(); }, [id]);

  const loadApplicants = async () => {
    try {
      const { data: res } = await applicationApi.getForJob(id!, { limit: 50 });
      setApplications(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (appId: string, status: string) => {
    try {
      await applicationApi.updateStatus(appId, status);
      toast.success(`Status updated to ${status}`);
      loadApplicants();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to="/employer/jobs" className="text-sm text-primary-600 hover:underline mb-2 inline-block">&larr; Back to Jobs</Link>
        <h1 className="text-2xl font-bold">Applicants ({applications.length})</h1>
      </div>

      {applications.length === 0 ? (
        <EmptyState title="No applicants yet" description="Applicants will appear here once candidates apply" />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar name={app.user?.name || 'User'} src={app.user?.avatar || undefined} />
                  <div>
                    <p className="font-semibold">{app.user?.name}</p>
                    <p className="text-sm text-gray-500">{app.user?.email} {app.user?.location && `· ${app.user.location}`}</p>
                    <p className="text-xs text-gray-400 mt-1">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                    {app.coverLetter && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{app.coverLetter}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={statusVariants[app.status]}>{app.status}</Badge>
                  <div className="flex gap-1">
                    {(nextActions[app.status] || []).map((action) => (
                      <Button key={action.status} variant={action.variant} size="sm" onClick={() => updateStatus(app.id, action.status)}>
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
