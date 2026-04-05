import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [resending, setResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try { await login(data.email, data.password); toast.success('Welcome back'); navigate('/dashboard'); }
    catch (err: any) {
      if (err.response?.data?.data?.emailVerified === false) {
        setUnverifiedEmail(data.email);
        toast.error('Please verify your email before logging in');
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try { await authApi.resendVerification(unverifiedEmail); toast.success('Verification email sent'); }
    catch { toast.error('Failed to resend'); }
    setResending(false);
  };

  return (
    <AuthLayout>
      <h2 className="font-heading text-3xl font-bold text-ink-900 mb-1">Sign in</h2>
      <p className="text-ink-500 mb-8">Enter your credentials to continue.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="you@example.com" />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} placeholder="••••••••" />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-verdant-600 hover:underline underline-offset-4">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" size="lg" isLoading={loading}>Sign In</Button>
      </form>
      {unverifiedEmail && (
        <div className="mt-4 p-3 border border-amber-300 bg-amber-50 rounded-md text-sm text-ink-700">
          <p>Your email is not verified. Check your inbox or{' '}
            <button onClick={handleResend} disabled={resending} className="text-verdant-600 hover:underline underline-offset-4 font-medium">
              {resending ? 'Sending...' : 'resend verification email'}
            </button>.
          </p>
        </div>
      )}
      <p className="text-sm text-ink-500 mt-6">
        No account? <Link to="/register" className="text-verdant-600 hover:underline underline-offset-4 font-medium">Register</Link>
      </p>
    </AuthLayout>
  );
}
