'use client';

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteModuleAction, updateModuleAction } from '@/actions/lecturer.actions';
import { useNotificationStore } from '@/lib/store';

type ModuleManagementControlsProps = {
  moduleCode: string;
  moduleName: string;
};

const INITIAL_STATE = {
  success: false,
  message: '',
};

export function ModuleManagementControls({ moduleCode, moduleName }: ModuleManagementControlsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [updateState, updateAction, isUpdating] = useActionState(updateModuleAction, INITIAL_STATE);

  const canSubmit = useMemo(() => !isUpdating && !isDeleting, [isUpdating, isDeleting]);

  useEffect(() => {
    if (updateState.success) {
      setOpen(false);
      showNotification(updateState.message, 'success');
      router.refresh();
    }
  }, [updateState.success, updateState.message, router, showNotification]);

  const handleDeleteModule = () => {
    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.set('moduleCode', moduleCode);

      const result = await deleteModuleAction(INITIAL_STATE, formData);
      showNotification(result.message, result.success ? 'success' : 'error');

      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-3 text-slate-400">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:text-slate-200"
        aria-label="Edit module"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={handleDeleteModule}
        className="hover:text-red-400 disabled:opacity-70"
        aria-label="Delete module"
        disabled={!canSubmit}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span className="text-xl font-semibold text-slate-900">Edit Module</span>
            </DialogTitle>
          </DialogHeader>

          <form action={updateAction} className="space-y-4 text-slate-900">
            <input type="hidden" name="currentCode" value={moduleCode} />

            <div className="space-y-2">
              <Label>
                <span className="text-sm font-medium text-slate-700">Module Code</span>
              </Label>
              <Input
                name="moduleCode"
                defaultValue={moduleCode}
                placeholder="CS501"
                maxLength={20}
                pattern="^[A-Za-z]{2}[0-9]+$"
                required
                className="rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label>
                <span className="text-sm font-medium text-slate-700">Module Name</span>
              </Label>
              <Input
                name="moduleName"
                defaultValue={moduleName}
                placeholder="Machine Learning"
                maxLength={100}
                pattern="^[A-Z][a-zA-Z ]*$"
                required
                className="rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {updateState.message ? (
              <p className={`text-sm ${updateState.success ? 'text-green-600' : 'text-red-600'}`}>
                {updateState.message}
              </p>
            ) : null}

            <DialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300"
                disabled={!canSubmit}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                disabled={!canSubmit}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
