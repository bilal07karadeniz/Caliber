import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Users, Trash2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { jobApi } from '../../services/api';
import toast from 'react-hot-toast';
import type { Job } from '../../types';

export default function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const { data: res } = await jobApi.getMyListings({ limit: 50 });
      setJobs(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this job posting?')) return;
    try {
      await jobApi.delete(id);
      toast.success('Job deactivated');
      loadJobs();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Job Postings</h1>
        <Link to="/employer/jobs/new"><Button><PlusCircle className="w-4 h-4 mr-2" /> Create Job</Button></Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No job postings" description="Create your first job posting to start receiving applications" action={<Link to="/employer/jobs/new"><Button>Post a Job</Button></Link>} />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <Link to={`/jobs/${job.id}`} className="font-semibold hover:text-primary-600">{job.title}</Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{job.location}</span>
                    <span>{job._count?.applications || 0} applicants</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={job.isActive ? 'success' : 'neutral'}>{job.isActive ? 'Active' : 'Inactive'}</Badge>
                  <Link to={`/employer/jobs/${job.id}/applicants`}><Button variant="ghost" size="sm"><Users className="w-4 h-4" /></Button></Link>
                  <Link to={`/employer/jobs/${job.id}/edit`}><Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button></Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(job.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
