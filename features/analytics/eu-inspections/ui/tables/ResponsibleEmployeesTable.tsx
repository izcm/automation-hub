"use client";

import { cn } from "@/lib/cn";

export type EmployeeInspectionRow = {
  id: string;
  name: string;
  due: number;
  approved: number;
  rejected: number;
  rejectedBooked: number;
  unresolved: number;
};

type Props = {
  rows: EmployeeInspectionRow[];
  onRowClick?: (row: EmployeeInspectionRow) => void;
};

const th = "font-normal text-start";

export function ResponsibleEmployeesTable({ rows, onRowClick }: Props) {
  return (
    <table className="h-full w-full text-sm [&_th]:p-2 [&_td]:p-2">
      <thead>
        <tr className="border-b border-extra-faint text-[13px] text-subtle">
          <th className={th}>Employee</th>
          <th className={th}>Due</th>
          <th className={th}>Approved</th>
          <th className={th}>Rejected</th>
          <th className={th}>Unresolved</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "hover:bg-fg/5",
              "border-b border-extra-faint cursor-pointer",
              i === rows.length - 1 && "border-none",
            )}
          >
            <td>{row.name}</td>
            <td className="tabular-nums">{row.due}</td>
            <td className="tabular-nums">{row.approved}</td>
            <td>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "tabular-nums",
                    row.rejected === 0 ? "text-subtle" : "text-critical",
                  )}
                >
                  {row.rejected}
                </span>
                {row.rejected > 0 && (
                  <span
                    className={cn(
                      "text-xs rounded-full border px-1.5 py-0.5",
                      // colors must stay in sync with STATUS_COLOR in ../logic
                      row.rejectedBooked > 0
                        ? "text-advisory border-advisory/40 bg-advisory/10"
                        : "text-critical border-critical/40 bg-critical/10",
                    )}
                  >
                    {row.rejectedBooked} booked
                  </span>
                )}
              </div>
            </td>
            <td
              className={cn(
                "tabular-nums",
                // colors must stay in sync with STATUS_COLOR in ../logic
                row.unresolved === 0 ? "text-subtle" : "text-caution",
              )}
            >
              {row.unresolved}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
