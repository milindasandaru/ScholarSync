'use client';

import { useEffect, useState } from 'react';

type LiveAnswerRateProps = {
  initialAnsweredPercent: number;
  initialPendingPercent: number;
};

type AnswerRatePayload = {
  answeredPercent: number;
  pendingPercent: number;
};

export function LiveAnswerRate({
  initialAnsweredPercent,
  initialPendingPercent,
}: LiveAnswerRateProps) {
  const [answeredPercent, setAnsweredPercent] = useState(initialAnsweredPercent);
  const [pendingPercent, setPendingPercent] = useState(initialPendingPercent);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const fetchAnswerRate = async () => {
      setIsSyncing(true);

      try {
        const response = await fetch(`/api/lecturer/answer-rate?t=${Date.now()}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const payload: AnswerRatePayload = await response.json();
        if (!active) {
          return;
        }

        setAnsweredPercent(payload.answeredPercent);
        setPendingPercent(payload.pendingPercent);
      } catch {
        // Keep current values when polling fails.
      } finally {
        if (active) {
          setIsSyncing(false);
        }
      }
    };

    const poll = async () => {
      await fetchAnswerRate();
      if (active) {
        timeoutId = setTimeout(poll, 3000);
      }
    };

    poll();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchAnswerRate();
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <article className="card-shell rounded-2xl p-5">
      <h2 className="mb-4 text-3xl font-semibold">Answer Rate</h2>
      <div className="flex flex-col items-center justify-center py-6">
        <div
          className="relative h-44 w-44 rounded-full"
          style={{
            background: `conic-gradient(#1d4ed8 0% ${answeredPercent}%, #f97316 ${answeredPercent}% 100%)`,
          }}
        >
          <div className="absolute inset-[18px] rounded-full bg-slate-900" />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-6 text-lg">
          <span className="inline-flex items-center gap-2 text-slate-200">
            <span className="h-3 w-3 rounded-full bg-blue-700" />
            Answered ({answeredPercent}%)
          </span>
          <span className="inline-flex items-center gap-2 text-slate-200">
            <span className="h-3 w-3 rounded-full bg-orange-500" />
            Pending ({pendingPercent}%)
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {isSyncing ? 'Syncing...' : 'Live updates every 3s'}
        </p>
      </div>
    </article>
  );
}
