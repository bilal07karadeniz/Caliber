import { Link } from 'react-router-dom';
import { Edit, Users, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import type { Job } from '../../types';

export default function EmployerJobCard({ job, onDelete }: { job: Job; onDelete: (id: string) => void }) {
  return (
    <div className="border border-ink-200 rounded-md p-4 bg-surface-raised">
      <div className="flex justify-between items-start">
        <div>
          <Link to={`/jobs/${job.id}`} className="font-heading font-semibold hover:text-verdant-600 transition-colors">{job.title}</Link>
          <div className="flex gap-3 mt-1 text-xs font-mono text-ink-400">
            <span>{job.location}</span>
            <span>{job._count?.applications || 0} applicants</span>
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={job.isActive ? 'success' : 'neutral'}>{job.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge>
          <Link to={`/employer/jobs/${job.id}/applicants`}><Button variant="ghost" size="sm"><Users className="w-4 h-4" /></Button></Link>
          <Link to={`/employer/jobs/${job.id}/edit`}><Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button></Link>
          <Button variant="ghost" size="sm" onClick={() => onDelete(job.id)}><Trash2 className="w-4 h-4 text-signal-low" /></Button>
        </div>
      </div>
    </div>
  );
}
