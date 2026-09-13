"use client";

import { IconLink } from "@a2zb/next";
import { getDaysUntil } from "@a2zb/lib";

import { cn } from "@/lib/cn";
import { GoTo, Overdue } from "@/components/icons";
import type { EuInspectionRow } from "../../types";
import { getInspectionStatus, STATUS_COLOR, STATUS_LABELS } from "../../logic";

type Props = {
  rows: EuInspectionRow[];
  // "+N more, view details" footer — remaining count and where "view
  // details" goes both come from the consumer, which knows the full
  // (unsliced) count and the workspace link; this table just renders it.
  remaining?: number;
  workspaceHref?: string;
};

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

export function EuInspectionsTable({ rows, remaining, workspaceHref }: Props) {
  return (
    <>
      <table
        className="
        w-full table-fixed [&_td]:px-2 [&_th]:px-2 [&_td]:truncate text-sm
        text-sm [&_th]:h-10 [&_td]:h-10
    "
      >
        <thead>
          <tr className="border-b border-extra-faint text-[13px] text-subtle">
            <th className="font-normal text-start w-2/12">Vehicle</th>
            <th className="font-normal text-start w-3/12">Status</th>
            <th className="font-normal text-start w-2/12">Due date</th>
            <th className="font-normal text-start w-2/12 truncate">
              New attempt at
            </th>
            <th className="font-normal text-start w-3/12">Responsible</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const nextInspectionAt = getNextInspectionAt(row);
            const status = getInspectionStatus(row);
            const daysUntil = getDaysUntil(row.dueDate);

            return (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-extra-faint",
                  i === rows.length - 1 && !remaining && "border-none",
                )}
              >
                <td className="tabular-nums">{row.vehicle.plateNumber}</td>
                <td className="min-w-0 truncate">
                  <span
                    className={cn(
                      "badge",
                      `badge--${STATUS_COLOR[status]}`,
                      "truncate",
                    )}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                </td>
                <td className="tabular-nums">
                  <span className="inline-flex items-center gap-2">
                    {formatDate(row.dueDate)}
                    {daysUntil < 0 && (
                      <Overdue size={14} color="var(--warning)" />
                    )}
                  </span>
                </td>
                <td className="tabular-nums">
                  {nextInspectionAt ? formatDate(nextInspectionAt) : "–"}
                </td>
                <td className="">{row.vehicle.employee?.name ?? "—"}</td>
              </tr>
            );
          })}

          {!!remaining && remaining > 0 && (
            <tr className="border-none">
              <td className="text-sm text-subtle" colSpan={5}>
                <span className="px-1"> +{remaining}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
