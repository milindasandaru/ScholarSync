import * as React from "react";
import { clsx } from "clsx";
const cn = clsx;

export const Dialog = ({ open, onOpenChange, children }: any) => (
  open ? <div className="fixed inset-0 flex items-center justify-center bg-black/40">{children}</div> : null
);

export const DialogContent = ({ children }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">{children}</div>
);

export const DialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>;

export const DialogTitle = ({ children }: any) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export const DialogFooter = ({ children }: any) => (
  <div className="flex justify-end gap-2 mt-4">{children}</div>
);