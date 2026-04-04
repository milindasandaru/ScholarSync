import * as React from "react";
import clsx from "clsx";

const cn = (...classes: any[]) => clsx(classes);

const Table = ({ className = "", ...props }) => (
  <div className={cn("w-full overflow-auto", className)} {...props} />
);

const TableHeader = ({ className = "", ...props }) => (
  <div className={cn("border-b", className)} {...props} />
);

const TableBody = ({ className = "", ...props }) => (
  <div className={cn("divide-y", className)} {...props} />
);

const TableRow = ({ className = "", ...props }) => (
  <div className={cn("flex", className)} {...props} />
);

const TableHead = ({ className = "", ...props }) => (
  <div className={cn("px-4 py-2 font-medium", className)} {...props} />
);

const TableCell = ({ className = "", ...props }) => (
  <div className={cn("px-4 py-2", className)} {...props} />
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };