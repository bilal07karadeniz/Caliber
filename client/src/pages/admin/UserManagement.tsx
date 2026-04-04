import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import { userApi } from '../../services/api';
import toast from 'react-hot-toast';
import type { User } from '../../types';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { const t = setTimeout(loadUsers, 300); return () => clearTimeout(t); }, [search, role, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: res } = await userApi.getAllUsers({ search, role: role || undefined, page, limit: 15 });
      setUsers(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggleActive = async (id: string) => {
    try {
      await userApi.toggleActive(id);
      toast.success('User status updated');
      loadUsers();
    } catch { toast.error('Failed'); }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="flex gap-3 mb-6">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
        <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
          options={[{ value: '', label: 'All Roles' }, { value: 'JOB_SEEKER', label: 'Job Seeker' }, { value: 'EMPLOYER', label: 'Employer' }, { value: 'ADMIN', label: 'Admin' }]} className="w-40" />
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={u.name} src={u.avatar || undefined} size="sm" /><span className="text-sm font-medium">{u.name}</span></div></td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{u.email}</td>
                    <td className="px-4 py-3"><Badge variant="info">{u.role.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={u.isActive ? 'success' : 'error'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={() => toggleActive(u.id)}>{u.isActive ? 'Deactivate' : 'Activate'}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
}
