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

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try { await login(data.email, data.password); toast.success('Welcome back'); navigate('/dashboard'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <h2 className="font-heading text-3xl font-bold text-ink-900 mb-1">Sign in</h2>
      <p className="text-ink-500 mb-8">Enter your credentials to continue.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="you@example.com" />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} placeholder="••••••••" />
        <Button type="submit" className="w-full" size="lg" isLoading={loading}>Sign In</Button>
      </form>
      <p className="text-sm text-ink-500 mt-6">
        No account? <Link to="/register" className="text-verdant-600 hover:underline underline-offset-4 font-medium">Register</Link>
      </p>
    </AuthLayout>
  );
}
