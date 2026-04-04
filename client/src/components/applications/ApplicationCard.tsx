import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import type { Application } from '../../types';

const statusColors: Record<string, string> = {
  PENDING: 'border-l-ink-400', REVIEWED: 'border-l-saffron-500', SHORTLISTED: 'border-l-verdant-500', ACCEPTED: 'border-l-verdant-500', REJECTED: 'border-l-signal-low',
};
const statusVariants: Record<string, 'info' | 'warning' | 'success' | 'error' | 'neutral'> = {
  PENDING: 'neutral', REVIEWED: 'warning', SHORTLISTED: 'success', ACCEPTED: 'success', REJECTED: 'error',
};

export default function ApplicationCard({ application }: { application: Application }) {
  return (
    <div className={`border border-ink-200 rounded-md p-4 border-l-3 ${statusColors[application.status]} bg-surface-raised`}>
      <div className="flex justify-between items-start">
        <div>
          <Link to={`/jobs/${application.jobId}`} className="font-heading font-semibold text-ink-900 hover:text-verdant-600 transition-colors">{application.job?.title}</Link>
          <p className="text-sm text-ink-500">{application.job?.employer?.companyProfile?.companyName} · {application.job?.location}</p>
          <p className="text-xs font-mono text-ink-400 mt-1">{new Date(application.appliedAt).toLocaleDateString()}</p>
        </div>
        <Badge variant={statusVariants[application.status]}>{application.status}</Badge>
      </div>
    </div>
  );
}
