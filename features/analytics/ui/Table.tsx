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
  headers: string[];
  selectedIds: string[];
  getCells: (stats: T) => ReactNode[];
  onRowClick?: (row: TableRow<T>) => void;
  className?: string;
};

const th = "font-normal text-start";

export function Table<T>({
  rows,
  headers,
  getCells,
  selectedIds,
  onRowClick,
  className,
}: TableProps<T>) {
  const hasSelection = selectedIds.length > 0;

  return (
    <table className={cn("text-sm [&_th]:h-12 [&_td]:h-12", className)}>
      <thead>
        <tr className="border-b border-extra-faint text-[13px] text-subtle">
          {headers.map((header) => (
            <th key={header} className={th}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const selected = selectedIds.includes(row.id);

          const cells = row.stats
            ? getCells(row.stats)
            : headers.slice(1).map((header) => (
                <span key={header} className="text-subtle">
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

                selected && "border-l-4 border-l-fg/40 bg-raised/80",

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
