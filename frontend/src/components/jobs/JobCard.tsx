import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import type { Job } from '../../types';

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract', INTERNSHIP: 'Internship', REMOTE: 'Remote',
};

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="block border border-ink-200 rounded-md p-5 hover:border-ink-400 transition-colors bg-surface-raised">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-heading font-semibold text-ink-900">{job.title}</h3>
          <p className="text-sm text-ink-500">{job.employer?.companyProfile?.companyName || 'Company'}</p>
        </div>
        <Badge>{typeLabels[job.employmentType] || job.employmentType}</Badge>
      </div>
      <div className="flex flex-wrap gap-3 text-xs font-mono text-ink-400 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
        {(job.salaryMin || job.salaryMax) && (
          <span>${job.salaryMin?.toLocaleString()}{job.salaryMax ? ` – $${job.salaryMax.toLocaleString()}` : '+'}</span>
        )}
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(job.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {job.jobSkills?.slice(0, 5).map((js) => (
          <span key={js.id} className="px-1.5 py-0.5 border border-ink-200 text-ink-600 rounded-sm text-xs font-mono">{js.skill?.name}</span>
        ))}
        {(job.jobSkills?.length || 0) > 5 && <span className="text-xs font-mono text-ink-300">+{(job.jobSkills?.length || 0) - 5}</span>}
      </div>
    </Link>
  );
}
