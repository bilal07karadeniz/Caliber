import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import type { Application } from '../../types';

const statusVariants: Record<string, 'info' | 'warning' | 'success' | 'error' | 'neutral'> = {
  PENDING: 'neutral', REVIEWED: 'warning', SHORTLISTED: 'success', ACCEPTED: 'success', REJECTED: 'error',
};

export default function ApplicantCard({ application, onStatusChange }: { application: Application; onStatusChange: (id: string, status: string) => void }) {
  return (
    <div className="border border-ink-200 rounded-md p-4 bg-surface-raised">
      <div className="flex items-start gap-3">
        <Avatar name={application.user?.name || 'User'} src={application.user?.avatar || undefined} />
        <div className="flex-1">
          <p className="font-heading font-semibold">{application.user?.name}</p>
          <p className="text-sm font-mono text-ink-500">{application.user?.email}</p>
          <p className="text-xs font-mono text-ink-400">Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={statusVariants[application.status]}>{application.status}</Badge>
          <div className="flex gap-1">
            {application.status === 'PENDING' && <Button size="sm" variant="secondary" onClick={() => onStatusChange(application.id, 'REVIEWED')}>Review</Button>}
            {application.status === 'REVIEWED' && <Button size="sm" onClick={() => onStatusChange(application.id, 'SHORTLISTED')}>Shortlist</Button>}
            {application.status === 'SHORTLISTED' && <Button size="sm" onClick={() => onStatusChange(application.id, 'ACCEPTED')}>Accept</Button>}
            {!['REJECTED', 'ACCEPTED'].includes(application.status) && <Button size="sm" variant="danger" onClick={() => onStatusChange(application.id, 'REJECTED')}>Reject</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
