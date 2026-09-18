import { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Table, th } from "@/components/analytics/Table";
import type { AssignmentInspectionRow } from "../../../logic/dashboard-aggregates";

type Props = {
  rows: AssignmentInspectionRow[];
  filteredRows: AssignmentInspectionRow[];
  selectedIds: string[];
  // true when some but not all of the ids folded into "Others" are
  // selected — the row still shows as selected either way (it's in
  // selectedIds), this only decides whether its label calls that out.
  othersPartiallySelected?: boolean;
  othersSelectedCount?: number;
  relevantColumns?: string[];
  onRowClick?: (id: string) => void;
};

export function AssignmentsTable({
  rows,
  filteredRows,
  selectedIds,
  othersPartiallySelected,
  othersSelectedCount,
  relevantColumns,
  onRowClick,
}: Props) {
  const displayRows = rows.map((row) => ({
    id: row.id,
    label:
      row.id === "others" && othersPartiallySelected
        ? `${row.name} — ${othersSelectedCount} selected`
        : row.name,
    stats: filteredRows.find((filtered) => filtered.id === row.id),
  }));

  return (
    <Table
      relevantColumns={relevantColumns}
      headers={[
        <th key="assignment" className={`${th} w-1/3`}>
          Assignment
        </th>,
        <th key="total" className={`${th} truncate`}>
          Total
        </th>,
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
        total: 0,
        approved: 0,
        rejected: 0,
        unresolved: 0,
        firstAttempt: 0,
      })}
      selectedIds={selectedIds}
      getCells={(stats, isRelevant) => {
        const cell = (keys: string | string[], content: ReactNode) =>
          isRelevant(keys) ? content : <span className="text-subtle">–</span>;

        return [
          <span key="total" className="tabular-nums text-subtle">
            {stats.total}
          </span>,

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
