'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  X, 
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
  Users,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { Logo } from '../logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  ];

  const systemNavigation = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/projects');
    }
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--ink)]/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-45 flex w-72 flex-col justify-between border-r border-[var(--line)] bg-[var(--paper)] transition-transform duration-300 ease-in-out lg:static lg:h-screen lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top Header Logo */}
        <div>
          <div className="flex h-16 items-center justify-between border-b border-[var(--line)] px-6">
            <Link href="/dashboard" onClick={onClose}>
              <Logo />
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--ink-soft)] hover:bg-[var(--cream-2)] hover:text-[var(--ink)] focus:outline-none lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="max-h-[calc(100vh-8rem)] overflow-y-auto p-4 space-y-7">
            {/* Core Workspace */}
            <div className="space-y-1">
              <span className="mb-2 block px-3 font-mono text-[10px] uppercase tracking-widest2 text-[var(--ink-soft)] font-semibold">
                Workspace
              </span>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 group',
                      active
                        ? 'bg-brand-600 text-white shadow-soft'
                        : 'text-[var(--ink-soft)] hover:bg-[var(--cream-2)] hover:text-[var(--ink)]'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={cn('h-4.5 w-4.5', active ? 'text-white' : 'text-[var(--ink-soft)] group-hover:text-[var(--ink)]')} />
                      <span>{item.name}</span>
                    </div>
                    {active && <ChevronRight className="h-4 w-4 text-white/80" />}
                  </Link>
                );
              })}
            </div>

            {/* System */}
            <div className="space-y-1">
              <span className="mb-2 block px-3 font-mono text-[10px] uppercase tracking-widest2 text-[var(--ink-soft)] font-semibold">
                System
              </span>
              {systemNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 group',
                      active
                        ? 'bg-brand-600 text-white shadow-soft'
                        : 'text-[var(--ink-soft)] hover:bg-[var(--cream-2)] hover:text-[var(--ink)]'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={cn('h-4.5 w-4.5', active ? 'text-white' : 'text-[var(--ink-soft)] group-hover:text-[var(--ink)]')} />
                      <span>{item.name}</span>
                    </div>
                    {active && <ChevronRight className="h-4 w-4 text-white/80" />}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="border-t border-[var(--line)] p-4">
          <button
            onClick={() => logout()}
            className="flex w-full items-center space-x-3 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="h-4.5 w-4.5 text-[var(--ink-soft)] group-hover:text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
