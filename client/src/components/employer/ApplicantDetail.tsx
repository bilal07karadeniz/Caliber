import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import type { Application } from '../../types';

export default function ApplicantDetail({ application }: { application: Application }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={application.user?.name || ''} size="lg" />
        <div>
          <h3 className="font-heading font-semibold text-lg">{application.user?.name}</h3>
          <p className="text-sm font-mono text-ink-500">{application.user?.email}</p>
          {application.user?.location && <p className="text-sm text-ink-400">{application.user.location}</p>}
        </div>
      </div>
      {application.user?.bio && <p className="text-sm text-ink-700 font-body">{application.user.bio}</p>}
      {application.coverLetter && (
        <div>
          <p className="label mb-1">Cover Letter</p>
          <p className="text-sm text-ink-600 whitespace-pre-wrap font-body">{application.coverLetter}</p>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="label">Status</span>
        <Badge>{application.status}</Badge>
      </div>
    </div>
  );
}
