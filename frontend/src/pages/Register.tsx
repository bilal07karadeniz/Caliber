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
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Uppercase, lowercase, and number required'),
  confirmPassword: z.string(),
  role: z.enum(['JOB_SEEKER', 'EMPLOYER']),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'JOB_SEEKER' } });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password, data.role);
      const { user } = useAuthStore.getState();
      if (user?.emailVerified === false) {
        toast.success('Account created! Check your email to verify your account.');
        navigate('/login');
      } else {
        toast.success('Account created');
        navigate('/dashboard');
      }
    }
    catch (err: any) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <h2 className="font-heading text-3xl font-bold text-ink-900 mb-1">Create account</h2>
      <p className="text-ink-500 mb-8">Join the signal network.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label="Full Name" {...register('name')} error={errors.name?.message} placeholder="Jane Doe" />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="you@example.com" />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} placeholder="Min 8 chars, upper + lower + number" />
        <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} placeholder="••••••••" />
        <div>
          <p className="label mb-2">I want to</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-3 border border-ink-200 rounded-md cursor-pointer hover:border-ink-400 transition-colors has-[:checked]:border-verdant-500 has-[:checked]:bg-signal-high-bg">
              <input type="radio" value="JOB_SEEKER" {...register('role')} className="accent-verdant-500" />
              <span className="text-sm font-heading">Find work</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-ink-200 rounded-md cursor-pointer hover:border-ink-400 transition-colors has-[:checked]:border-verdant-500 has-[:checked]:bg-signal-high-bg">
              <input type="radio" value="EMPLOYER" {...register('role')} className="accent-verdant-500" />
              <span className="text-sm font-heading">Hire talent</span>
            </label>
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg" isLoading={loading}>Create Account</Button>
      </form>
      <p className="text-sm text-ink-500 mt-6">
        Have an account? <Link to="/login" className="text-verdant-600 hover:underline underline-offset-4 font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
