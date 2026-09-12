"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/cn";

type TableRow<T> = {
  id: string;
  label: string;
  stats: T | undefined;
};

type TableProps<T> = {
  rows: TableRow<T>[];
  headers: ReactNode[]; // passing headers as react node so we easier can set width on columns
  selectedIds: string[];
  createEmpty: () => T;
  getCells: (stats: T) => ReactNode[];
  onRowClick?: (row: TableRow<T>) => void;
  className?: string;
};

// base <th> styling — spread onto each header you pass in, e.g.
// <th key="due" className={cn(th, "w-20")}>Due</th>
export const th = "font-normal text-start";

export function Table<T>({
  rows,
  headers,
  getCells,
  selectedIds,
  createEmpty,
  onRowClick,
  className,
}: TableProps<T>) {
  const hasSelection = selectedIds.length > 0;

  return (
    <table className={cn("text-sm [&_th]:h-12 [&_td]:h-12", className)}>
      <thead>
        <tr className="border-b border-extra-faint text-[13px] text-subtle">
          {/* passing headers as react node so we easier can set width on columns */}
          {headers}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const selected = selectedIds.includes(row.id);
          const active = !hasSelection || selected;

          // Missing stats can mean two things when there is a selection:
          // - row is not selected → show "—"
          // - row is selected, but other filters removed all its items before aggregation
          //   → the aggregated row doesn't exist, so create() provides its empty state
          const stats = active ? (row.stats ?? createEmpty()) : undefined;

          const cells = stats
            ? getCells(stats)
            : // asssumes first header is the row label
              headers.slice(1).map((_, i) => (
                <span key={i} className="text-subtle">
                  —
                </span>
              ));

          return (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "cursor-pointer border-b border-extra-faint transition-colors",
                "hover:bg-fg/5",
                "border-l-3 border-l-transparent",

                selected && "border-l-3 border-l-fg/40 bg-raised/80",

                hasSelection && !selected && "opacity-50 hover:opacity-80",
              )}
            >
              <td>{row.label}</td>
              {cells.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
