"use client";

import { cn } from "@/lib/cn";
import type { EuInspectionRow } from "@/features/eu-inspections";
import { getDaysUntil } from "@a2zb/lib";
import { getInspectionStatus, STATUS_LABELS, type Status } from "../logic";

type Props = {
  rows: EuInspectionRow[];
};

const MAX_ROWS = 5;

const STATUS_BADGE_CLASSES: Record<Status, string> = {
  approved: "badge--success",
  rejectedBooked: "badge--warning",
  rejectedUnbooked: "badge--danger",
  upcoming: "badge--accent",
  unresolved: "badge--neutral",
  unexpectedCase: "badge--neutral",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// overdue/imminent due dates get flagged the same way the bar chart's time
// buckets do — red once it's past due, amber once it's within the week.
function dueDateClasses(daysUntil: number): string {
  if (daysUntil < 0) return "text-failure";
  if (daysUntil <= 7) return "text-warning";
  return "";
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
    <table className="h-full w-full text-sm overflow-auto ">
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
              <td className="p-2">{row.vehicle.plateNumber}</td>
              <td className="p-2">
                <span className={cn("badge", STATUS_BADGE_CLASSES[status])}>
                  {STATUS_LABELS[status]}
                </span>
              </td>
              <td className={cn("p-2 tabular-nums", dueDateClasses(daysUntil))}>
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
