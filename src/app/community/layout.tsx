'use client';

import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50 md:top-6 md:right-8">
        <NotificationBell />
      </div>
      {children}
    </div>
  );
}
