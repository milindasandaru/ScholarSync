'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useNotificationStore } from '@/lib/store';

export function FlashNotification() {
  const { message, type, clearNotification } = useNotificationStore();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => clearNotification(), 4000);
    return () => clearTimeout(timer);
  }, [message, clearNotification]);

  if (!message) return null;

  return (
    <div
      className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 shadow-lg text-sm font-medium transition-all
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
    >
      {type === 'success' ? (
        <CheckCircle className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      <span>{message}</span>
      <button
        type="button"
        onClick={clearNotification}
        className="ml-2 rounded-full p-0.5 hover:bg-white/20"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
