import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import type { User } from '../../types';

interface Props { user: User | null; isOpen: boolean; onClose: () => void; }

export default function UserDetailModal({ user, isOpen, onClose }: Props) {
  if (!user) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatar || undefined} size="lg" />
          <div>
            <h3 className="font-heading font-semibold">{user.name}</h3>
            <p className="text-sm font-mono text-ink-500">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="label">Role</span><div className="mt-1"><Badge>{user.role}</Badge></div></div>
          <div><span className="label">Status</span><div className="mt-1"><Badge variant={user.isActive ? 'success' : 'error'}>{user.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge></div></div>
          {user.location && <div><span className="label">Location</span><p className="mt-1">{user.location}</p></div>}
          {user.phone && <div><span className="label">Phone</span><p className="mt-1 font-mono">{user.phone}</p></div>}
        </div>
        {user.bio && <div><span className="label">Bio</span><p className="text-sm mt-1">{user.bio}</p></div>}
        <p className="text-xs font-mono text-ink-400">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
    </Modal>
  );
}
