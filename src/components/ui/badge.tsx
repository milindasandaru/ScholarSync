import * as React from "react";
import { clsx } from "clsx";
const cn = clsx;

export const Badge = ({ className = "", children, variant }: any) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      variant === "secondary" ? "bg-gray-200" : "bg-blue-200",
      className
    )}
  >
    {children}
  </span>
);