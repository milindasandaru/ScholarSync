'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { DesktopSidebar } from './DesktopSidebar';
import { Menu, Sun } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { role } = useAuthStore();
  const resolvedRole = pathname.startsWith('/lecturer') || pathname.startsWith('/modules') ? 'lecturer' : role;
  const isDashboardPage =
    pathname.startsWith('/student') || pathname.startsWith('/lecturer') || pathname.startsWith('/modules') || pathname === '/ask';

  if (!isDashboardPage) {
    return <div className="min-h-screen w-full bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100">
      <DesktopSidebar role={resolvedRole} />
      <CollapsibleSidebar
        role={resolvedRole}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 pb-16 md:pb-0 flex flex-col min-w-0">
        <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 py-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors md:hidden"
            >
              <Menu className="h-5 w-5 text-slate-300" />
            </button>
            <h1 className="text-lg font-bold">
              <span className="text-blue-500">Scholar</span>
              <span className="text-orange-500">Sync</span>
            </h1>
          </div>
          <button
            className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-300"
            aria-label="Theme"
          >
            <Sun className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
