import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import JobCard from '../components/jobs/JobCard';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { jobApi } from '../services/api';
import type { Job } from '../types';

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    const timer = setTimeout(loadJobs, 300);
    return () => clearTimeout(timer);
  }, [search, location, employmentType, page, sortBy]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data: res } = await jobApi.getAll({
        search, location, employmentType: employmentType || undefined,
        page, limit: 12, sortBy, sortOrder: 'desc',
      });
      setJobs(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Find Jobs</h1>

        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Search jobs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Location..." value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }} />
            <Select value={employmentType} onChange={(e) => { setEmploymentType(e.target.value); setPage(1); }}
              options={[{ value: '', label: 'All Types' }, { value: 'FULL_TIME', label: 'Full Time' }, { value: 'PART_TIME', label: 'Part Time' }, { value: 'CONTRACT', label: 'Contract' }, { value: 'INTERNSHIP', label: 'Internship' }, { value: 'REMOTE', label: 'Remote' }]} />
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              options={[{ value: 'createdAt', label: 'Most Recent' }, { value: 'salaryMax', label: 'Highest Salary' }, { value: 'title', label: 'Title' }]} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs found" description="Try adjusting your search filters" />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </MainLayout>
  );
}
