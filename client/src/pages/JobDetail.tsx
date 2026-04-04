import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Building, Users, CheckCircle } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ApplyModal from '../components/jobs/ApplyModal';
import { jobApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Job } from '../types';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const { data: res } = await jobApi.get(id!);
      setJob(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <MainLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></MainLayout>;
  if (!job) return <MainLayout><div className="text-center py-20 text-gray-500">Job not found</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-500">{job.employer?.companyProfile?.companyName || 'Company'}</p>
            </div>
            <div className="flex gap-2">
              {isAuthenticated && user?.role === 'JOB_SEEKER' && (
                applied ? (
                  <Button variant="secondary" disabled><CheckCircle className="w-4 h-4 mr-2" /> Applied</Button>
                ) : (
                  <Button onClick={() => setShowApply(true)}>Apply Now</Button>
                )
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
            <span className="flex items-center gap-1"><Building className="w-4 h-4" />{job.employmentType.replace('_', ' ')}</span>
            {(job.salaryMin || job.salaryMax) && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : job.salaryMin ? `From $${job.salaryMin.toLocaleString()}` : `Up to $${job.salaryMax?.toLocaleString()}`}
              </span>
            )}
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(job.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{job._count?.applications || 0} applicants</span>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.jobSkills?.map((js) => (
                <Badge key={js.id} variant="info">{js.skill?.name} {js.requiredLevel && `(Level ${js.requiredLevel})`}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card header={<h3 className="font-semibold">Job Description</h3>}>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{job.description}</div>
            </Card>
            <Card header={<h3 className="font-semibold">Requirements</h3>}>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{job.requirements}</div>
            </Card>
          </div>

          <div>
            <Card header={<h3 className="font-semibold">Company Info</h3>}>
              <div className="space-y-3 text-sm">
                <p><span className="text-gray-500">Company:</span> {job.employer?.companyProfile?.companyName}</p>
                {job.employer?.companyProfile?.industry && <p><span className="text-gray-500">Industry:</span> {job.employer.companyProfile.industry}</p>}
                {job.employer?.companyProfile?.size && <p><span className="text-gray-500">Size:</span> {job.employer.companyProfile.size}</p>}
                {job.employer?.companyProfile?.website && (
                  <p><span className="text-gray-500">Website:</span> <a href={job.employer.companyProfile.website} target="_blank" rel="noopener" className="text-primary-600 hover:underline">{job.employer.companyProfile.website}</a></p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {id && <ApplyModal isOpen={showApply} onClose={() => setShowApply(false)} jobId={id} jobTitle={job.title} onApplied={() => setApplied(true)} />}
    </MainLayout>
  );
}
