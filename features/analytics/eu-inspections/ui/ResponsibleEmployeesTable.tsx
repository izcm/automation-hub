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
  // onRowClick
};

function color(wantedScenario: number, total: number) {
  if (total === 0) return "text-subtle";
  if (wantedScenario === total) return "text-success";
  if (wantedScenario === 0) return "text-failure";
  return "text-warning";
}

export function ResponsibleEmployeesTable({ rows }: Props) {
  return (
    <table className="h-full w-full text-sm overflow-auto">
      <thead>
        <tr className="border-b border-extra-faint text-[13px] text-subtle">
          <th className="p-2 font-normal text-start">Employee</th>
          <th className="p-2 font-normal text-start">Due</th>
          <th className="p-2 font-normal text-start">Approved</th>
          <th className="p-2 font-normal text-start">Rejected</th>
          <th className="p-2 font-normal text-start">Unresolved</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.id}
            className={cn(
              "border-b border-extra-faint",
              i === rows.length - 1 && "border-none",
            )}
          >
            <td className="p-2">{row.name}</td>
            <td className="p-2 tabular-nums">{row.due}</td>
            <td
              className={cn("p-2 tabular-nums", color(row.approved, row.due))}
            >
              {row.approved}/{row.due}
            </td>
            <td className="p-2">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "tabular-nums",
                    row.rejected === 0 ? "text-subtle" : "text-failure",
                  )}
                >
                  {row.rejected}
                </span>
                {row.rejected > 0 && (
                  <span
                    className={cn(
                      "text-xs rounded-full border px-1.5 py-0.5",
                      row.rejectedBooked > 0
                        ? "text-warning border-warning/40 bg-warning/10"
                        : "text-failure border-failure/40 bg-failure/10",
                    )}
                  >
                    {row.rejectedBooked} booked
                  </span>
                )}
              </div>
            </td>
            <td
              className={cn(
                "p-2 tabular-nums",
                row.unresolved === 0 ? "text-subtle" : "text-warning",
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
