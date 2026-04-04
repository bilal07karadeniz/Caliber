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
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Minimum 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  role: z.enum(['JOB_SEEKER', 'EMPLOYER']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'JOB_SEEKER' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password, data.role);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Create an account</h2>
      <p className="text-gray-500 text-center mb-6">Join AI Match today</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" {...register('name')} error={errors.name?.message} placeholder="John Doe" />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="you@example.com" />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} placeholder="••••••••" />
        <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} placeholder="••••••••" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" value="JOB_SEEKER" {...register('role')} className="text-primary-600" />
              <span className="text-sm">Find a job</span>
            </label>
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" value="EMPLOYER" {...register('role')} className="text-primary-600" />
              <span className="text-sm">Hire talent</span>
            </label>
          </div>
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={loading}>Create Account</Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
