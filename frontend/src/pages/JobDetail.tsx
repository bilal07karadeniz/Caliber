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
  if (!job) return <MainLayout><div className="text-center py-20 text-ink-500">Job not found</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-surface-raised border border-ink-200 rounded-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-ink-900">{job.title}</h1>
              <p className="text-ink-500">{job.employer?.companyProfile?.companyName || job.employer?.name || 'Company'}</p>
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

          <div className="flex flex-wrap gap-4 text-sm text-ink-500 mb-6">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
            <span className="flex items-center gap-1"><Building className="w-4 h-4" />{job.employmentType.replace('_', ' ')}</span>
            {(job.salaryMin || job.salaryMax) && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-mono tabular-nums">
                  {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : job.salaryMin ? `From $${job.salaryMin.toLocaleString()}` : `Up to $${job.salaryMax?.toLocaleString()}`}
                </span>
              </span>
            )}
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(job.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /><span className="font-mono tabular-nums">{job._count?.applications || 0}</span> applicants</span>
          </div>

          <div className="mb-6">
            <p className="label mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.jobSkills?.map((js) => (
                <span key={js.id} className="inline-flex items-center px-2.5 py-0.5 border border-ink-200 rounded-md font-mono text-xs text-ink-700">
                  {js.skill?.name} {js.requiredLevel && <span className="text-ink-400 ml-1">L{js.requiredLevel}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card header={<h3 className="font-heading font-semibold text-ink-900">Job Description</h3>}>
              <div className="prose prose-sm max-w-none text-ink-700 whitespace-pre-wrap font-body">{job.description}</div>
            </Card>
            <Card header={<h3 className="font-heading font-semibold text-ink-900">Requirements</h3>}>
              <div className="prose prose-sm max-w-none text-ink-700 whitespace-pre-wrap font-body">{job.requirements}</div>
            </Card>
          </div>

          <div>
            <Card header={<h3 className="font-heading font-semibold text-ink-900">Company Info</h3>}>
              <div className="space-y-3 text-sm">
                <p><span className="text-ink-500">Company:</span> {job.employer?.companyProfile?.companyName || job.employer?.name || 'Company'}</p>
                {job.employer?.companyProfile?.industry && <p><span className="text-ink-500">Industry:</span> {job.employer.companyProfile.industry}</p>}
                {job.employer?.companyProfile?.size && <p><span className="text-ink-500">Size:</span> {job.employer.companyProfile.size}</p>}
                {job.employer?.companyProfile?.website && (
                  <p><span className="text-ink-500">Website:</span> <a href={job.employer.companyProfile.website} target="_blank" rel="noopener" className="text-verdant-600 hover:underline underline-offset-4 transition-colors">{job.employer.companyProfile.website}</a></p>
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
