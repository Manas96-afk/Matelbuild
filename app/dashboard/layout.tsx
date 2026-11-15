'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { Header } from '../../components/dashboard/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth Redirect Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Close sidebar on path changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
        {/* Premium loader spinner */}
        <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 tracking-wider uppercase animate-pulse">
          Loading Workspace...
        </span>
      </div>
    );
  }

  if (!user) {
    return null; // Let the redirect trigger in useEffect
  }

  // Resolve Header title based on route
  const getHeaderTitle = () => {
    if (pathname === '/dashboard') return 'Architect Dashboard';
    if (pathname.includes('/projects/new')) return 'New Estimate Builder';
    if (pathname.includes('/settings')) return 'System Settings';
    if (pathname.includes('/projects/')) return 'Project Estimation';
    return 'MatelBuild';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--cream)] grain">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} title={getHeaderTitle()} />

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none">
          <div className="max-w-7xl mx-auto w-full animate-fade-in print:p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
