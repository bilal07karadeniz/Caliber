import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { jobApi, adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import type { Job } from '../../types';

export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { const t = setTimeout(loadJobs, 300); return () => clearTimeout(t); }, [search, page]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data: res } = await jobApi.getAll({ search, page, limit: 15 });
      setJobs(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAction = async (id: string, action: string) => {
    try {
      await adminApi.manageJob(id, action);
      toast.success(`Job ${action}d`);
      loadJobs();
    } catch { toast.error('Failed'); }
  };

  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold text-ink-900 mb-6">Job Management</h1>
      <div className="mb-6">
        <Input placeholder="Search jobs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <>
          <div className="bg-surface-raised border border-ink-200 rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-sunken">
                <tr>
                  <th className="px-4 py-3 text-left label">Title</th>
                  <th className="px-4 py-3 text-left label hidden md:table-cell">Company</th>
                  <th className="px-4 py-3 text-left label hidden md:table-cell">Location</th>
                  <th className="px-4 py-3 text-left label">Status</th>
                  <th className="px-4 py-3 text-left label">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-surface-sunken transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-ink-900">{j.title}</td>
                    <td className="px-4 py-3 text-sm text-ink-500 hidden md:table-cell">{j.employer?.companyProfile?.companyName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-ink-500 hidden md:table-cell">{j.location}</td>
                    <td className="px-4 py-3"><Badge variant={j.isActive ? 'success' : 'neutral'}>{j.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3 space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleAction(j.id, j.isActive ? 'deactivate' : 'activate')}>{j.isActive ? 'Deactivate' : 'Activate'}</Button>
                      <Button variant="ghost" size="sm" className="text-signal-low" onClick={() => { if (confirm('Delete this job?')) handleAction(j.id, 'delete'); }}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
}
