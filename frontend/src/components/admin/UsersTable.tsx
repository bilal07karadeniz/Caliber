import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import type { User } from '../../types';

interface Props { users: User[]; onToggleActive: (id: string) => void; }

export default function UsersTable({ users, onToggleActive }: Props) {
  return (
    <div className="border border-ink-200 rounded-md overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-ink-900">
            <th className="px-4 py-3 text-left label">User</th>
            <th className="px-4 py-3 text-left label hidden md:table-cell">Email</th>
            <th className="px-4 py-3 text-left label">Role</th>
            <th className="px-4 py-3 text-left label">Status</th>
            <th className="px-4 py-3 text-left label">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-surface-sunken transition-colors">
              <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={u.name} src={u.avatar || undefined} size="sm" /><span className="text-sm font-medium">{u.name}</span></div></td>
              <td className="px-4 py-3 text-sm text-ink-500 font-mono hidden md:table-cell">{u.email}</td>
              <td className="px-4 py-3"><Badge>{u.role.replace('_', ' ')}</Badge></td>
              <td className="px-4 py-3"><Badge variant={u.isActive ? 'success' : 'error'}>{u.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge></td>
              <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={() => onToggleActive(u.id)}>{u.isActive ? 'Deactivate' : 'Activate'}</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
