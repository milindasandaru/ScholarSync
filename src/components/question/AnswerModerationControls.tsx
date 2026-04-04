'use client';

import { useActionState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteAnswerAction, moveAnswerToQuestionAction } from '@/actions/qna.actions';
import { useNotificationStore } from '@/lib/store';

type MoveTarget = {
  id: string;
  title: string;
  moduleLabel: string | null;
};

type AnswerModerationControlsProps = {
  answerId: string;
  currentQuestionId: string;
  moveTargets: MoveTarget[];
};

const INITIAL_STATE = {
  success: false,
  message: '',
};

export function AnswerModerationControls({
  answerId,
  currentQuestionId,
  moveTargets,
}: AnswerModerationControlsProps) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [moveState, moveAction, isMoving] = useActionState(moveAnswerToQuestionAction, INITIAL_STATE);
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (moveState.success) {
      showNotification(moveState.message, 'success');
      router.refresh();
    }
  }, [moveState.success, moveState.message, router, showNotification]);

  const handleDeleteAnswer = () => {
    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.set('answerId', answerId);
      formData.set('questionId', currentQuestionId);
      const result = await deleteAnswerAction(INITIAL_STATE, formData);
      showNotification(result.message, result.success ? 'success' : 'error');
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <form action={moveAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="answerId" value={answerId} />
        <input type="hidden" name="currentQuestionId" value={currentQuestionId} />

        <select
          name="targetQuestionId"
          className="field-shell h-9 min-w-56 rounded-lg px-3 text-xs text-slate-200"
          defaultValue={moveTargets[0]?.id ?? ''}
          disabled={isMoving || isDeleting || moveTargets.length === 0}
        >
          {moveTargets.map((target) => (
            <option key={target.id} value={target.id}>
              {(target.moduleLabel ? `${target.moduleLabel} | ` : '') + target.title}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isMoving || isDeleting || moveTargets.length === 0}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-70"
        >
          {isMoving ? 'Moving...' : 'Move Answer'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleDeleteAnswer}
        disabled={isMoving || isDeleting}
        className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-70"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isDeleting ? 'Deleting...' : 'Delete Answer'}
      </button>

      {moveState.message ? (
        <p className={`text-xs ${moveState.success ? 'text-emerald-400' : 'text-red-400'}`}>
          {moveState.message}
        </p>
      ) : null}
    </div>
  );
}
