import { cn } from "@/lib/cn";
import { Table } from "@/features/analytics/ui/Table";

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
  onRowClick?: (id: string) => void;
};

export function ResponsibleEmployeesTable({
  rows,
  filteredRows,
  selectedIds,
  onRowClick,
}: Props) {
  const displayRows = rows.map((row) => ({
    id: row.id,
    label: row.name,
    stats: filteredRows.find((filtered) => filtered.id === row.id),
  }));

  return (
    <Table
      headers={["Employee", "Due", "Approved", "Rejected", "Unresolved"]}
      rows={displayRows}
      selectedIds={selectedIds}
      getCells={(stats) => [
        <span key="due" className="tabular-nums">
          {stats.due}
        </span>,

        <span key="approved" className="tabular-nums">
          {stats.approved}
        </span>,

        <div key="rejected" className="flex items-center gap-3">
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
        </div>,

        <span
          key="unresolved"
          className={cn(
            "tabular-nums",
            stats.unresolved === 0 ? "text-subtle" : "text-caution",
          )}
        >
          {stats.unresolved}
        </span>,
      ]}
      onRowClick={(row) => onRowClick?.(row.id)}
      className={"w-full [&_td]:px-2 [&_th]:px-2"}
    />
  );
}
