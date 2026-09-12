"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/cn";

type TableRow<T> = {
  id: string;
  label: string;
  stats: T | undefined;
};

// column relevance — separate from row selection (selectedIds). Empty/omitted
// means everything is relevant; otherwise a key (or any of several keys) is
// relevant only if it's in this list. Purely a helper handed to getCells —
// Table doesn't know what the keys mean or how to render "not relevant".
type IsRelevant = (keys: string | string[]) => boolean;

type TableProps<T> = {
  rows: TableRow<T>[];
  headers: ReactNode[]; // passing headers as react node so we easier can set width on columns
  selectedIds: string[];
  relevantColumns?: string[];
  createEmpty: () => T;
  getCells: (stats: T, isRelevant: IsRelevant) => ReactNode[];
  onRowClick?: (row: TableRow<T>) => void;
  className?: string;
};

// base <th> styling — spread onto each header you pass in, e.g.
// <th key="due" className={cn(th, "w-20")}>Due</th>
export const th = "font-normal text-start";

// plain <th> per label, no className — for callers that don't need
// per-column width/styling control and just want the labels rendered.
export function defaultHeaders(labels: string[]): ReactNode[] {
  return labels.map((label) => <th key={label}>{label}</th>);
}

export function Table<T>({
  rows,
  headers,
  getCells,
  selectedIds,
  relevantColumns,
  createEmpty,
  onRowClick,
  className,
}: TableProps<T>) {
  const hasSelection = selectedIds.length > 0;

  const isRelevant: IsRelevant = (keys) =>
    !relevantColumns ||
    relevantColumns.length === 0 ||
    (Array.isArray(keys) ? keys : [keys]).some((key) =>
      relevantColumns.includes(key),
    );
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
            ? getCells(stats, isRelevant)
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
