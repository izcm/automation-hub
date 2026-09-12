"use client";

import { cn } from "@/lib/cn";
import type { EuInspectionRow } from "@/features/eu-inspections";
import { getDaysUntil } from "@a2zb/lib";
import { getInspectionStatus, STATUS_COLOR, STATUS_LABELS } from "../../logic";

type Props = {
  rows: EuInspectionRow[];
};

const MAX_ROWS = 4;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// soonest still-upcoming attempt, if any — that's the "next inspection at"
// date; a rejected-with-no-rebooking or approved inspection has none.
function getNextInspectionAt(row: EuInspectionRow): string | null {
  const upcoming = row.attempts
    .filter((attempt) => attempt.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date));

  return upcoming[0]?.date ?? null;
}

export function EuInspectionsTable({ rows }: Props) {
  const visible = rows.slice(0, MAX_ROWS);
  const remaining = rows.length - visible.length;

  return (
    <table className="w-full text-sm [&_td]:h-10">
      <thead>
        <tr className="border-b border-extra-faint text-[13px] text-subtle">
          <th className="p-2 font-normal text-start">Vehicle</th>
          <th className="p-2 font-normal text-start">Status</th>
          <th className="p-2 font-normal text-start">Due date</th>
          <th className="p-2 font-normal text-start">Next inspection at</th>
          <th className="p-2 font-normal text-start">Responsible</th>
        </tr>
      </thead>
      <tbody>
        {visible.map((row, i) => {
          const nextInspectionAt = getNextInspectionAt(row);
          const status = getInspectionStatus(row);
          const daysUntil = getDaysUntil(row.dueDate);

          return (
            <tr
              key={row.id}
              className={cn(
                "border-b border-extra-faint",
                remaining === 0 && i === visible.length - 1 && "border-none",
              )}
            >
              <td className="p-2 tabular-nums">{row.vehicle.plateNumber}</td>
              <td className="p-2">
                <span className={cn("badge", `badge--${STATUS_COLOR[status]}`)}>
                  {STATUS_LABELS[status]}
                </span>
              </td>
              <td className="p-2 tabular-nums">
                {formatDate(row.dueDate)}
                {daysUntil < 0 && " (overdue)"}
              </td>
              <td className="p-2 tabular-nums">
                {nextInspectionAt ? formatDate(nextInspectionAt) : "N/A"}
              </td>
              <td className="p-2">{row.vehicle.employee?.name ?? "—"}</td>
            </tr>
          );
        })}

        {remaining > 0 && (
          <tr className="border-none">
            <td className="p-2 text-subtle" colSpan={5}>
              +{remaining}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
