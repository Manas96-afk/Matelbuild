'use client';

import React from 'react';
import { Menu, Cloud, CloudOff, User } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { Logo } from '../logo';
import Link from 'next/link';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { user, isSupabaseMode } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_80%,transparent)] px-6 backdrop-blur-xl transition-colors">
      {/* Mobile Hamburger & Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="rounded-xl p-2 text-[var(--ink-soft)] hover:bg-[var(--cream-2)] hover:text-[var(--ink)] focus:outline-none lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="lg:hidden">
          <Logo showWordmark={false} />
        </Link>
        <div>
          <h1 className="font-display text-lg font-semibold tracking-tight text-[var(--ink)]">{title}</h1>
        </div>
      </div>

      {/* Database Mode Badge, Alerts, and Profile */}
      <div className="flex items-center space-x-4">
        {/* DB Connection Badge */}
        <div className="hidden sm:flex items-center">
          {isSupabaseMode ? (
            <span className="eyebrow border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Cloud className="h-3.5 w-3.5 text-emerald-500" />
              <span>Supabase Connected</span>
            </span>
          ) : (
            <span className="eyebrow border-[var(--line)] bg-[var(--cream-2)] text-[var(--ink-soft)]">
              <CloudOff className="h-3.5 w-3.5 text-[var(--ink-soft)]" />
              <span>LocalStorage Mode</span>
            </span>
          )}
        </div>

        {/* Separator */}
        <div className="hidden h-4 w-px bg-[var(--line)] sm:block" />

        {/* Profile Card */}
        <div className="flex items-center space-x-3">
          <div className="hidden text-right md:flex md:flex-col">
            <span className="text-xs font-semibold text-[var(--ink)] leading-tight">
              {user?.name || 'Architect User'}
            </span>
            <span className="text-[11px] text-[var(--ink-soft)] font-mono">
              {user?.email || 'user@example.com'}
            </span>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--paper)] text-xs font-bold text-[var(--ink)] shadow-sm">
            {user?.name ? getInitials(user.name) : <User className="h-4 w-4 text-[var(--ink-soft)]" />}
          </div>
        </div>
      </div>
    </header>
  );
}
