'use client';

import { useActionState, useEffect, useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createModuleAction } from '@/actions/lecturer.actions';

const INITIAL_CREATE_MODULE_STATE = {
  success: false,
  message: '',
};

export function AddModuleDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createModuleAction,
    INITIAL_CREATE_MODULE_STATE,
  );

  useEffect(() => {
    if (state.success) {
      alert(state.message);
      setOpen(false);
    }
  }, [state.success, state.message]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        type="button"
      >
        <PlusCircle className="h-4 w-4" />
        Add Module
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span className="text-xl font-semibold text-slate-900">Add Module</span>
            </DialogTitle>
          </DialogHeader>

          <form action={formAction} className="space-y-4 text-slate-900">
            <div className="space-y-2">
              <Label>
                <span className="text-sm font-medium text-slate-700">Module Code</span>
              </Label>
              <Input
                name="moduleCode"
                placeholder="CS501"
                maxLength={20}
                pattern="^[A-Za-z]{2}[0-9]+$"
                className="rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                <span className="text-sm font-medium text-slate-700">Module Name</span>
              </Label>
              <Input
                name="moduleName"
                placeholder="Machine Learning"
                maxLength={100}
                pattern="^[A-Z][a-zA-Z ]*$"
                className="rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {state.message ? (
              <p
                className={`text-sm ${
                  state.success ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {state.message}
              </p>
            ) : null}

            <DialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isPending ? 'Adding...' : 'Add Module'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
