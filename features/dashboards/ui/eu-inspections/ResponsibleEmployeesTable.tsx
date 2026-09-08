"use client";

import { ClickPopover } from "@a2zb/react";
import { cn } from "@/lib/cn";
import { Info } from "@/components/icons";

export type EmployeeInspectionRow = {
  id: string;
  name: string;
  euInspectionsNext30Days: number;
  euInspectionsWithNotifications: number;
  hasVacation: boolean;
};

type Props = {
  rows: EmployeeInspectionRow[];
};

function notifiedColor(sent: number, total: number) {
  if (total === 0) return "text-subtle";
  if (sent === total) return "text-success";
  if (sent === 0) return "text-failure";
  return "text-warning";
}

export function ResponsibleEmployeesTable({ rows }: Props) {
  return (
    <table className="h-full w-full text-sm overflow-auto">
      <thead>
        <tr className="border-b border-extra-faint text-[12px] text-subtle">
          <th rowSpan={2} className="p-2 font-normal text-start">
            Employee
          </th>
          <th colSpan={3} className="p-2 font-normal text-center">
            Next 30 days
          </th>
        </tr>
        <tr className="border-b border-extra-faint text-[12px] text-subtle">
          <th className="p-2 font-normal text-start">Inspections</th>
          <th className="p-2 font-normal text-start">Notified</th>
          <th className="p-2 font-normal text-start">Vacation</th>
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
            <td className="p-2">{row.euInspectionsNext30Days}</td>
            <td
              className={cn(
                "p-2 tabular-nums",
                notifiedColor(
                  row.euInspectionsWithNotifications,
                  row.euInspectionsNext30Days,
                ),
              )}
            >
              {row.euInspectionsWithNotifications}/{row.euInspectionsNext30Days}
            </td>
            <td className="p-2">
              {row.hasVacation ? (
                <span className="inline-flex items-center gap-1 text-warning">
                  Yes
                  <ClickPopover
                    align="left"
                    contentClassName="whitespace-normal w-56"
                    trigger={
                      <button
                        type="button"
                        aria-label="Vacation info"
                        className="text-warning"
                      >
                        <Info size={14} />
                      </button>
                    }
                  >
                    <p className="text-sm">Has vacation in this timespan.</p>
                  </ClickPopover>
                </span>
              ) : (
                "No"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
