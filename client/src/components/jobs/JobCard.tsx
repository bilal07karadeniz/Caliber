import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import Badge from '../ui/Badge';
import type { Job } from '../../types';

const typeLabels: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract',
  INTERNSHIP: 'Internship', REMOTE: 'Remote',
};

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.employer?.companyProfile?.companyName || 'Company'}</p>
        </div>
        <Badge variant="info">{typeLabels[job.employmentType] || job.employmentType}</Badge>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
        {(job.salaryMin || job.salaryMax) && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : job.salaryMin ? `From $${job.salaryMin.toLocaleString()}` : `Up to $${job.salaryMax?.toLocaleString()}`}
          </span>
        )}
        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(job.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {job.jobSkills?.slice(0, 5).map((js) => (
          <span key={js.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{js.skill?.name}</span>
        ))}
        {(job.jobSkills?.length || 0) > 5 && <span className="text-xs text-gray-400">+{(job.jobSkills?.length || 0) - 5} more</span>}
      </div>
    </Link>
  );
}
