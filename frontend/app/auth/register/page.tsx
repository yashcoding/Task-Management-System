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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created! Welcome aboard.');
      router.push('/dashboard');
    } catch (err) {
      const msg = (err as AxiosError<{ message: string }>)?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="card p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <CheckSquare size={18} className="text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">TaskFlow</span>
        </div>

        <h1 className="text-2xl font-semibold mb-1 tracking-tight">Create account</h1>
        <p className="text-sm text-muted mb-7">Get started for free</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-widest mb-1.5">Full name</label>
            <input {...register('name')} placeholder="Alex Johnson" />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-widest mb-1.5">Email</label>
            <input {...register('email')} type="email" placeholder="you@example.com" />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-widest mb-1.5">Password</label>
            <input {...register('password')} type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" />
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent-light hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
