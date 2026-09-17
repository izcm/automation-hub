import { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Table, th } from "@/features/analytics/ui/Table";

export type EmployeeInspectionRow = {
  id: string;
  name: string;
  due: number;
  firstAttempt: number;
  approved: number;
  rejected: number;
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
        // <th key="due" className={th}>
        //   Due
        // </th>,
        // <th key="approved" className={`${th} truncate`}>
        //   Approved
        // </th>,
        <th key="firstAttempt" className={`${th} truncate`}>
          First attempt
        </th>,
        <th key="rejected" className={`${th}`}>
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
        unresolved: 0,
        firstAttempt: 0,
      })}
      selectedIds={selectedIds}
      getCells={(stats, isRelevant) => {
        const cell = (keys: string | string[], content: ReactNode) =>
          isRelevant(keys) ? content : <span className="text-subtle">–</span>;

        return [
          // <span key="due" className="tabular-nums">
          //   {stats.due}
          // </span>,

          // <span key="approved" className="tabular-nums text-subtle">
          //   {cell("approved", stats.approved)}
          // </span>,

          <span
            key="firstAttempt"
            className={cn(
              "tabular-nums",
              stats.firstAttempt === 0 ? "text-subtle" : "text-advisory",
            )}
          >
            {cell("firstAttempt", stats.firstAttempt)}
          </span>,

          <span
            key="rejected"
            className={cn(
              "tabular-nums",
              stats.rejected === 0 ? "text-subtle" : "text-critical",
            )}
          >
            {cell("rejected", stats.rejected)}
          </span>,

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
