'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CheckSquare, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { AxiosError } from 'axios';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'demo@taskflow.io', password: 'Password1' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      const msg = (err as AxiosError<{ message: string }>)?.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="card p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <CheckSquare size={18} className="text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">TaskFlow</span>
        </div>

        <h1 className="text-2xl font-semibold mb-1 tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted mb-7">Sign in to manage your tasks</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-widest mb-1.5">Email</label>
            <input {...register('email')} type="email" placeholder="you@example.com" />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-widest mb-1.5">Password</label>
            <input {...register('password')} type="password" placeholder="••••••••" />
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          No account?{' '}
          <Link href="/auth/register" className="text-accent-light hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
