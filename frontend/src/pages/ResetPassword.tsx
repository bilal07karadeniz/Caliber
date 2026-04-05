import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch { toast.error('Invalid or expired reset link'); }
    setLoading(false);
  };

  if (!token) return <AuthLayout><p className="text-ink-500">Invalid reset link.</p><Link to="/forgot-password" className="text-verdant-600 hover:underline">Request a new one</Link></AuthLayout>;

  return (
    <AuthLayout>
      <h1 className="font-heading text-2xl font-bold text-ink-900 mb-2">Set New Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars, upper + lower + number" required />
        <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
        <Button type="submit" isLoading={loading} className="w-full">Reset Password</Button>
      </form>
    </AuthLayout>
  );
}
