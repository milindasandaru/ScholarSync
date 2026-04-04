'use client';

import { useActionState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteQuestionAction, updateQuestionModuleAction } from '@/actions/qna.actions';
import { useNotificationStore } from '@/lib/store';

type ModuleOption = {
  code: string;
  label: string;
};

type QuestionModerationControlsProps = {
  questionId: string;
  currentModuleCode: string;
  moduleOptions: ModuleOption[];
};

const INITIAL_STATE = { success: false, message: '' };

export function QuestionModerationControls({
  questionId,
  currentModuleCode,
  moduleOptions,
}: QuestionModerationControlsProps) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [updateState, updateAction, isUpdating] = useActionState(
    updateQuestionModuleAction,
    INITIAL_STATE,
  );
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (updateState.success) {
      showNotification(updateState.message, 'success');
      router.refresh();
    }
  }, [updateState.success, updateState.message, router, showNotification]);

  const handleDeleteQuestion = () => {
    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.set('questionId', questionId);
      const result = await deleteQuestionAction(INITIAL_STATE, formData);
      showNotification(result.message, result.success ? 'success' : 'error');
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <form action={updateAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="questionId" value={questionId} />
        <select
          name="moduleCode"
          defaultValue={currentModuleCode}
          className="field-shell h-9 min-w-48 rounded-lg px-3 text-sm text-slate-200"
          disabled={isUpdating || isDeleting}
        >
          {moduleOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isUpdating || isDeleting}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-70"
        >
          {isUpdating ? 'Saving...' : 'Change Module'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleDeleteQuestion}
        disabled={isUpdating || isDeleting}
        className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-70"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isDeleting ? 'Deleting...' : 'Delete Question'}
      </button>

      {updateState.message ? (
        <p className={`text-xs ${updateState.success ? 'text-emerald-400' : 'text-red-400'}`}>
          {updateState.message}
        </p>
      ) : null}
    </div>
  );
}
