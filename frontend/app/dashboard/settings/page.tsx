'use client';

import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { User, Mail, Calendar } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-bg-2">
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl">
        <div className="card p-6 space-y-5">
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest">Profile</h2>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-lg font-semibold">
              {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'}
            </div>
            <div>
              <p className="font-medium text-base">{user?.name}</p>
              <p className="text-sm text-muted">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User size={14} className="text-muted shrink-0" />
              <span className="text-muted w-24">Name</span>
              <span>{user?.name ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={14} className="text-muted shrink-0" />
              <span className="text-muted w-24">Email</span>
              <span>{user?.email ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={14} className="text-muted shrink-0" />
              <span className="text-muted w-24">Joined</span>
              <span className="font-mono text-xs">
                {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6 mt-4 space-y-3">
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest">API</h2>
          <div className="text-sm space-y-1">
            <p className="text-muted">Backend URL</p>
            <code className="text-xs bg-bg-3 px-3 py-2 rounded-lg block text-accent-light font-mono">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
            </code>
          </div>
        </div>
      </div>
    </>
  );
}
