import { Table, th } from "@/components/analytics/Table";
import { InitialsBadge } from "@/components/molecules";
import { Users } from "@/components/icons";

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
    label: (
      <div className="flex items-center gap-4">
        {row.id === "others" ? (
          // "Others (N)" isn't a real name — deriving initials from it
          // (e.g. "O(") reads as broken, and even a clean 2-letter result
          // (e.g. "OT") could be mistaken for a real employee's initials.
          // An icon can't be confused with letters either way.
          <div className="flex items-center justify-center rounded-full bg-ground/25 border border-accent/25 size-8">
            <Users size={14} className="text-accent-strong" />
          </div>
        ) : (
          <InitialsBadge size="sm" label={row.name} />
        )}
        {row.name}
      </div>
    ),
    stats: filteredRows.find((filtered) => filtered.id === row.id),
  }));

  return (
    <Table
      headers={[
        <th key="employee" className={`${th} w-2/3`}>
          Employee
        </th>,
        <th key="due" className={th}>
          Total
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
      getCells={(stats) => [
        <span key="due" className="tabular-nums text-subtle">
          {stats.due}
        </span>,
      ]}
      onRowClick={(row) => onRowClick?.(row.id)}
      className={"w-full table-fixed [&_td]:px-2 [&_th]:px-2 [&_td]:truncate"}
    />
  );
}
