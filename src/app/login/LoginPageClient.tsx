'use client';

import { useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

type Role = 'admin' | 'installer' | 'homeowner' | '';

function callbackUrlForRole(role: Role): string {
  if (role === 'admin') return '/admin';
  if (role === 'installer') return '/installer/dashboard';
  if (role === 'homeowner') return '/homeowner/dashboard';
  return '/';
}

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeSearchParams = searchParams ?? new URLSearchParams();

  const role = (safeSearchParams.get('role') || '') as Role;
  const next = safeSearchParams.get('next');

  const callbackUrl = useMemo(() => {
    if (next && next.startsWith('/')) return next;
    return callbackUrlForRole(role);
  }, [next, role]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      // If a role is supplied, enforce role-specific login server-side.
      ...(role ? { role } : {}),
      callbackUrl,
    });

    setSubmitting(false);

    if (!result) {
      setError('Login failed');
      return;
    }

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(result.url || callbackUrl);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-background shadow-neu-outset p-6">
        <h1 className="text-title mb-1">Login</h1>
        <p className="text-caption text-muted-foreground mb-6">
          Sign in to your account{role ? ` (${role})` : ''}.
        </p>

        {error ? (
          <div className="mb-4 rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-caption">{error}</div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-caption text-muted-foreground">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl bg-background shadow-neu-inset px-4 py-3 outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="text-caption text-muted-foreground">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl bg-background shadow-neu-inset px-4 py-3 outline-none"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary text-primary-foreground shadow-neu-outset px-4 py-3 disabled:opacity-70"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
