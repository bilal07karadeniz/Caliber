import Badge from '../ui/Badge';
import Button from '../ui/Button';
import type { Job } from '../../types';

interface Props { jobs: Job[]; onAction: (id: string, action: string) => void; }

export default function JobsTable({ jobs, onAction }: Props) {
  return (
    <div className="border border-ink-200 rounded-md overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-ink-900">
            <th className="px-4 py-3 text-left label">Title</th>
            <th className="px-4 py-3 text-left label hidden md:table-cell">Company</th>
            <th className="px-4 py-3 text-left label">Status</th>
            <th className="px-4 py-3 text-left label">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {jobs.map(j => (
            <tr key={j.id} className="hover:bg-surface-sunken transition-colors">
              <td className="px-4 py-3 text-sm font-medium">{j.title}</td>
              <td className="px-4 py-3 text-sm text-ink-500 hidden md:table-cell">{j.employer?.companyProfile?.companyName || '-'}</td>
              <td className="px-4 py-3"><Badge variant={j.isActive ? 'success' : 'neutral'}>{j.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge></td>
              <td className="px-4 py-3 flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onAction(j.id, j.isActive ? 'deactivate' : 'activate')}>{j.isActive ? 'Deactivate' : 'Activate'}</Button>
                <Button variant="ghost" size="sm" className="text-signal-low" onClick={() => onAction(j.id, 'delete')}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
