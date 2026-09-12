import { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Table, th } from "@/features/analytics/ui/Table";

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
  filteredRows: EmployeeInspectionRow[];
  selectedIds: string[];
  relevantColumns?: string[];
  onRowClick?: (id: string) => void;
};

export function ResponsibleEmployeesTable({
  rows,
  filteredRows,
  selectedIds,
  relevantColumns,
  onRowClick,
}: Props) {
  const displayRows = rows.map((row) => ({
    id: row.id,
    label: row.name,
    stats: filteredRows.find((filtered) => filtered.id === row.id),
  }));

  return (
    <Table
      relevantColumns={relevantColumns}
      headers={[
        <th key="employee" className={`${th} w-1/3`}>
          Employee
        </th>,
        <th key="due" className={th}>
          Due
        </th>,
        <th key="approved" className={`${th} truncate`}>
          Approved
        </th>,
        <th key="rejected" className={`${th} w-1/4`}>
          Rejected
        </th>,
        <th key="unresolved" className={`${th} truncate`}>
          Unresolved
        </th>,
      ]}
      rows={displayRows}
      createEmpty={() => ({
        due: 0,
        rejected: 0,
        approved: 0,
        rejectedBooked: 0,
        unresolved: 0,
      })}
      selectedIds={selectedIds}
      getCells={(stats, isRelevant) => {
        const cell = (keys: string | string[], content: ReactNode) =>
          isRelevant(keys) ? content : <span className="text-subtle">–</span>;

        return [
          <span key="due" className="tabular-nums">
            {stats.due}
          </span>,

          <span key="approved" className="tabular-nums text-subtle">
            {cell("approved", stats.approved)}
          </span>,

          <div key="rejected" className="flex items-center gap-3">
            {cell(
              ["rejectedBooked", "rejectedUnbooked"],
              <>
                <span
                  className={cn(
                    "tabular-nums",
                    stats.rejected === 0 ? "text-subtle" : "text-critical",
                  )}
                >
                  {stats.rejected}
                </span>

                {stats.rejected > 0 && (
                  <span
                    className={cn(
                      "text-xs rounded-full border px-1.5 py-0.5",
                      stats.rejectedBooked > 0
                        ? "text-advisory border-advisory/40 bg-advisory/10"
                        : "text-critical border-critical/40 bg-critical/10",
                    )}
                  >
                    {stats.rejectedBooked} booked
                  </span>
                )}
              </>,
            )}
          </div>,

          <span
            key="unresolved"
            className={cn(
              "tabular-nums",
              stats.unresolved === 0 ? "text-subtle" : "text-caution",
            )}
          >
            {cell("unresolved", stats.unresolved)}
          </span>,
        ];
      }}
      onRowClick={(row) => onRowClick?.(row.id)}
      className={"w-full table-fixed [&_td]:px-2 [&_th]:px-2 [&_td]:truncate"}
    />
  );
}
