'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { BlueprintDrawing, ScanLine, BlueprintGrid } from '@/components/engineering';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setErr(res.error || 'Authentication failed');
      }
    } catch (e: any) {
      setErr(e.message || 'Auth failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — blueprint stage */}
      <div className="blueprint-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-10 text-white">
        <BlueprintGrid className="opacity-60" />
        <ScanLine className="absolute inset-x-0 top-0 h-px" />

        {/* floating registration crosshairs */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" aria-hidden="true">
          <g stroke="rgba(120,160,255,0.5)" strokeWidth="1" fill="none">
            <path d="M40 40 H70 M40 40 V70" />
            <path d="M40 40 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" />
          </g>
          <circle cx="40" cy="40" r="4" fill="none" stroke="rgba(120,160,255,0.6)" />
          <circle cx="40" cy="40" r="10" fill="none" stroke="rgba(120,160,255,0.3)" />
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
              <rect x="1" y="1" width="30" height="30" rx="8" fill="#1f57e0" />
              <path d="M9.5 22V10.5h4.6c2.6 0 4.2 1.4 4.2 3.7 0 1.7-1 3-2.7 3.4 1.9.3 3.2 1.6 3.2 3.6 0 2.5-1.9 4.3-4.8 4.3H9.5Zm2.4-1.9h2.2c1.4 0 2.3-.7 2.3-1.9s-.8-1.9-2.3-1.9h-2.2v3.8Zm0-5.7h2c1.3 0 2.1-.6 2.1-1.7s-.8-1.7-2.1-1.7h-2v3.4Z" fill="#fff" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">MatelBuild</span>
        </div>

        <div className="relative z-10 my-8 flex-1">
          <BlueprintDrawing className="mx-auto max-w-md drop-shadow-[0_0_30px_rgba(31,87,224,0.35)]" />
        </div>

        <div className="relative z-10 space-y-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest2 text-blue-200/80">Drawing No. BR-001 · Rev C</p>
            <h2 className="mt-2 max-w-md font-display text-2xl font-semibold leading-snug">
              Estimate like a chartered engineer.
            </h2>
            <p className="mt-2 max-w-md text-sm text-blue-100/70">
              Every figure traced to a transparent formula — never guessed by a model.
            </p>
          </div>
          <div className="grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-4">
            {[
              ['99.4%', 'Reproducible'],
              ['₹0', 'AI-calc'],
              ['3', 'Building types'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="font-display text-xl font-semibold text-white">{v}</div>
                <div className="text-[11px] uppercase tracking-widest2 text-blue-200/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — auth form */}
      <div className="relative flex items-center justify-center bg-[var(--cream)] px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade opacity-70" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <span aria-hidden="true">←</span> Back to home
          </Link>

          <span className="eyebrow">Sign in to MatelBuild</span>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tightest text-gradient">
            Welcome back, builder.
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Access your estimates, BOQs and projects.
          </p>

          <div className="mt-7 flex gap-1.5 rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_70%,transparent)] p-1">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setErr('');
                  if (m === 'signup') router.push('/signup');
                }}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
                  mode === 'login' ? 'bg-brand-600 text-white shadow-soft' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                }`}
              >
                {m === 'login' ? 'Login' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleEmail} className="mt-6 space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@matelbuild.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {err && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {err}
              </p>
            )}

            <Button variant="glow" type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-[var(--ink-soft)]">
            <span className="font-semibold text-[var(--ink)]">Demo credentials:</span> Use <code className="font-mono text-brand-600">admin@matelbuild.com</code> and any password.
          </div>
        </div>
      </div>
    </div>
  );
}
