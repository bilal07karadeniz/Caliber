import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('If that email exists, we sent a reset link');
    } catch { toast.error('Something went wrong'); }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <h1 className="font-heading text-2xl font-bold text-ink-900 mb-2">Reset Password</h1>
      {sent ? (
        <div className="space-y-4">
          <p className="text-ink-500 font-body">Check your email for a password reset link. It expires in 1 hour.</p>
          <Link to="/login"><Button variant="outline" className="w-full">Back to Login</Button></Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-ink-500 font-body text-sm">Enter your email and we'll send you a reset link.</p>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Button type="submit" isLoading={loading} className="w-full">Send Reset Link</Button>
          <p className="text-sm text-center"><Link to="/login" className="text-verdant-600 hover:underline underline-offset-4">Back to Login</Link></p>
        </form>
      )}
    </AuthLayout>
  );
}
